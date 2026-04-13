# AGENTS.md

本文件用于指导 Codex、Cursor、Claude Code 等编程工具在这个仓库中工作。

## 仓库定位

这是 `Kooboo CLI` 的维护仓库，不是普通 Node.js CLI，也不是 Kooboo 站点项目本身。

它服务的是 Kooboo 远程开发工作流，命令语义和目录语义都要按 Kooboo 的规则理解。

## 开工前先读什么

优先按这个顺序看：

1. [`README.md`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/README.md)
2. [`packages/cli/src/index.ts`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/packages/cli/src/index.ts)
3. [`packages/cli/src/exec/*`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/packages/cli/src/exec)
4. [`packages/sync/src/*`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/packages/sync/src)
5. [`packages/compile/src/*`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/packages/compile/src)
6. [`packages/types/KScript.d.ts`](/Users/a1234/Desktop/my-projects/kooboo-cli-self/packages/types/KScript.d.ts)
7. 文档站：
   - [开箱提示词](https://chaobin0701.github.io/kb-document/kooboo-remote/ai-prompts)
   - [AI 远程开发补充说明](https://chaobin0701.github.io/kb-document/kooboo-remote/ai-remote-dev-notes)
   - [目录与文件作用总览](https://chaobin0701.github.io/kb-document/kooboo-remote/file-structure-overview)

## 修改原则

- 优先最小改动
- 优先保留现有命令语义
- 优先补文档、错误提示、示例和验证
- 不要把 `sync`、`push`、`deploy` 混成同一个概念
- 不要重新引入已删除的示例模板包
- 不要随意改动 Kooboo 目录语义
- 如果能复用现有的 `@kooboo/*` 能力，就不要自己重写一套

## 命令边界

- `sync`：自动监听并持续同步
- `push`：批量推送当前工作区资源
- `deploy`：手动指定文件、目录或通配符，精准部署到远程站点
- `label`：独立管理站点多语言标签，主文件是 `.kooboo-cli/labels.json`，raw 备份是 `.kooboo-cli/labels.raw.json`
  - `kbs label import` 必须传入 JSON 文件，只做原样上传
- `pull`：从远端拉回本地
- `clone`：克隆远端站点并生成本地工作区
- `new`：创建新的 Kooboo 站点工作区
- `generate`：目前是占位命令，不能当成真正的生成器

## 目录语义

下面这些目录在 Kooboo 里有固定含义，写代码时要按资源语义理解，不要按普通前端项目理解：

- `src/api`
- `src/code`
- `src/layout`
- `src/page`
- `src/view`
- `src/js`
- `src/css`
- `src/module`

尤其注意：

- `view` 可以有子目录
- `module` 有自己的资源结构
- 文件名和目录会一起决定远端资源名

## 验证方式

默认优先跑：

```bash
pnpm build
```

如果改的是命令帮助、文档或 scaffold，顺手检查：

- CLI help 输出
- README 是否同步
- 是否重新引入了示例包

## 常见坑

- 把 Kooboo 远程开发当成普通 Node CLI
- 把 `push` 当成 `deploy`
- 把 `deploy` 当成自动监听
- 把 `label` 当成 `sync` 或站点配置的一部分
- 忘了 `page` / `api` 可能需要额外配置
- 把 `src` 里的目录当成纯文件夹，不考虑资源映射

## 给编程工具的工作提示

先理解，再改动。

如果你是 Codex 或同类工具，建议按这个顺序：

1. 读本文件
2. 读命令入口和目标命令
3. 读最近的相关实现
4. 做最小修改
5. 跑构建
6. 总结你改了什么、为什么改、还有哪些风险
