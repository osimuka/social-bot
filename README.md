<!-- Converted and reorganized README -->

# social-bot

A compact guide to building a TypeScript-based social posting bot that can publish to multiple networks. This repository shows two approaches:

- Use a single multi-network API (`ayrshare` / `social-media-api`) for a generic publishing layer.
- Or implement per-platform connectors and wire them into a Mastra agent for intelligent drafting and publishing.

## Contents

- **Overview** — what this project demonstrates
- **Installation** — packages to install
- **Configuration** — environment variables and keys
- **Usage** — simple examples using `social-media-api` and a Mastra agent
- **Alternatives** — notes on rolling your own connectors
- **License** — add your license info

## Overview

If you need a single codepath that can post to many social networks, using a multi-network API (like Ayrshare) is the simplest option. It provides posting, scheduling, analytics, comments, and history from one client.

For more control, use per-platform SDKs (Twitter, Instagram, Reddit, etc.) and expose each as a Mastra tool. Then a Mastra agent can draft content, choose the right tools, and optionally publish.

## Installation

Install dependencies:

```bash
npm install
```

Or manually install packages:

```bash
npm install social-media-api @mastra/core zod dotenv
npm install -D typescript @types/node mastra
```

## Configuration

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
OPENAI_API_KEY=sk-...
AYRSHARE_API_KEY=your_ayrshare_key_here
```

## Usage

Below are two usage patterns: a simple direct publisher using `social-media-api`, and a Mastra-based agent that drafts and publishes.

### 1) Simple publisher (Ayrshare / `social-media-api`)

Install `social-media-api` and use it directly to post to multiple platforms from one call.

Example (Node/TypeScript):

```ts
import SocialMediaAPI from "social-media-api";

const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

async function demo() {
  const post = await social.post({
    post: "Hello from my TypeScript bot 🤖",
    platforms: ["twitter", "facebook", "linkedin"], // other options: "instagram", "reddit", "tiktok", etc.
  });

  console.log("Posted:", post);

  const history = await social.history();
  console.log("History:", history);
}

demo().catch(console.error);
```

This gives you a generic social-bot layer: one function that publishes to multiple networks.

### 2) Intelligent workflow with Mastra

Use Mastra to create tools and agents. The agent can draft posts and call tools to publish.

**Tool** (`src/mastra/tools/social-post-tool.ts`):

```ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import SocialMediaAPI from "social-media-api";

const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

export const socialPostTool = createTool({
  id: "social-post",
  description:
    "Post a message to configured social media accounts via Ayrshare.",
  inputSchema: z.object({
    text: z.string().describe("Final social post text"),
    platforms: z
      .array(
        z.enum([
          "twitter",
          "facebook",
          "linkedin",
          "instagram",
          "reddit",
          "tiktok",
          "youtube",
        ])
      )
      .nonempty()
      .describe("Which platforms to publish to"),
  }),
  outputSchema: z.object({
    output: z.string(),
    id: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const res = await social.post({
      post: context.text,
      platforms: context.platforms,
    });
    return {
      output: `Posted successfully to ${context.platforms.join(", ")}`,
      id: (res as any).id,
    };
  },
});
```

**Agent** (`src/mastra/agents/social-agent.ts`):

```ts
import { Agent } from "@mastra/core";
import { socialPostTool } from "../tools/social-post-tool";

export const socialAgent = new Agent({
  name: "social-bot",
  instructions:
    "You are an assistant that writes short, engaging, on-brand social media posts. " +
    "Keep posts within the typical limits of the target platforms. " +
    "Use clear, friendly language. " +
    "Only call the social-post tool when explicitly asked to publish.",
  model: "openai/gpt-4o-mini",
  tools: { socialPostTool },
});
```

**Mastra setup** (`src/mastra/index.ts`):

```ts
import { Mastra } from "@mastra/core";
import { socialAgent } from "./agents/social-agent";

export const mastra = new Mastra({ agents: { socialAgent } });
```

**Runner** (`src/index.ts`):

```ts
import { mastra } from "./mastra";

async function run() {
  const agent = mastra.getAgent("socialAgent");
  const result = await agent.generate(
    `Create a fun launch post for our new AI feature and then publish it to Twitter and LinkedIn. The feature: "Automatic weekly summaries of your team Slack channels." Use the social-post tool to actually publish.`
  );

  console.log(result.text);
}

run().catch(console.error);
```

**Run it:**

```bash
npm run build
npm start
```

## Alternatives — rolling your own connectors

If you prefer to implement your own connectors per platform (for finer control, richer features, or to avoid third-party multi-network providers), consider these TypeScript-friendly clients:

- Twitter/X: `twitter-api-v2`
- Instagram: `instagram-private-api` (private API clients may violate platform terms; use with caution)
- Reddit: `snoowrap` (+ `snoostorm` for streaming/event-style bots)

Wrap each API in a Mastra tool (for example, `twitterPostTool`, `redditPostTool`), and let the agent decide which tool(s) to call based on the request.

## Troubleshooting

- **Posts fail**: Check API credentials and rate limits
- **Build errors**: Run `npm install` to ensure all dependencies are installed
- **Type errors**: Run `npm run typecheck` to see detailed TypeScript errors

## Project Structure

```
social-bot/
├── src/
│   ├── mastra/
│   │   ├── tools/
│   │   │   └── social-post-tool.ts    # Ayrshare posting tool
│   │   ├── agents/
│   │   │   └── social-agent.ts        # Mastra agent definition
│   │   └── index.ts                   # Mastra setup
│   ├── index.ts                       # Main runner (with Mastra)
│   └── simple-demo.ts                 # Simple demo (no AI)
├── .env.example                       # Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

```bash
npm run typecheck    # Type-check without building
npm run build        # Compile TypeScript to dist/
npm start            # Run Mastra agent (dist/index.js)
npm run demo         # Run simple demo (dist/simple-demo.js)
```

## License

MIT
