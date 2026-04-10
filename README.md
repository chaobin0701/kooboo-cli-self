# kooboo-cli

kooboo-cli 是快速建站平台 kooboo 的本地开发环境集成

- packages
  - cli 脚手架
  - compile 用于将代码转换为适用 kooboo
  - sync 用于将本地代码实时同步到 kooboo
  - types KScript 语法类型包
  - utils 脚手架工具包
  - template-xxx 预设 kooboo 开发模板
  - \_test_sync 测试项目

# 使用

目前最新版本的 cli 未经足够测试，暂未发布到 npm，需将代码克隆到本地使用`feat-cli`分支进行构建使用

克隆

```bash
git clone https://e.coding.net/yardi/kooboo-cli/cli.git
```

进入项目目录，安装依赖（请使用 pnpm）

```bash
pnpm i
```

编译代码

```bash
pnpm build
```

将`packages/cli`链接到全局

```bash
cd packages/cli
pnpm setup # 有可能会提醒需要执行该命令
pnpm link -g
```

此时，可在全局使用 kooboo-cli 命令，缩写为`kb`

```bash
# 创建站点，可通过设置serverUrl指定服务器
kb new [serverUrl]

# 克隆项目，通过设置siteUrl从已有站点克隆代码
kb clone <siteUrl>

# 开启同步
kb sync
# kb sync指令在项目的package.json中设置为dev脚本
pnpm dev
```

# 维护 kooboo-cli

```bash
# 安装依赖 (请使用pnpm)
pnpm install

# 发布到npm

# 选择变动项目
pnpm changeset add
# 更新版本号
pnpm changeset version
# 发布
pnpm changeset publish
```
