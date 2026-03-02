#!/bin/bash

# 部署配置
SERVER_USER="root"
SERVER_HOST="47.115.57.138"
SERVER_PATH="/srv/myapp/statics"
LOCAL_DIST="./dist/"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}开始部署前端静态文件 (使用 SCP)...${NC}"
echo -e "${YELLOW}========================================${NC}"

# 检查dist目录是否存在
if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}错误: dist目录不存在，请先执行 npm run build${NC}"
    exit 1
fi

# 白名单：需要上传的文件和目录
FILES_TO_UPLOAD=(
    "index.html"
    "config.js"
    "vite.svg"
    "参考表.xlsx"
    "auth"
    "detail"
    "explore"
    "intro"
    "menu"
)

echo -e "${BLUE}步骤 1/3: 清空服务器上的 assets 目录${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" "rm -rf ${SERVER_PATH}/assets/*"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ assets 目录已清空${NC}"
else
    echo -e "${RED}✗ 清空 assets 目录失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}步骤 2/3: 上传 assets 目录${NC}"
scp -r "${LOCAL_DIST}assets" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ assets 目录上传成功${NC}"
else
    echo -e "${RED}✗ assets 目录上传失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}步骤 3/3: 上传其他文件${NC}"

# 上传白名单中的文件和目录
for item in "${FILES_TO_UPLOAD[@]}"; do
    if [ -e "${LOCAL_DIST}${item}" ]; then
        echo -e "${YELLOW}正在上传 ${item}...${NC}"

        if [ -d "${LOCAL_DIST}${item}" ]; then
            # 如果是目录，使用 -r 参数
            scp -r "${LOCAL_DIST}${item}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
        else
            # 如果是文件
            scp "${LOCAL_DIST}${item}" "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
        fi

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ ${item} 上传成功${NC}"
        else
            echo -e "${RED}✗ ${item} 上传失败${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠ ${item} 不存在，跳过${NC}"
    fi
done

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ 部署成功！${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}已上传的内容：${NC}"
echo -e "  - assets/ (完全替换)"
for item in "${FILES_TO_UPLOAD[@]}"; do
    if [ -e "${LOCAL_DIST}${item}" ]; then
        echo -e "  - ${item}"
    fi
done
