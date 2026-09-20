# Changelog

## [Unreleased]

- `frontend/scripts/genabi.mjs` fails closed when a deployment has no ABI and reads the chain id
  from the deployment directory; `prebuild` runs it so a build cannot use stale bindings.
- Signing paths use the connected wallet only - the hook no longer builds a throwaway signer.
- Reputation handle is refreshed after add/sub, so decrypt no longer shows the previous value.

## [8.1.2] - 2026-08-27

- Pin profile uploads to a per-visitor Pinata JWT with size and type validation.
