# ChatGPT Session 登录（Edge 插件）

这是一个本地 Edge 插件，可把你本人账号的 ChatGPT Session 令牌写入 `chatgpt.com` 的安全 Cookie，然后打开 ChatGPT。

## 安装

1. 在 Edge 地址栏打开 `edge://extensions/`。
2. 打开左侧的“开发人员模式”。
3. 点击“加载解压缩的扩展”，选择本项目文件夹。
4. 将插件固定到工具栏，点击图标即可使用。

## 使用

1. 粘贴原始 Session 令牌、完整的 `__Secure-next-auth.session-token=...`，或包含 `sessionToken` 字段的完整 JSON；插件只会提取 Session 令牌，不会使用其中的 `accessToken`。复制内容中的空白、零宽字符和反斜杠续行符会自动清除。
2. 点击“写入会话并打开 ChatGPT”。
3. 插件写入 Cookie 后会立即清空输入框，并打开 `https://chatgpt.com/`。

插件不会使用网络服务保存令牌，也不会把令牌写入插件存储。Session 令牌相当于账号密码，只能使用你本人有权使用的账号，不要发送给任何人。

## 支持范围

- Edge / Chromium Manifest V3
- `__Secure-next-auth.session-token`
- `__Secure-authjs.session-token`
- 含 `sessionToken` 字段的 ChatGPT Session JSON
- 不支持 OpenAI API Key 或 `Bearer` Access Token

ChatGPT 的登录机制可能调整；令牌过期、被撤销或 Cookie 名称变更时，ChatGPT 仍可能要求重新登录。
