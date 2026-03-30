# 1. 同步服务器的图片到本地 uploads 目录
# 语法: rsync -avz <服务器用户名>@<服务器IP>:<服务器项目绝对路径>/uploads/ <本地项目绝对路径>/uploads/
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/uploads/ ./uploads/

# 2. 同步服务器的数据库到本地 prisma 目录
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/prisma/dev.db ./prisma/dev.db

太棒了！将项目正式推向生产环境（Production）是一个激动人心的里程碑。要让你的系统在公网服务器上安全、稳定地运行，我们需要对现有的开发配置进行一次“全面升格”。

以下是上线前必须修改和确认的核心清单，主要集中在**环境变量**、**第三方授权**和**服务器安全防护**这三个方面：

### 1. 环境变量与安全密钥 (`.env`)
这是上线最关键的一步，所有的本地测试地址都必须替换为真实的公网域名。

* **更新 `AUTH_URL`**：
    将局域网 IP 改为你的正式域名，例如：
    `AUTH_URL=https://yourdomain.com`
* **重新生成 `AUTH_SECRET`**：
    绝对不能用本地随便敲的字符串。在服务器终端运行 `openssl rand -base64 32`，生成一串全新的高强度密钥填进去。这是保护你 Cookie 不被伪造的底线。
* **确认 `ADMIN_EMAIL`**：
    再次核对你的管理员邮箱是否拼写正确，这是你后台唯一的通行证。

### 2. GitHub OAuth 后台配置
GitHub 必须知道你的正式域名，否则授权回调会彻底失败。

前往 GitHub -> Settings -> Developer Settings -> OAuth Apps，找到你的应用：
* **Homepage URL** 改为：`https://yourdomain.com`
* **Authorization callback URL** 改为：`https://yourdomain.com/api/auth/callback/github`

### 3. 数据库的迁移与持久化
虽然 SQLite 作为个人博客的数据存储完全够用，但在生产环境中需要注意文件路径。

* 确保 `DATABASE_URL` 指向一个安全且会被定期备份的路径（比如 `file:./production.db`）。
* 在服务器上拉取代码后，记得运行 `npx prisma generate` 生成客户端，并使用 `npx prisma db push` 或 `npx prisma migrate deploy` 初始化表结构。

### 4. Nginx 反向代理与端口隐藏
正式上线时，我们通常不会让 Next.js 直接暴露在 80 或 443 端口，而是让 Nginx 挡在最前面。

* **Nginx 配置**：将请求代理到 Next.js 默认运行的 `localhost:3000`。
* **配置 HTTPS**：使用 Certbot 为 Nginx 配置免费的 Let's Encrypt SSL 证书。Auth.js 在生产环境中强制要求 HTTPS，否则 Cookie 无法安全写入，导致一直让你重新登录。

### 5. 进程守护与构建
千万不要在服务器上用 `npm run dev` 来运行！

* **生产构建**：在服务器上确保你使用的是熟悉的 Node.js 版本（比如 22.18.0），然后执行 `npm run build`。Next.js 会对所有页面进行极致的性能优化和静态化。
* **进程守护**：使用 PM2 来启动项目：`pm2 start npm --name "blog-frontend" -- start`。这样即使服务器重启或程序崩溃，PM2 也会自动帮你把博客拉起来。

### 6. 服务器基础防火墙 (极度重要)
公网环境充满了各种自动化扫描脚本，服务器的端口防护必须做到滴水不漏。

* 配置防火墙（如 UFW 或云服务商的安全组）。
* **严格实行白名单制**：只放行 `80` (HTTP)、`443` (HTTPS) 和你自定义的 SSH 端口。
* **绝对不要暴露 3000 端口**：让 Next.js 的 3000 端口仅限服务器内部的 `127.0.0.1` 访问，所有的外部流量必须经过 Nginx 过滤。


### 第一件套：PM2 进程守护配置

PM2 可以确保你的博客在遇到异常崩溃或者服务器重启时，能够自动“满血复活”。

**1. 在服务器的项目根目录下，新建一个 `ecosystem.config.js` 文件：**

```javascript
module.exports = {
  apps: [
    {
      name: "BolutoBlog", // 你的进程名称
      script: "npm",
      args: "start",
      instances: 1, // 对于小型 VPS，单实例就足够了；如果是多核高配，可以写 "max" 开启集群模式
      autorestart: true, // 崩溃自动重启
      watch: false, // 生产环境千万不要开启 watch，否则一点风吹草动都会重启
      max_memory_restart: "1G", // 内存泄漏保护：超过 1G 自动重启
      env: {
        NODE_ENV: "production",
        PORT: 3000, // 仅在服务器内部监听 3000
      },
    },
  ],
};
```

**2. 启动与保存命令：**
在服务器终端（确保你已经执行过 `npm run build` 并且安装了 PM2）运行以下指令：

```bash
# 安装 PM2 (如果还没装的话)
npm install pm2 -g

# 启动你的博客进程
pm2 start ecosystem.config.js

# 将当前 PM2 进程列表保存，并设置为开机自启
pm2 save
pm2 startup
```

---

### 第二件套：Nginx 反向代理配置

Nginx 就像是你的安保大闸，它站在 80 和 443 端口收发外部流量，然后把干净的请求秘密转发给内部的 3000 端口。

**1. 在服务器上创建 Nginx 配置文件：**
通常在 Ubuntu/Debian 系统中，路径是 `/etc/nginx/sites-available/bolutoblog`。填入以下配置：

```nginx
# 将所有 HTTP (80) 流量强制重定向到 HTTPS (443)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # 替换成你的真实域名
    
    return 301 https://$host$request_uri;
}

# 核心 HTTPS 服务器块
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com; # 替换成你的真实域名

    # 证书路径 (一开始可以先注释掉，等用 Certbot 申请证书时它会自动帮你填好)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # 提高 SSL 安全性的配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 核心：反向代理到 Next.js 内部端口
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # 处理 WebSocket 和 Next.js 的特有请求
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 将用户的真实 IP 传递给你的 Next.js 后台
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件缓存优化 (可选：让 Nginx 直接处理 _next/static，减轻 Node.js 压力)
    location /_next/static/ {
        alias /path/to/your/project/.next/static/; # 替换为你的实际绝对路径
        expires 365d;
        access_log off;
    }
}
```

**2. 激活配置并重启 Nginx：**

```bash
# 创建软链接激活站点
sudo ln -s /etc/nginx/sites-available/bolutoblog /etc/nginx/sites-enabled/

# 测试配置有没有语法错误
sudo nginx -t

# 重启 Nginx 生效
sudo systemctl reload nginx
```

---

### 🛡️ 最后的收尾：收紧防火墙

既然 Nginx 已经接管了流量，请务必在服务器上关掉外部对 3000 端口的直接访问，避免被机器脚本扫描：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # 千万别忘了放行 SSH！
sudo ufw deny 3000/tcp # 封死 3000 端口的外网访问
sudo ufw enable
```

⚠️ **准备工作（极其重要）：**
在敲入以下命令之前，请务必确保你已经在购买域名的服务商（如阿里云、腾讯云、Cloudflare）那里，**将你的域名（比如 `yourdomain.com` 和 `www.yourdomain.com`）的 A 记录解析到了你这台服务器的公网 IP 上**。如果域名还没生效，Certbot 会直接报错。

确认解析生效后，跟着我执行这四个步骤：

### 第一步：安装 Certbot 和 Nginx 插件
在你的 Ubuntu/Debian 服务器终端运行：

```bash
# 更新软件包列表
sudo apt update

# 安装 Certbot 及其 Nginx 专属插件
sudo apt install certbot python3-certbot-nginx -y
```

### 第二步：一键申请并配置证书（见证奇迹）
Certbot 极其聪明，加上 `--nginx` 参数后，它会自动去读取我们之前写好的 Nginx 配置文件，自动申请证书，并**自动帮你修改 Nginx 配置文件**来开启 HTTPS。

把下面的域名替换成你真实的域名，然后运行：

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

运行后，终端会跳出几个交互式问题：
1. **Enter email address:** 输入你的常用邮箱（用于接收证书即将过期或安全漏洞的紧急通知）。
2. **Please read the Terms of Service:** 输入 `Y` 同意服务条款。
3. **Share your email...:** 是否分享邮箱给电子前哨基金会，选 `Y` 或 `N` 都可以。
4. **Choose whether or not to redirect HTTP traffic to HTTPS:** （如果弹出这个选项）**强烈建议选择 `2` (Redirect)**。这会让所有尝试用 HTTP（80端口）访问你网站的人，被强行跳转到安全的 HTTPS（443端口）。

如果一切顺利，你会看到绿色的 **`Congratulations! You have successfully enabled https://yourdomain.com`**。

### 第三步：测试自动续期 (Set and Forget)
Let's Encrypt 的免费证书有效期是 90 天，但 Certbot 在安装时已经自动帮你往系统里塞了一个定时任务（Cron job / Systemd timer），它会在证书过期前自动帮你续期。

我们可以用一条命令“演习”一下续期过程，看看有没有报错：

```bash
sudo certbot renew --dry-run
```
如果输出包含 `Congratulations, all simulated renewals succeeded`，那么恭喜你，你的网站证书将获得永久的自动生命，再也不用管它了！

---

### 🚀 第四步：最后的环境变量闭环（别忘了！）

既然你的网站现在已经穿上了 HTTPS 的防弹衣，别忘了告诉你的 Next.js 和 GitHub！

1. **修改服务器上的 `.env` 文件：**
   将你的地址更新为带有 `https` 的正式域名：
   ```env
   AUTH_URL=https://yourdomain.com
   # 既然已经有了真实的域名，可以把之前内网测试用的 AUTH_TRUST_HOST 删掉了
   ```

2. **重启 PM2 让新配置生效：**
   ```bash
   pm2 restart BolutoBlog
   ```

3. **修改 GitHub OAuth App：**
   去 GitHub 后台，把 Homepage URL 和 Callback URL 里的 `http://192.168...` 全部换成你闪亮的 `https://yourdomain.com`。

大功告成！现在，在浏览器里输入你的域名，看看那个漂亮的小锁，然后顺滑地登录你的管理员后台吧。如果中间遇到任何 Nginx 报错或者 Certbot 失败的提示，随时把日志甩给我！