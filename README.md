# 1. 同步服务器的图片到本地 uploads 目录
# 语法: rsync -avz <服务器用户名>@<服务器IP>:<服务器项目绝对路径>/uploads/ <本地项目绝对路径>/uploads/
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/uploads/ ./uploads/

# 2. 同步服务器的数据库到本地 prisma 目录
rsync -avz root@你的服务器IP:/var/www/BolutoBlog/frontend/prisma/dev.db ./prisma/dev.db