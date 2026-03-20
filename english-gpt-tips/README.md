# English GPT Tips

**Version:** 0.1.0 (Beta)  
**Product:** ThreeTone English

ThreeTone English is a small Next.js app that rewrites one sentence into three English tones: **Informal**, **Neutral**, and **Formal**.

## Project structure

This repository keeps the runnable Next.js app inside the `english-gpt-tips/` directory. Run all Node.js commands from that folder.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- An OpenAI API key

## Environment setup

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Example:

```env
OPENAI_API_KEY=your-openai-api-key
CHAT_SYSTEM_PROMPT=Please correct the following English sentence and return three natural versions: one informal, one neutral (everyday), and one formal. Keep the original meaning.
```

## Getting started

```bash
cd english-gpt-tips
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Current release focus

This beta release is optimized for:
- short single-sentence rewrites,
- simple three-tone output,
- local development and Vercel-style deployment.

## Recommended next steps

- Add automated tests for the API route and response parser.
- Move the model response to a structured JSON format.
- Add rate limiting and basic analytics before a wider public launch.
