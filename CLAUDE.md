# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

The Republic is a Claude Code plugin for initializing and managing projects, and the Claude sessions within them, for the owner's personal use (see `README.md`).

## Naming convention

The plugin's first feature renames two of Claude's terms in what Claude writes to the user:

- A **thread** (a session working on one piece of a project) is called a **worker**. Adjust singular and plural naturally.
- The **project coordinator** (the session that coordinates a project's threads) is called **the Republic**.

Follow this convention yourself when talking to the user about this project. Keep the real names (`thread`, `coordinator`, and so on) in code, identifiers, config keys, commands, file contents and tool calls, where the actual names matter.

### Planned implementation

Ship the rename as a short instruction added to Claude's system prompt by the plugin's hooks module (`hooks/register.ts`, listed in `hooks/hooks.json`), using the `prompt.compose` event to append a session-scoped section. Make both names configurable through `userConfig` in `.claude-plugin/plugin.json` (defaults `workers` and `the Republic`), and register a `/republic` command that shows the names in use. Commit `a1fd68f` on `master` has a working draft of this.

## Current state

The `master-clean` branch contains only `README.md`, `.gitignore` (ignores `.idea/`) and this file. There is no source code, build system, linter or test suite yet, so there are no build/lint/test commands to document. Update this file as those are added.
