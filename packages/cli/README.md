# Kooboo CLI

> Command alias: `kb` - You can use `kb` instead of `kooboo-cli` as the prefix for all commands

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
kb <command> [options]
```

| Command    | Description                                   | Aliases |
| ---------- | --------------------------------------------- | ------- |
| `config`   | Set or get configuration values               |         |
| `new`      | Create a new Kooboo site                      | `n`     |
| `clone`    | Clone a remote Kooboo site                    | `c`     |
| `pull`     | Pull remote Kooboo site code to local         |         |
| `push`     | Push local Kooboo site code to remote         |         |
| `deploy`   | Deploy files, folders, or globs to remote     |         |
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
kb config

# Get a specific config (full command)
kooboo-cli config <key>
# Get a specific config (shorthand command)
kb config <key>

# Set a config (full command)
kooboo-cli config <key> <value>
# Set a config (shorthand command)
kb config <key> <value>

# Set a global config (full parameter)
kooboo-cli config <key> <value> --global
# Set a global config (shorthand parameter)
kb config <key> <value> -g
```

### new

Create a new Kooboo site.

```sh
# Create a new site (full command)
kooboo-cli new <site-name>
# Create a new site (shorthand command)
kb new <site-name>

# Specify host (full parameter)
kooboo-cli new <site-name> --host <host>
# Specify host (shorthand parameter)
kb new <site-name> -h <host>
```

### clone

Clone a remote Kooboo site.

> `kb clone` 会在初始化时提示是否生成 `AGENTS.md`，建议保持开启，方便后续 Codex 等工具直接接手。

```sh
# Clone a site (full command)
kooboo-cli clone <siteUrl>
# Clone a site (shorthand command)
kb clone <siteUrl>

# Specify directory (full command)
kooboo-cli clone <siteUrl> <dir>
# Specify directory (shorthand command)
kb clone <siteUrl> <dir>

# Specify authentication (full parameter)
kooboo-cli clone <siteUrl> <dir> --username <username> --password <password>
# Specify authentication (shorthand parameter)
kb clone <siteUrl> <dir> -u <username> -p <password>
```

### pull

Pull remote Kooboo site code to local environment.

```sh
# Pull all resources (full command)
kooboo-cli pull
# Pull all resources (shorthand command)
kb pull

# Pull a specific resource type (full command)
kooboo-cli pull <resource>
# Pull a specific resource type (shorthand command)
kb pull <resource>

# Pull a specific resource by name (full command)
kooboo-cli pull <resource> <name>
# Pull a specific resource by name (shorthand command)
kb pull <resource> <name>
```

### push

Push local Kooboo site code to remote environment. Use this for batch publishing the current workspace.

```sh
# Push all changes (full command)
kooboo-cli push
# Push all changes (shorthand command)
kb push

# Push a specific resource type (full command)
kooboo-cli push <resource>
# Push a specific resource type (shorthand command)
kb push <resource>

# Push a specific resource by name (full command)
kooboo-cli push <resource> <name>
# Push a specific resource by name (shorthand command)
kb push <resource> <name>
```

### deploy

Deploy files, folders, or glob patterns to the remote Kooboo site. Use this for precise manual publishing.

```sh
# Deploy a single file
kooboo-cli deploy src/page/home.html
kb deploy src/page/home.html

# Deploy multiple files
kooboo-cli deploy src/page/home.html src/view/common.html
kb deploy src/page/home.html src/view/common.html

# Deploy a folder
kooboo-cli deploy src/view
kb deploy src/view

# Deploy a glob
kooboo-cli deploy "src/page/*.html"
kb deploy "src/page/*.html"
```

### generate

Generate Kooboo code resources.

```sh
# Generate a resource (full command)
kooboo-cli generate <resource> <name>
# Generate a resource (shorthand command)
kb generate <resource> <name>
# Generate a resource (shorthand command with alias)
kb g <resource> <name>
```

> 目前 `generate` 仍是占位命令，不会自动生成资源文件。

### sync

Synchronize Kooboo site code to server environment.

```sh
# Sync changes (full command)
kooboo-cli sync
# Sync changes (shorthand command)
kb sync

# Initialize synchronization (full parameter)
kooboo-cli sync --init
# Initialize synchronization (shorthand parameter)
kb sync -i

# Specify site information (full parameter)
kooboo-cli sync --site-url <url> --username <username> --password <password>
# Specify site information (shorthand parameter)
kb sync -s <url> -u <username> -p <password>

# Specify common module path (full parameter)
kooboo-cli sync --common-module-path <path>
# Specify common module path (shorthand parameter)
kb sync -c <path>
```

### export

Export Kooboo site resources to zip file.

```sh
# Export site resources (full command and parameters)
kooboo-cli export --site-url <url> --username <username> --password <password> --file <file>
# Export site resources (shorthand command and parameters)
kb export -s <url> -u <username> -p <password> -f <file>
```
