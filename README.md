# SWGOH AI Demo

Dark Telegram Mini App demo for a SWGOH AI assistant.

## What is here

- `src/app` - Next.js app router
- `src/components` - UI blocks
- `src/types` - shared TypeScript types
- `public/icons` - PNG icons used by the app

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS setup
- Vercel deployment ready

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current screens

- Start screen only
- Menu button in the top left
- Centered greeting, hints, and message input
- No chat history yet
- No persistence yet
- No AI backend yet

## Required icons

Put these files in `public/icons/`:

- `menu.PNG`
- `applogo.PNG`
- `send.PNG`

Optional future icons:

- `settings.PNG`
- `avatar.PNG`
- `chat.PNG`
- `back.PNG`
- `close.PNG`
- `search.PNG`
- `newchat.PNG`

## Notes

- Viewport scaling is locked for a more app-like TMA feel.
- Text selection and native browser highlights are restricted globally.
- The UI is intentionally minimal and dark.
