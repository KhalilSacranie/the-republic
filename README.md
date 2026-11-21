# The Republic

A Claude Code plugin for initializing and managing projects, and the Claude sessions that work within them. Built for
personal use.

## Naming convention

The Republic gives Claude's sessions names that fit the theme:

| Claude's usual term                                                          | What Claude says instead |
|------------------------------------------------------------------------------|--------------------------|
| thread (a session working on one piece of a project)                         | **worker**               |
| project coordinator (the session that runs a project and starts its threads) | **the Republic**         |

So instead of "the project coordinator has started three threads", Claude says "the Republic has started three workers".

The rename applies only to what Claude writes to you. Real identifiers in code, commands, file contents and tool calls
keep their actual names, so nothing breaks. The Claude app's own interface labels are not changed.

### Status

Planned. This is the plugin's first feature and is not shipped on this branch yet. See `CLAUDE.md` for how it is meant
to be built.
