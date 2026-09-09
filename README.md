# ArtistID

Artist identity on FHEVM. One wallet registers once, mints an ERC-721 identity and stores a
profile - name, bio, portfolio URI, category - next to an encrypted reputation that only the
holder and the contract can read.

## How it fits together

- `fhevm-hardhat-template/` - the `ArtistID` contract (ERC-721 + `SepoliaConfig`), the deploy
  scripts and the TypeChain bindings. Deployment metadata lives in `deployments/<network>/`.
- `frontend/` - a Next.js 15 static export. The register, profile and verify pages talk to the
  contract through `hooks/useArtistID.tsx`; `scripts/genabi.mjs` turns the deployment JSON into
  the ABI and address map the app imports.

Reputation is an `euint32` per token. `addReputation`/`subReputation` take an encrypted input
handle plus its proof, and the result is clamped with an encrypted comparison so the value can
never wrap. The artist counter is an encrypted aggregate.

## Run it

```bash
cd fhevm-hardhat-template
npm install
npx hardhat compile
npm test

cd ../frontend
npm install
npm run genabi      # reads deployments/<network>/ArtistID.json + .chainId
npm run dev
```

`genabi` fails closed: a deployment without an ABI, or no deployment at all, is an error rather
than a silent empty binding. `next build` runs it through `prebuild`.

## Deployments

| Network | Chain id | Contract |
|---|---|---|
| localhost | 31337 | `deployments/localhost/ArtistID.json` |
| sepolia | 11155111 | `deployments/sepolia/ArtistID.json` |

Set `NEXT_PUBLIC_PINATA_JWT` per visitor - the frontend asks for a pinning token at upload time
instead of shipping a shared one.

## Licence

MIT.
