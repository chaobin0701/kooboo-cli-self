# Kooboo CLI

> Command alias: `kbs` - You can use `kbs` instead of `kooboo-cli` as the prefix for all commands

Kooboo CLI is a command-line tool for Kooboo local development.

## Install

```sh
# Using npm
npm install -g @kooboo/cli

# Using pnpm
pnpm add -g @kooboo/cli

# Using yarn
yarn global add @kooboo/cli
```

## Commands

```sh
kooboo-cli <command> [options]
# or use the shorthand form
kbs <command> [options]
```

| Command    | Description                                   | Aliases |
| ---------- | --------------------------------------------- | ------- |
| `config`   | Set or get configuration values               |         |
| `new`      | Create a new Kooboo site                      | `n`     |
| `clone`    | Clone a remote Kooboo site                    | `c`     |
| `pull`     | Pull remote Kooboo site code to local         |         |
| `push`     | Push local Kooboo site code to remote         |         |
| `deploy`   | Deploy files, folders, or globs to remote     |         |
| `label`    | Manage Kooboo labels                          |         |
| `generate` | Generate Kooboo code resources                | `g`     |
| `sync`     | Synchronize Kooboo site code to server        |         |
| `export`   | Export Kooboo site resources to zip file      |         |

## Usage

### config

Set or get configuration values.

```sh
# Get all configs (full command)
kooboo-cli config
# Get all configs (shorthand command)
kbs config

# Get a specific config (full command)
kooboo-cli config <key>
# Get a specific config (shorthand command)
kbs config <key>

# Set a config (full command)
kooboo-cli config <key> <value>
# Set a config (shorthand command)
kbs config <key> <value>

# Set a global config (full parameter)
kooboo-cli config <key> <value> --global
# Set a global config (shorthand parameter)
kbs config <key> <value> -g
```

### config site

Manage the standalone `siteConfig` JSON stored at `.kooboo-cli/siteConfig.json`.

```sh
# Pull remote siteConfig into local JSON
kbs config site pull -s <url> -u <username> -p <password>

# Push local siteConfig JSON back to remote
kbs config site push -s <url> -u <username> -p <password>

# Show local siteConfig JSON
kbs config site show
```

> `kbs clone` 和 `kbs new` 会在初始化时自动拉取一次 `siteConfig.json`。

### label

Manage the standalone labels cache stored at `.kooboo-cli/labels.json`.
The raw backup is stored at `.kooboo-cli/labels.raw.json`.

```sh
# Pull remote labels into local cache
kbs label pull -s <url> -u <username> -p <password>

# Show local labels cache
kbs label show

# Create or overwrite a single label
kbs label set welcome --values '{"en":"Welcome","zh":"欢迎"}' -s <url> -u <username> -p <password>

# Import labels from a JSON file
kbs label import ./labels.json -s <url> -u <username> -p <password>
```

> `kbs clone` 和 `kbs new` 会在初始化时自动拉取一次 `labels.json`，并同时保存一份 `labels.raw.json` 备份。
>
> `kbs label set` 直接发送完整 `values` JSON，不会自动拆分或改写语言字段。
>
> `kbs label pull` 输出的是可编辑格式：
>
> ```json
> {
>   "en": {
>     "welcome": "Welcome"
>   },
>   "zh": {
>     "welcome": "欢迎"
>   }
> }
> ```
>
> 你可以直接编辑 `labels.json`，然后用 `kbs label import ./labels.json` 上传。
>
> `kbs label import` 只负责把你指定的 JSON 文件上传到远端，不会做缓存转换或额外处理。
>
> `kbs label import` 期望的 JSON 文件示例：
>
> ```json
> {
>   "en": {
>     "a": "b"
>   },
>   "zh": {
>     "a": "c"
>   }
> }
> ```

### new

Create a new Kooboo site.

```sh
# Create a new site (full command)
kooboo-cli new <site-name>
# Create a new site (shorthand command)
kbs new <site-name>

# Specify host (full parameter)
kooboo-cli new <site-name> --host <host>
# Specify host (shorthand parameter)
kbs new <site-name> -h <host>
```

### clone

Clone a remote Kooboo site.

> `kbs clone` 会在初始化时提示是否生成 `AGENTS.md`，建议保持开启，方便后续 Codex 等工具直接接手。
>
> 如果用户名或密码不正确，登录最多重试 3 次，之后会停止，避免重复请求。

```sh
# Clone a site (full command)
kooboo-cli clone <siteUrl>
# Clone a site (shorthand command)
kbs clone <siteUrl>

# Specify directory (full command)
kooboo-cli clone <siteUrl> <dir>
# Specify directory (shorthand command)
kbs clone <siteUrl> <dir>

# Specify authentication (full parameter)
kooboo-cli clone <siteUrl> <dir> --username <username> --password <password>
# Specify authentication (shorthand parameter)
kbs clone <siteUrl> <dir> -u <username> -p <password>
```

### pull

Pull remote Kooboo site code to local environment.

```sh
# Pull all resources (full command)
kooboo-cli pull
# Pull all resources (shorthand command)
kbs pull

# Pull a specific resource type (full command)
kooboo-cli pull <resource>
# Pull a specific resource type (shorthand command)
kbs pull <resource>

# Pull a specific resource by name (full command)
kooboo-cli pull <resource> <name>
# Pull a specific resource by name (shorthand command)
kbs pull <resource> <name>
```

### push

Push local Kooboo site code to remote environment. Use this for batch publishing the current workspace.

```sh
# Push all changes (full command)
kooboo-cli push
# Push all changes (shorthand command)
kbs push

# Push a specific resource type (full command)
kooboo-cli push <resource>
# Push a specific resource type (shorthand command)
kbs push <resource>

# Push a specific resource by name (full command)
kooboo-cli push <resource> <name>
# Push a specific resource by name (shorthand command)
kbs push <resource> <name>
```

### deploy

Deploy files, folders, or glob patterns to the remote Kooboo site. Use this for precise manual publishing.

```sh
# Deploy a single file
kooboo-cli deploy src/page/home.html
kbs deploy src/page/home.html

# Deploy multiple files
kooboo-cli deploy src/page/home.html src/view/common.html
kbs deploy src/page/home.html src/view/common.html

# Deploy a folder
kooboo-cli deploy src/view
kbs deploy src/view

# Deploy a glob
kooboo-cli deploy "src/page/*.html"
kbs deploy "src/page/*.html"
```

### generate

Generate Kooboo code resources.

```sh
# Generate a resource (full command)
kooboo-cli generate <resource> <name>
# Generate a resource (shorthand command)
kbs generate <resource> <name>
# Generate a resource (shorthand command with alias)
kbs g <resource> <name>
```

> 目前 `generate` 仍是占位命令，不会自动生成资源文件。

### sync

Synchronize Kooboo site code to server environment.

```sh
# Sync changes (full command)
kooboo-cli sync
# Sync changes (shorthand command)
kbs sync

# Initialize synchronization (full parameter)
kooboo-cli sync --init
# Initialize synchronization (shorthand parameter)
kbs sync -i

# Specify site information (full parameter)
kooboo-cli sync --site-url <url> --username <username> --password <password>
# Specify site information (shorthand parameter)
kbs sync -s <url> -u <username> -p <password>

# Specify common module path (full parameter)
kooboo-cli sync --common-module-path <path>
# Specify common module path (shorthand parameter)
kbs sync -c <path>
```

### export

Export Kooboo site resources to zip file.

```sh
# Export site resources (full command and parameters)
kooboo-cli export --site-url <url> --username <username> --password <password> --file <file>
# Export site resources (shorthand command and parameters)
kbs export -s <url> -u <username> -p <password> -f <file>
```
