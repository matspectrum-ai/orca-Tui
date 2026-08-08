# Orca TUI architecture

## Problem analysis

Orca's desktop renderer is not its product boundary. Worktrees, terminals, agents, Git,
orchestration, and remote execution already cross runtime RPC. The TUI consumes those contracts
instead of reimplementing the domains.

The existing `orca serve` path is not Electron-free: runtime composition still imports Electron.
The migration therefore has two seams: a framework-independent TUI presentation boundary and a
Node 24 host boundary that progressively removes Electron-only capabilities from runtime startup.

## Specification

```yaml
feature: orca-tui-foundation
objectives:
  - preserve Orca as source of truth for workspaces, agents, terminals, and Git
  - expose worktree.ps through a narrow TuiRuntimePort
requirements:
  - TUI domain must not import electron, renderer, git runners, or child_process
  - git and folder workspaces retain runtime identity and state
  - agents retain runtime state and parent-child lineage
  - unknown future states degrade to unknown
acceptance_criteria:
  - one worktree.ps call per catalog refresh
  - deterministic catalog/input/navigation tests
  - CLI typecheck and changed-code quality are green
```

```yaml
feature: orca-tui-dashboard-shell
requirements:
  - j/down and k/up navigate by stable workspace id
  - r refreshes; q and ctrl+c exit
  - incomplete keypress metadata never throws
  - semantic view model contains no ANSI
  - TTY raw mode, cursor, and alternate screen restore on exit
  - orca tui never calls openOrca or serveOrcaApp
acceptance_criteria:
  - controller and TTY lifecycle are testable without a real terminal
  - command is registered in CLI registry
```

```yaml
feature: node-native-orca-runtime-host
objectives:
  - run the Orca host needed by orca tui on Node.js 24 without loading Electron
  - reuse existing Orca domain, persistence, RPC, PTY, Git, agents, SSH, and orchestration
requirements:
  process_boundary:
    - Node host never imports or requires electron
    - Node host never spawns the Electron executable
    - browser/emulator Electron surfaces are not eagerly imported
  compatibility:
    - existing RuntimeClient and RPC method contracts stay authoritative
    - no second Git, worktree, or agent implementation
    - folder workspaces and SSH remain first-class
  lifecycle:
    - connect to an existing compatible runtime when present
    - otherwise start Node host and wait for readiness
    - unsupported desktop-only capabilities fail explicitly
acceptance_criteria:
  - import smoke test fails on any Electron load in Node-host graph
  - worktree.ps contract works with desktop closed
  - local PTY create/read works with desktop closed
  - integration test observes no Electron process
edge_cases:
  - empty persisted state
  - stale runtime metadata
  - existing runtime owns transport
  - folder workspace
  - SSH-backed repository
  - browser or emulator requested without desktop capability
  - Node host startup failure
```

## Contracts

`TuiRuntimePort` is the presentation-facing runtime boundary. Node-host platform dependencies are
capability interfaces: desktop composition may supply Electron adapters, while Node composition
supplies Node implementations or explicit unsupported capabilities.
