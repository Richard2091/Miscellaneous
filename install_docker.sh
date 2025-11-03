#!/bin/bash

# Docker离线安装简化脚本
# 通过变量设置Docker包路径

set -e

# 设置Docker包路径变量
DOCKER_PACKAGE_PATH="/data/docker/docker-27.0.3.tgz"  # 修改为你的实际路径
DOCKER_PACKAGE_NAME="docker-27.0.3.tgz"              # 修改为你的包名称

# 组合完整路径（如果只设置了包名，则在当前目录查找）
if [[ "$DOCKER_PACKAGE_PATH" == /* ]]; then
    FULL_PACKAGE_PATH="$DOCKER_PACKAGE_PATH"
else
    FULL_PACKAGE_PATH="$(pwd)/$DOCKER_PACKAGE_NAME"
fi

echo "========================================"
echo "      Docker离线安装脚本"
echo "========================================"
echo "Docker包路径: $FULL_PACKAGE_PATH"

# 检查Docker包是否存在
if [ ! -f "$FULL_PACKAGE_PATH" ]; then
    echo "错误: Docker安装包不存在: $FULL_PACKAGE_PATH"
    echo "请检查 DOCKER_PACKAGE_PATH 变量设置"
    exit 1
fi

# 1. 解压docker包并复制到/usr/bin/
echo "步骤1: 解压并安装Docker二进制文件..."
sudo tar -xzf "$FULL_PACKAGE_PATH" -C /tmp
sudo cp -r /tmp/docker/* /usr/bin/
sudo chmod +x /usr/bin/docker* /usr/bin/containerd* /usr/bin/ctr /usr/bin/runc

# 2. 创建docker.service文件
echo "步骤2: 创建Docker systemd服务..."
sudo tee /etc/systemd/system/docker.service > /dev/null << 'EOF'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock --selinux-enabled=false --default-ulimit nofile=65536:65536
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
EOF

# 3. 设置权限
echo "步骤3: 设置服务文件权限..."
sudo chmod +x /etc/systemd/system/docker.service

# 4. 重新加载systemd
echo "步骤4: 重新加载systemd配置..."
sudo systemctl daemon-reload
systemctl start docker

# 5. 启用Docker服务
echo "步骤5: 启用Docker服务..."
sudo systemctl enable docker

echo "========================================"
echo "Docker离线安装完成!"
echo "========================================"
echo "使用以下命令启动Docker:"
echo "  sudo systemctl start docker"
echo ""
echo "验证安装:"
echo "  sudo docker --version"
echo "  sudo systemctl status docker"
