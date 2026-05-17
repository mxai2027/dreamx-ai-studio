# 梦曦AI科技工作室 · 官网

> 让每个人都能拥有自己的 AI · 让每门生意都能装上 AI 引擎

部署在 [梦曦.中国](https://梦曦.中国)（punycode: `xn--8nvv2b.xn--fiqs8s`）的静态官网，包含 1 个主页 + 10 个商业方案详情页 + 404 页。

## 站点结构

| 文件 | 说明 |
|---|---|
| `index.html` | 主页：工作室介绍 + 10 大商业方案矩阵 + 联系区 |
| `01-AI本地部署.html` | DeepSeek/Qwen/Llama 本地私有化部署 |
| `02-行业AI升级.html` | 餐饮/零售/教育/制造行业 AI 落地 |
| `03-IP数字人.html` | 行业 IP 数字人定制 |
| `04-AI获客.html` | 小红书/抖音/公众号自动获客 |
| `05-AI推广.html` | AI 推广代运营 |
| `06-AI内容.html` | AI 内容批量生产工作流 |
| `07-AI客服.html` | AI 智能客服机器人 |
| `08-AI数据分析.html` | AI 数据分析报告定制 |
| `09-AI培训.html` | 企业 AI 培训陪跑 |
| `10-AI全套方案.html` | 旗舰：从 0 到 1 全程陪跑 |
| `404.html` | 自定义 404 页 |
| `sitemap.xml` · `robots.txt` | SEO 元信息（已用 punycode 域名） |

## 设计规范

- 主色：深蓝渐变 `#1a1a2e → #16213e → #0f3460`
- 强调色：品红 `#e94560`，CTA 渐变 `linear-gradient(90deg, #e94560, #ff6b6b)`
- 字体栈：`-apple-system, "PingFang SC", "Microsoft YaHei"`
- 布局：750px 移动端栅格 + sticky 顶部站点导航 + sticky 底部 CTA
- 价格策略：站点不展示具体价格，统一引导至[淘宝店铺](https://mxai.taobao.com)询价

## 部署 (Cloudflare Pages)

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**
2. 选择本仓库 `dreamx-ai-studio`
3. **Build settings**：
   - Framework preset: **None** (纯静态)
   - Build command: 留空
   - Build output directory: `/` (仓库根目录)
4. **Custom domains** → Add → `梦曦.中国` + `www.梦曦.中国`（Cloudflare 会自动写入 CNAME，覆盖现有 A 记录）

## License

© 2026 梦曦AI科技工作室 · 保留所有权利
