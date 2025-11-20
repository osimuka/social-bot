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

Install the multi-network client (Ayrshare SDK) and the example dependencies shown below.

```bash
npm install social-media-api

# (optional) Mastra + AI tooling
npm install mastra @mastra/core zod @ai-sdk/openai
npm install -D typescript @types/node
```

## Configuration

Create a `.env` file at the project root with your keys:

```env
OPENAI_API_KEY=sk-...
AYRSHARE_API_KEY=your_ayrshare_key_here
```

Make sure your app loads `.env` (e.g., via `dotenv`) or that your deployment environment provides these variables.

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

Use Mastra to create tools and agents. The agent can draft posts, request human approval, and call platform-specific tools to publish.

Example tool: `src/mastra/tools/social-post-tool.ts`

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
  outputSchema: z.object({ id: z.string().optional(), raw: z.any() }),
  execute: async ({ context }) => {
    const res = await social.post({
      post: context.text,
      platforms: context.platforms,
    });
    return { id: (res as any).id, raw: res };
  },
});
```

Example agent: `src/mastra/agents/social-agent.ts`

```ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { socialPostTool } from "../tools/social-post-tool";

export const socialAgent = new Agent({
  name: "social-bot",
  instructions: `You are an assistant that writes short, engaging, on-brand social media posts.\\n- Keep posts within the typical limits of the target platforms.\\n- Use clear, friendly language.\\n- Only call the social-post tool when explicitly asked to publish.`,
  model: openai("gpt-4o-mini"),
  tools: { socialPostTool },
});
```

Register Mastra and run a simple runner:

`src/mastra/index.ts`

```ts
import { Mastra } from "@mastra/core/mastra";
import { socialAgent } from "./agents/social-agent";

export const mastra = new Mastra({ agents: { socialAgent } });
```

`src/index.ts` (runner):

```ts
import { mastra } from "./mastra";

async function run() {
  const agent = mastra.getAgent("socialAgent");
  const result = await agent.generate(
    `Create a fun launch post for our new AI feature and then publish it to Twitter and LinkedIn. The feature: "Automatic weekly summaries of your team Slack channels." Use the social-post tool to actually publish.`,
    { tools: { socialPost: { platforms: ["twitter", "linkedin"] } } as any }
  );

  console.log(result.text);
}

run().catch(console.error);
```

Typical workflow:

- Agent drafts posts.
- Optional human approval step.
- Agent calls `socialPostTool` (or platform-specific tools) to publish.

## Alternatives — rolling your own connectors

If you prefer to implement your own connectors per platform (for finer control, richer features, or to avoid third-party multi-network providers), consider these TypeScript-friendly clients:

- Twitter/X: `twitter-api-v2`
- Instagram: `instagram-private-api` (private API clients may violate platform terms; use with caution)
- Reddit: `snoowrap` (+ `snoostorm` for streaming/event-style bots)

Wrap each API in a Mastra tool (for example, `twitterPostTool`, `redditPostTool`), and let the agent decide which tool(s) to call based on the request.

## Troubleshooting

- If posts fail, inspect the raw response from the platform client (returned as `raw` by the tool).
- Check API rate limits and credentials.
- For Mastra issues, verify input/output schemas and that tools are correctly registered with the agent.

## License

Add your license information here (e.g., `MIT`).

---

If you'd like, I can also:

- Add example files to `src/` with the code shown above.
- Create a `README-converted.md` instead of overwriting (you asked to overwrite, so I updated `README.md`).
- Commit changes and open a draft PR.

Tell me which next step you'd like.
