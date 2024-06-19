# nook

Source code for the now-defunct Farcaster client, nook. 

We are providing this codebase as-is for people to learn from and build upon for their own applications. 

### ⚠️ Important Notes
1. Since we had been building/testing in production, we don't have a proper development environment setup. Therefore, you should not expect to standup nook on your own. Spinning up all of the infrastructure is a costly and involved process that we won't be spending further time on. I urge anyone thinking about building their own infrastructure to use [Neynar](https://neynar.com/) if possible.

2. We prioritized speed and learning above all else. As primarily backend/protocol developers, nook served as our first "serious" TypeScript project to catch up on modern full-stack cross-platform app development. We're not the best TypeScript/Node developers out there so there's likely many opportunities for optimizations and better patterns. Please don't blindly assume the ways we did things are the right ways to do those things.

## Stack
- Language: TypeScript
- Queuing: BullMQ / Redis
- Database: Postgres / Prisma, Redis for caching
- APIs: Fastify
- App: Tamagui / Expo Router (Native) / Next (Web) / React Query / Zustand

## Packages
```
nook
├── apps/
│   ├── expo - native app
│   └── next - web app
└── packages/
    ├── api - core api powering web/mobile
    ├── app - shared features between web/mobile
    ├── app-ui - shared components between web/mobile
    ├── common - shared types/utils for all packages
    ├── content-api - responsible for fetching and storing embeds
    ├── dashboard - visualization of queues
    ├── events - post-process farcaster events after db insertion
    ├── farcaster - publisher and consumer of hub event stream
    ├── farcaster-api - farcaster api microservice
    ├── list-api - list api microservice
    ├── notifications - handle push notifications
    ├── notifications-api - notifications api microservice
    ├── scheduler - handles cron jobs
    ├── scripts - scripts triggered by cron jobs
    ├── signer-api - signer api microservice
    └── swap-api - swap api microservice (never used)
```