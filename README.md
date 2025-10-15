# Four.meme Loser Airdrop Checker

一个用于检查钱包地址是否符合 Four.meme loser airdrop 条件的纯前端网页应用。

## 功能特性

- 🔍 **钱包地址验证**: 检查 BSC 链的钱包地址
- 🎯 **空投资格检查**: 基于特定时间段的流入流出数据判断资格
- 🌐 **代理支持**: 使用 Cloudflare Workers 代理避免 CORS 问题
- 📱 **响应式设计**: 支持桌面和移动设备
- ⚡ **实时检查**: 快速获取检查结果

## 技术实现

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Arkham Intelligence API
- **代理**: Cloudflare Workers (hwcrawler.krsmt0113.workers.dev)

## 使用方法

1. 打开网页
2. 在输入框中输入要检查的钱包地址（0x...格式）
3. 点击 "Check Eligibility" 按钮
4. 查看检查结果

## 检查逻辑

应用会检查指定时间（2025-10-13T00:00:00Z）的 BSC 链上数据：

- 获取钱包的累积流入和流出数据
- 计算 PnL (Profit and Loss) = 累积流入 - 累积流出
- 如果 PnL < 0（负值），则可能符合空投条件

## 文件结构

```
WalletCheker/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # JavaScript 逻辑
├── favicon.webp        # 网站图标
└── README.md           # 说明文档
```


## 作者

- GitHub: [@KrsMt-0113](https://github.com/KrsMt-0113)
- Twitter: [@KrsMt0113](https://x.com/KrsMt0113)

## 许可证

MIT License

