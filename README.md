# kooboo-cli

kooboo-cli 是 Kooboo 远程开发的本地命令行工具。

## 仓库结构

- `packages/cli`：命令入口和初始化流程
- `packages/core`：Kooboo API 封装
- `packages/compile`：本地代码与 Kooboo 语义转换
- `packages/sync`：文件监听与同步
- `packages/types`：`KScript` 类型定义
- `packages/utils`：通用工具

## 使用

```bash
pnpm i
pnpm build
```

将 `packages/cli` 链接到全局：

```bash
cd packages/cli
pnpm setup
pnpm link -g
```

常用命令：

```bash
kb new [site-name]
kb clone <site-url> [dir]
kb pull [resource] [name]
kb push [resource] [name]
kb deploy <files...>
kb sync
kb export
```

命令分工：

- `sync`：自动监听并持续同步
- `push`：批量推送当前工作区资源
- `deploy`：手动指定文件、目录或通配符，精准部署到远程站点

目录语义：

- `src/api`、`src/code`、`src/layout`、`src/page`、`src/view`、`src/js`、`src/css`、`src/module` 都有对应的 Kooboo 资源含义
- 文件名和目录会一起决定远端资源名，不要把它当作普通前端项目目录来理解

## 维护

```bash
pnpm install
pnpm changeset add
pnpm changeset version
pnpm changeset publish
```
