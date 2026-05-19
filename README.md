# BolutoBlog 服务器部署指南

> **系统要求**：Debian 12 (Bookworm) | **域名**：yuehhhh.top

---

## 项目架构

| 目录 | 服务 | 端口 | 说明 |
|------|------|------|------|
| `frontend/` | Next.js 博客主体 | 3000（内部） | PM2 守护，Nginx 反代 |
| `backend/` | C++ WebSocket 判题后端 | 8080（内部） | PM2 守护，Nginx 反代 |
| `isolate/` | Linux 代码沙箱 | — | 系统级安装，由后端调用 |

> **对外只暴露 80 / 443 端口**，3000 和 8080 均只对 localhost 开放。

---

## 第一步：系统基础软件安装

```bash
# 以 root 身份登录后执行，Debian 12 默认没有 sudo
apt update && apt upgrade -y
apt install -y sudo curl git wget build-essential cmake ninja-build \
  pkg-config libcap-dev libsystemd-dev \
  nginx certbot python3-certbot-nginx \
  ufw unzip
```

### 安装 Node.js 22 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v    # 应显示 v22.x
npm -v
npm install -g pm2
```

### 安装 CMake 3.20+（Debian 12 自带版本可能过低）

```bash
# 先检查系统自带版本
cmake --version

# 如果低于 3.20，通过官方脚本安装最新版
apt remove -y cmake
curl -fsSL https://apt.kitware.com/keys/kitware-archive-latest.asc \
  | gpg --dearmor -o /usr/share/keyrings/kitware-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/kitware-archive-keyring.gpg] \
  https://apt.kitware.com/ubuntu/ focal main" \
  > /etc/apt/sources.list.d/kitware.list
# Debian 12 对应 Ubuntu focal，兼容性良好
apt update
apt install -y cmake

cmake --version    # 应显示 3.20+
```

### 安装 Boost 1.86（从源码编译，Debian 12 仓库版本太旧）

> 编译约需 10-15 分钟，请耐心等待。

```bash
cd /tmp

# 下载 Boost 1.86 源码
wget https://archives.boost.io/release/1.86.0/source/boost_1_86_0.tar.gz
tar -xzf boost_1_86_0.tar.gz
cd boost_1_86_0

# 配置：只编译项目需要的组件 (system, thread, json)
./bootstrap.sh --prefix=/usr/local --with-libraries=system,thread,json

# 编译并安装（使用所有 CPU 核心加速）
./b2 install -j$(nproc) variant=release link=shared threading=multi

# 更新动态链接库缓存
ldconfig

# 验证安装
ls /usr/local/lib/libboost_system*    # 应该能看到 .so 文件
```

---

## 第二步：编译安装 isolate 沙箱

```bash
cd /var/www   # 或者你的工作目录
# 稍后拉项目时 isolate 已包含在 BolutoBlog/isolate/ 目录中
# 这里先继续，第五步会编译它
```

---

## 第三步：拉取项目代码

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/bolutotop/BolutoBlog.git
cd BolutoBlog
```

---

## 第四步：配置前端环境变量

```bash
cd /var/www/BolutoBlog/frontend
nano .env
```

确认 `.env` 内容如下（重点修改标了 ⚠️）：

```env
DATABASE_URL="file:./prisma/production.db"

AUTH_URL=https://yuehhhh.top
AUTH_TRUST_HOST=true

AUTH_GITHUB_ID=Ov23liIsMu9kQ6p0jR5x
AUTH_GITHUB_SECRET=d2625016f3e7ee05b3699c71d5473e0981484290

# ⚠️ 必须重新生成，在服务器上执行：openssl rand -base64 32
AUTH_SECRET=<粘贴生成的新密钥>

ADMIN_EMAIL=t550473838@gmail.com
```

生成新密钥：

```bash
openssl rand -base64 32
```

---

## 第五步：安装前端依赖 & 构建

```bash
cd /var/www/BolutoBlog/frontend

npm install --legacy-peer-deps

# 生成 Prisma 客户端
npx prisma generate

# 初始化数据库（首次部署）
npx prisma db push

# 生产构建（会自动进行类型检查，约 1-2 分钟）
npm run build
```

---

## 第六步：编译 C++ WebSocket 后端

```bash
cd /var/www/BolutoBlog/backend
mkdir -p build && cd build

# 指定 Boost 安装路径（从源码编译的在 /usr/local）
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DBOOST_ROOT=/usr/local \
  -DBoost_NO_SYSTEM_PATHS=ON

make -j$(nproc)

# 验证二进制文件生成
ls -la BlogPlaygroundDaemon

#创建进程管理服务文件
nano /etc/systemd/system/myprogram.service

```
写入以下内容（根据你的实际情况修改路径）：
```
[Unit]
Description=My C++ Backend Service
After=network.target

[Service]
Type=simple
# 你的程序所在的目录
WorkingDirectory=/root/my_cpp_project
# 运行程序的命令（必须写绝对路径）
ExecStart=/root/my_cpp_project/my_program
# 如果程序崩溃，自动重启
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# 重新加载 systemd 配置，让系统识别新服务
sudo systemctl daemon-reload

# 启动程序
sudo systemctl start myprogram

# 设置开机自启
sudo systemctl enable myprogram

# 查看程序当前运行状态（是否在跑，有没有报错）
sudo systemctl status myprogram

# 实时查看程序的输出日志（相当于 tail -f）
sudo journalctl -u myprogram -f
```
---

## 第七步：编译安装 isolate 沙箱

```bash
cd /var/www/BolutoBlog/isolate

# 编译
make

# 安装到系统（需要 root）
make install

# 验证
isolate --version

# 首次初始化沙箱环境（每次服务器重启后需要重新执行）
isolate --cg --init --box-id=0
```

配置开机自动初始化沙箱（创建 systemd 服务）：

```bash
cat > /etc/systemd/system/isolate-init.service << 'EOF'
[Unit]
Description=Initialize isolate sandbox on boot
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'for i in $(seq 0 999); do isolate --cg -b $i --cleanup > /dev/null 2>&1; done'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable isolate-init.service
```

---

## 第八步：PM2 启动两个服务

### 8.1 创建统一的 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：

```bash
cat > /var/www/BolutoBlog/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "BolutoBlog-Frontend",
      script: "npm",
      args: "start",
      cwd: "/var/www/BolutoBlog/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "BolutoBlog-Backend",
      script: "/var/www/BolutoBlog/backend/build/BlogPlaygroundDaemon",
      cwd: "/var/www/BolutoBlog/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        LD_LIBRARY_PATH: "/usr/local/lib",  // Boost 动态库路径
      },
    },
  ],
};
EOF
```

### 8.2 启动并保存

```bash
cd /var/www/BolutoBlog
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 开机自启
pm2 save
pm2 startup
# 按照输出的提示，复制并执行那条 sudo env ... 命令
```

### 8.3 端口冲突排查

如果启动报错，先检查端口是否被占用：

```bash
# 检查 3000 端口是否被占用
ss -tlnp | grep 3000

# 检查 8080 端口是否被占用
ss -tlnp | grep 8080

# 查看占用进程并强制结束
fuser -k 3000/tcp
fuser -k 8080/tcp

# 如果是旧的 PM2 进程残留
pm2 kill
pm2 start ecosystem.config.js
```

---

## 第九步：配置 Nginx 反向代理

```bash
nano /etc/nginx/sites-available/yuehhhh
```

粘贴以下内容：

```nginx
# HTTP → HTTPS 强制跳转
server {
    listen 80;
    listen [::]:80;
    server_name yuehhhh.top www.yuehhhh.top;
    return 301 https://$host$request_uri;
}

# HTTPS 主服务
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yuehhhh.top www.yuehhhh.top;

    # 证书路径（Certbot 申请后自动填入，先注释）
    # ssl_certificate /etc/letsencrypt/live/yuehhhh.top/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yuehhhh.top/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 图片上传大小限制
    client_max_body_size 20M;

    # ── 前端 Next.js ──────────────────────────
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ── 后端 WebSocket (代码执行) ──────────────
    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # ── Next.js 静态资源长效缓存 ──────────────
    location /_next/static/ {
        alias /var/www/BolutoBlog/frontend/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ── 用户上传图片 ──────────────────────────
    location /uploads/ {
        alias /var/www/BolutoBlog/frontend/public/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

激活并测试：

```bash
# 激活站点配置
ln -s /etc/nginx/sites-available/yuehhhh /etc/nginx/sites-enabled/

# 删除默认站点（避免冲突）
rm -f /etc/nginx/sites-enabled/default

# 测试配置语法
nginx -t

# 此时先只用 HTTP 模式跑（443 的 ssl 块先注释掉或注释证书两行）
# 等 Certbot 申请完证书再启用
systemctl reload nginx
```

### Nginx 端口冲突排查

```bash
# 检查 80/443 是否被其他服务占用
ss -tlnp | grep ':80\|:443'

# 常见冲突：Apache2 预装
systemctl stop apache2
systemctl disable apache2

# 重新启动 Nginx
systemctl start nginx
systemctl enable nginx
```

---

## 第十步：申请 SSL 证书

> ⚠️ 执行前确认域名 A 记录已解析到服务器 IP：`ping yuehhhh.top`

```bash
# 一键申请，自动修改 Nginx 配置
certbot --nginx -d yuehhhh.top -d www.yuehhhh.top

# 测试自动续期
certbot renew --dry-run
```

Certbot 完成后，重新加载 Nginx：

```bash
nginx -t && systemctl reload nginx
```

---

## 第十一步：配置防火墙

```bash
# 放行必要端口
ufw allow 22/tcp     # SSH（务必放行！否则会锁死服务器）
ufw allow 80/tcp
ufw allow 443/tcp

# 封死内部端口，禁止外网直接访问
ufw deny 3000/tcp
ufw deny 8080/tcp

# 启用防火墙
ufw enable

# 查看规则
ufw status verbose
```

---

## 第十二步：更新 GitHub OAuth 回调地址

前往 [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) 修改：

| 字段 | 值 |
|------|----|
| Homepage URL | `https://yuehhhh.top` |
| Authorization callback URL | `https://yuehhhh.top/api/auth/callback/github` |

---

## 验证部署

```bash
# 检查进程状态
pm2 status

# 查看前端日志
pm2 logs BolutoBlog-Frontend --lines 50

# 查看后端日志
pm2 logs BolutoBlog-Backend --lines 50

# 测试网站响应
curl -I https://yuehhhh.top

# 检查 Nginx 状态
systemctl status nginx
```

---

## 日常运维

### 更新代码

```bash
cd /var/www/BolutoBlog
git pull

# 前端有变更
cd frontend
npm install          # 依赖有变更时
npx prisma generate  # schema 有变更时
npx prisma db push   # schema 有变更时
npm run build
pm2 restart BolutoBlog-Frontend

# 后端有变更
cd ../backend/build
make -j$(nproc)
pm2 restart BolutoBlog-Backend
```

### 数据库备份

```bash
# 备份到本地
cp /var/www/BolutoBlog/frontend/prisma/production.db \
   /var/www/BolutoBlog/frontend/prisma/production.db.bak.$(date +%Y%m%d)
```

### 同步服务器文件到本地

```bash
# 同步上传的图片
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/public/uploads/ ./frontend/public/uploads/

# 同步数据库
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/prisma/production.db ./frontend/prisma/dev.db
```

---

## 常见问题排查

### Boost 找不到

```bash
# 确认动态库存在
ls /usr/local/lib/libboost_system*

# 重新更新缓存
ldconfig

# 手动指定路径测试
LD_LIBRARY_PATH=/usr/local/lib ./backend/build/BlogPlaygroundDaemon
```

### 端口被占用

```bash
ss -tlnp | grep '3000\|8080\|80\|443'
fuser -k <端口>/tcp
```

### Prisma 报错

```bash
cd /var/www/BolutoBlog/frontend
npx prisma generate
npx prisma db push
pm2 restart BolutoBlog-Frontend
```

### isolate 初始化失败

```bash
# 检查 cgroup 是否挂载
mount | grep cgroup

# 手动初始化单个 box
isolate --cg --init --box-id=0

# 查看详细错误
isolate --cg --init --box-id=0 --verbose
```