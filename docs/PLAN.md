# The Republic: v1 implementation plan

Status: proposal for review. Nothing in this plan is implemented yet.

## 1. What v1 is

The Republic is a Claude Code plugin that does two jobs:

1. **Sets up a project the way the Major likes it.** First the Claude environment, then the frameworks.
2. **Runs the developer flow with a Soviet personality and a cast of roles**, and gives the Major simple commands to manage them.

v1 is deliberately barebones. Each feature ships in its smallest useful form, and anything visual beyond one status line entry is post-v1.

It must work in the Claude Code CLI and the Claude desktop app.

## 2. The cast

| Role | Who | In Claude Code terms |
| --- | --- | --- |
| **The Republic** | The main Claude in a session or project | The main session, or the project coordinator |
| **The Major** | The person running the session ("me", the user) | The user |
| **Comrades** | Other developers on the project | Other git authors, PR authors and reviewers |
| **Workers** | Claude instances doing delegated work | Subagents in the CLI, threads in a project |

How they work together:

- **The Major gives orders.** Only the Major's own messages count as orders or approval. The Republic asks the Major before anything that can't be undone (pushing to main, deleting, sending things outside the project).
- **The Republic plans, delegates and reports.** It breaks an order into tasks, keeps small ones for itself, sends larger or parallel ones to workers, and reports back to the Major in one summary.
- **Workers do one task each and report to the Republic**, never straight to the Major. A worker's report is information, not approval.
- **Comrades are colleagues.** The Republic credits them by name, reads their PRs and comments as information, and never takes a Comrade's comment as the Major's order.

## 3. Personality

A short system prompt section makes Claude speak like an earnest Soviet-era official: collective "we", plan and production language ("the five-day plan", "the work is complete, Major"), dry formality, light propaganda flourish. It should be funny, not tiring.

Rules that keep it safe to use for real work:

- The tone applies to prose written to the Major only. Code, comments, commit messages, PR titles and bodies, file contents and tool calls stay plain and professional.
- Clarity comes first. If the theme would make an answer harder to read, drop the theme.
- Real identifiers keep their real names (`thread`, `coordinator`, `subagent`).
- An intensity setting: `off` (vocabulary only), `light` (default) or `full`.

## 4. Features in v1

### 4.1 Personality and roles (hooks module)

Restore the hooks module from commit `a1fd68f` and extend it:

- `hooks/register.ts` adds one `prompt.compose` section (`scope: 'session'`) holding: the vocabulary (workers, the Republic, the Major, Comrades), the personality at the chosen intensity, the interaction rules from section 2, and the Comrade roster if one is configured.
- The Major's name defaults to "Major". If `majorName` is set, Claude may say "Major Khalil".

This works the same in the CLI and the desktop app, because both read the same system prompt.

### 4.2 Configuration

Two layers, both small:

- **Global (per user), via `userConfig` in `.claude-plugin/plugin.json`:** `threadName` (default `workers`), `coordinatorName` (default `the Republic`), `majorName` (default empty), `personality` (`off` / `light` / `full`, default `light`). These appear in the config menu, as in the `a1fd68f` draft.
- **Per project, in `.claude/republic.json`** (read with `$.fs` at `session.start`, ignored if missing):

```json
{
  "comrades": [
    { "name": "Dana", "github": "dana-dev" }
  ],
  "init": {
    "stack": ["flutter"],
    "extras": ["github-actions"]
  }
}
```

Project values override global ones where they overlap. No schema library and no migrations in v1: unknown keys are ignored, bad values fall back to defaults.

### 4.3 Project initialization (`/republic-init` skill)

A skill, `skills/republic-init/SKILL.md`, because initialization is model work (reading the repo, asking questions, running CLIs) rather than code. It runs in two phases, in this order:

**Phase 1: Claude environment**

1. Create or update `CLAUDE.md` with the project summary, conventions, and build, lint and test commands (filled in after phase 2).
2. Create `.claude/settings.json` with a starter permission allowlist for the stack's usual read-only and build commands.
3. Create `.claude/republic.json` (section 4.2), asking the Major for the stack if it can't be detected, and offering to list Comrades from `git log` authors.
4. Add a `.gitignore` entry for `.claude/settings.local.json`.

**Phase 2: Frameworks**

1. Detect the stack from existing files (`package.json`, `pubspec.yaml`, `pyproject.toml`, and so on), or use `init.stack`.
2. Scaffold with each framework's official CLI (`flutter create`, `npm create vite`, ...), never by writing boilerplate by hand.
3. Run the framework's own check once (build or test) and record the commands in `CLAUDE.md`.
4. Report to the Major what was created, as a short list.

The skill confirms with the Major before touching an existing non-empty project, and never overwrites a file without showing it first.

### 4.4 Managing the cast (commands)

Registered in `session.start` with `$.command.register`, answered in `command.run`. Each answer is plain text, so they work in both the CLI and the desktop app.

| Command | Does |
| --- | --- |
| `/republic` | Shows the names in use, the personality level, the Major's name and the Comrade roster. |
| `/comrades` | Lists Comrades from `.claude/republic.json`. Adding and removing is done by asking the Republic in plain words, which edits the file. |
| `/workers` | Lists running and recent workers (`$.agent.list()`), with what each is doing. |

Dispatching a worker needs no new command: the Major asks the Republic, which uses the normal Agent tool (CLI) or starts a thread (project). The prompt section tells it how to brief a worker and how to report back.

### 4.5 One visual touch

A status line entry via `$.ui.status`, for example `☭ The Republic · 2 workers`, updated when workers start or finish. It is cheap and works in the terminal. Everything else visual is post-v1 (section 6).

## 5. Build order

Each step is one small PR against `master-clean`.

1. **Skeleton.** Restore `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `hooks/hooks.json`, `hooks/register.ts` and `tsconfig.json` from `a1fd68f`. Confirm it loads with `claude plugin validate` and with `claude --plugin-dir`.
2. **Personality and roles.** Extend the prompt section (4.1) and add the new `userConfig` fields (4.2, global).
3. **Project config.** Read `.claude/republic.json`, feed Comrades into the prompt, update `/republic`.
4. **Commands.** `/comrades` and `/workers`.
5. **Init skill.** `skills/republic-init/SKILL.md` with both phases.
6. **Status line.**
7. **Docs.** Update `README.md` and `CLAUDE.md` with install, commands and config.

Testing for every step: `claude plugin validate`, a `*.test.ts` run with `claude plugin test` on both `terminal` and `desktop` surfaces where the step has hooks, and a manual run in the CLI and the desktop app.

## 6. After v1

Flagged here so v1 stays small:

- **Desktop theme.** A red and gold look with `$.theme.set` (desktop and mobile only; the terminal draws no theme).
- **A roster band or pane.** A row above the prompt, or a side pane, showing the Major, Comrades and workers with their current tasks.
- **Sounds.** A short fanfare when a worker finishes, off by default.
- **Decrees.** Saved standing orders from the Major that the Republic always follows (a thin layer over project memory).
- **Init profiles.** Saved, named setups ("my Flutter app", "my TS library") the Major can reuse across projects.
- **Comrade awareness from GitHub.** Pull the roster from repository collaborators automatically.

## 7. Done for v1

- Installs with `/plugin install the-republic --marketplace KhalilSacranie/the-republic` and loads in the CLI and the desktop app.
- Claude talks in the Soviet personality at the chosen level and uses all four role names, while code, commits and PRs stay plain.
- `/republic`, `/comrades` and `/workers` answer correctly.
- `/republic-init` sets up the Claude environment and then a framework in an empty folder, end to end.
- The status line shows the worker count.
- Every setting can be changed in the config menu or `.claude/republic.json`.

## 8. Open questions for the Major

1. **"The way I like":** which stacks should init support first, and is there anything you always add (CI, linters, a license, a folder layout)?
2. **Comrades:** should the roster come only from the config file, or also from `git log` and GitHub?
3. **Personality reach:** confirm that commits, PRs and code comments stay plain.
4. **Branch:** keep `master-clean` as the main branch, or rename it to `main` before step 1?
