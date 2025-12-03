# English GPT Tips (Technical Docs)

**Version:** 0.1.0 (Beta)  
Status: First public release, under testing and feedback.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requirements

- Node.js >= 20 (tested with v20.x)
- npm >= 10
- An OpenAI API key (required for local development)
- Git (for cloning the repository)



## Environment Setup

Copy `.env.example` to `.env.local` and add your keys:

```bash
cp .env.example .env.local
``` 

Example:

```env
OPENAI_API_KEY=your-openai-api-key
CHAT_SYSTEM_PROMPT=Please correct the following English sentence and return three natural versions...
```



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn) - interactive tutorial
- [Learn Next.js](https://nextjs.org/learn)


## Versioning

Current version: **0.1.0 (Beta)**  
This is the first public release, under testing and feedback. Expect breaking changes before 1.0.0.

## Contributing

Feedback and contributions are welcome!  
Please open an issue or submit a pull request on GitHub.


### 👉 Commit suggestion for this refinement:

```bash
docs(readme): add requirements, env setup, and versioning notes to technical README
```


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

