# Dropbox 配置指南

## 第 1 步：创建 Dropbox App

1. **访问**：https://www.dropbox.com/developers/apps
2. **登录**你的 Dropbox 账户
3. **点击** "Create app"
4. **选择**：
   - **API**: Dropbox API
   - **Access**: Full Dropbox
   - **Name**: `kanban-file-storage`（或其他唯一名称）
5. **点击** "Create app"

## 第 2 步：获取 Access Token

1. 在应用设置页面，找到 **"Generated access token"** 部分
2. **点击** "Generate" 按钮
3. **立即复制**显示的 Token（只显示一次！）
4. **保存**到安全位置

## 第 3 步：配置环境变量

将以下行添加到你的 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）：

```bash
export DROPBOX_APP_KEY="你的_app_key"
export DROPBOX_APP_SECRET="你的_app_secret"
export DROPBOX_ACCESS_TOKEN="你的_access_token"
```

然后运行：
```bash
source ~/.zshrc
```

## 第 4 步：测试配置

```bash
# 检查环境变量
echo $DROPBOX_ACCESS_TOKEN

# 测试连接（需要安装 dropbox-cli 或使用 MCP）
```

## 快速开始

配置完成后，你可以：

1. **上传文件**：
   ```
   把文件给我 → 我上传到你的 Dropbox → 返回分享链接
   ```

2. **下载文件**：
   ```
   给我 Dropbox 路径 → 我下载到本地 → 返回文件
   ```

3. **分享文件**：
   ```
   上传后自动生成分享链接 → 你可以发给任何人
   ```

## 安全提示

- ⚠️ **不要分享**你的 Access Token
- 🔒 Token 存储在环境变量中（安全）
- 🗑️ 如需撤销，访问 Dropbox App Console 删除 App

---

**配置完成后告诉我，我会测试连接！** 🚀
