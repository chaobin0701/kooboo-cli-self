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
kb sync
kb export
```

## 维护

```bash
pnpm install
pnpm changeset add
pnpm changeset version
pnpm changeset publish
```
