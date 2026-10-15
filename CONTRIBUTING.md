# Contributing

Thanks for looking. Two rules keep this small enough to review:

1. Open an issue before anything larger than a bug fix, so the shape is agreed first.
2. One behaviour per pull request, with the check that pins it.

## Checks

```bash
cd fhevm-hardhat-template && npm ci && npm test
cd ../frontend && npm ci && npm run build
```

`npm run build` regenerates the ABI from `deployments/` through `prebuild`, so a missing deployment
fails the build on purpose.

## Style

Match the surrounding code. The frontend is a Next.js app router project; the contract is a single
Solidity file with the FHEVM helpers next to the state they touch.
