# social-bot

An intelligent TypeScript bot that uses AI to draft and publish social media posts across multiple platforms (Twitter, LinkedIn, Facebook, Instagram, Reddit, TikTok, YouTube) using the Mastra AI framework and Ayrshare API.

## Features

- 🤖 **AI-Powered Content Generation** — Uses OpenAI GPT-4o-mini to draft engaging posts
- 🌐 **Multi-Platform Publishing** — Post to 7+ social networks from one API call
- 🛠️ **Extensible Tools** — Easy to add custom platform connectors
- 📝 **Type-Safe** — Full TypeScript support with strict typing
- ⚡ **Simple Setup** — Get started in minutes

## Quick Start

```bash
# Clone and install
git clone https://github.com/osimuka/social-bot.git
cd social-bot
npm install

# Configure
cp .env.example .env
# Edit .env with your API keys

# Build and run
npm run build
npm start
```

## How It Works

This bot combines three powerful tools:

1. **[Mastra](https://mastra.ai)** — AI agent framework for building tool-calling workflows
2. **[Ayrshare](https://ayrshare.com)** — Multi-platform social media API
3. **[OpenAI GPT-4o-mini](https://openai.com)** — AI model for content generation

The agent receives a prompt, drafts content, and uses the `socialPostTool` to publish across platforms.

## Installation

```bash
npm install
```

**Dependencies:**

- `@mastra/core` — Agent framework
- `social-media-api` — Ayrshare SDK
- `zod` — Schema validation
- `dotenv` — Environment variables

## Configuration

1. **Get API Keys:**
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Ayrshare: [ayrshare.com](https://ayrshare.com)

2. **Setup `.env`:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   OPENAI_API_KEY=sk-...
   AYRSHARE_API_KEY=your_ayrshare_key_here
   ```

## Usage

### Option 1: Simple Direct Publishing (No AI)

Use `simple-demo.ts` for direct posting without AI:

```ts
import SocialMediaAPI from "social-media-api";

const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

const post = await social.post({
  post: "Hello from my TypeScript bot 🤖",
  platforms: ["twitter", "linkedin"],
});
```

Run:

```bash
npm run build
npm run demo
```

### Option 2: AI-Powered Agent (Recommended)

The agent drafts content and publishes automatically.

#### Create a Tool (`src/tools/social-post-tool.ts`)

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

#### Create an Agent (`src/agent/social-agent.ts`)

```ts
import { Agent } from "@mastra/core";
import { socialPostTool } from "../tools/social-post-tool.js";

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

#### Setup Mastra (`src/setup.ts`)

```ts
import { Mastra } from "@mastra/core";
import { socialAgent } from "./agent/social-agent.js";

export const mastra = new Mastra({
  agents: { socialAgent },
});
```

#### Run the Agent (`src/index.ts`)

```ts
import "dotenv/config";
import { mastra } from "./setup.js";

async function run() {
  try {
    const agent = mastra.getAgent("socialAgent");

    const result = await agent.generate(
      `Create a post about "Daily standup meetings are overrated. Here's what works better." ` +
        `Make it thought-provoking but respectful. Post to Twitter and LinkedIn.`,
      { maxSteps: 5 }
    );

    console.log("Result:", result.text);
    console.log("Tool Calls:", JSON.stringify(result.toolCalls, null, 2));
    console.log("Tool Results:", JSON.stringify(result.toolResults, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
```

#### Build and Run

```bash
npm run build
npm start
```

## Project Structure

```
social-bot/
├── src/
│   ├── agent/
│   │   └── social-agent.ts        # Agent configuration
│   ├── tools/
│   │   └── social-post-tool.ts    # Social posting tool
│   ├── setup.ts                   # Mastra initialization
│   ├── index.ts                   # Main entry point
│   └── simple-demo.ts             # Direct API example
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

```bash
npm run typecheck    # Type-check without building
npm run build        # Compile TypeScript to dist/
npm start            # Run agent (dist/index.js)
npm run demo         # Run simple demo (dist/simple-demo.js)
```

## API Reference

### `socialPostTool`

Mastra tool for posting to social media platforms.

**Parameters:**

- `text` (string) — Post content
- `platforms` (array) — Platform names: `"twitter"`, `"facebook"`, `"linkedin"`, `"instagram"`, `"reddit"`, `"tiktok"`, `"youtube"`

**Returns:**

- `output` (string) — Success message
- `id` (string, optional) — Post ID from Ayrshare

### `socialAgent`

Mastra agent configured for social media content generation.

**Configuration:**

- **Model:** `openai/gpt-4o-mini`
- **Tools:** `socialPostTool`
- **Instructions:** Craft engaging, platform-appropriate posts

**Methods:**

```ts
agent.generate(prompt: string, options?: { maxSteps?: number })
```

## Contributing

Contributions welcome! To extend the bot:

1. **Add new tools** in `src/tools/`
2. **Create custom agents** in `src/agent/`
3. **Wire them up** in `src/setup.ts`

Example: Add a Twitter-specific tool using `twitter-api-v2` for advanced features like threads or polls.

## Troubleshooting

| Issue                   | Solution                                                    |
| ----------------------- | ----------------------------------------------------------- |
| Posts fail              | Verify API keys in `.env` and check Ayrshare rate limits    |
| Build errors            | Run `npm install` to ensure dependencies are installed      |
| Type errors             | Run `npm run typecheck` for detailed TypeScript diagnostics |
| Agent doesn't call tool | Ensure prompt explicitly asks to "publish" or "post"        |

## Resources

- [Mastra Documentation](https://docs.mastra.ai)
- [Ayrshare API Docs](https://docs.ayrshare.com)
- [OpenAI API Reference](https://platform.openai.com/docs)

## License

MIT — See [LICENSE](LICENSE) file for details.

---

**Built with** [Mastra](https://mastra.ai) • [Ayrshare](https://ayrshare.com) • [OpenAI](https://openai.com)
