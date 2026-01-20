# Socket.io Server

Serveur WebSocket standalone pour le système de messagerie temps réel.

## Installation

```bash
pnpm install
```

## Développement

```bash
pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

## Variables d'environnement

Voir `.env.example`

## Architecture

- Port par défaut : 3002
- Authentification : JWT via socket.handshake.auth.token
- Transports : WebSocket + polling fallback
