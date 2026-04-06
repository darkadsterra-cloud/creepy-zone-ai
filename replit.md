# CREEPY ZONE - AI Stream Pack Generator

## Overview

Full-stack AI Stream Pack Generator for streamers. Dark, creepy gothic gaming aesthetic. Users generate streaming overlays (Starting Soon, BRB, Stream Ending, Webcam Overlay, Chat Box, Alert Box), animated intro concepts, and download a ZIP of all assets.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/spark-gen)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **AI**: OpenAI gpt-image-1 via Replit AI Integrations (real image generation)
- **ZIP**: jszip (client-side bundle download)

## Features

- Splash screen with Creepy Zone promotional image as background + fire particle animation
- 24-hour free trial countdown bar (real-time HH:MM:SS)
- 50+ aesthetic themes for image generation (8 groups, 8 themes each)
- 56 video animation styles (7 groups, 8 styles each)
- **Real AI image generation** using gpt-image-1 via Replit AI Integrations
  - Generates 6 stream pack assets in parallel (Starting Soon, BRB, Stream Ending, Webcam Overlay, Chat Box, Alert Box)
  - Specialized prompts per asset type + user prompt + selected aesthetic
- Animated progress bar 1-100% during generation (real-time indication)
- Select any generated image for video animation
- AI-generated animated intro concept with live CSS animation preview
- Individual download button for each image
- ZIP bundle download (all images + video frame using jszip)
- Lock animation with floating pulsing padlock when trial expires
- Payoneer payment gateway (Weekly $5 / Monthly $15) to account ID 74660788
- Real-time payment history
- Auto-unlock plan features after payment confirmed
- Support section clearly stating "free for 24 hours"

## Key Config

- Payoneer Account ID: 74660788
- Contact: cine.genesis.studio@gmail.com
- Free trial: 24 hours from first login
- AI: gpt-image-1 model via AI_INTEGRATIONS_OPENAI_BASE_URL

## Structure

```text
artifacts/
├── api-server/         # Express API server
│   └── src/routes/
│       ├── auth.ts     # Session create/get (24hr trial)
│       ├── generate.ts # Real AI image + video generation
│       └── payments.ts # Payoneer payment recording
└── spark-gen/          # React+Vite frontend (Creepy Zone brand)
    ├── public/
    │   └── creepy-zone-banner.png  # Creepy Zone promotional image
    └── src/
        ├── pages/home.tsx  # Full app (single page)
        └── lib/themes.ts   # 50 image themes + 56 video themes
lib/
├── api-spec/openapi.yaml                # API contract
├── api-client-react/                    # Generated React Query hooks
├── api-zod/                             # Generated Zod schemas
├── integrations-openai-ai-server/       # OpenAI AI integration module
└── db/src/schema/index.ts               # DB tables: sessions, generations, payments
```

## Routes

- `/api/auth/session` POST — create or get session (24hr trial)
- `/api/auth/session/:id` GET — get session info + trial/plan status
- `/api/generate/image` POST — real AI generation of 6 stream pack images (gpt-image-1)
- `/api/generate/video` POST — real AI generation of animated intro frame (gpt-image-1)
- `/api/generate/history/:sessionId` GET — generation history
- `/api/payments/create` POST — record Payoneer payment
- `/api/payments/history/:sessionId` GET — payment history
- `/api/payments/verify/:sessionId` GET — check active plan
