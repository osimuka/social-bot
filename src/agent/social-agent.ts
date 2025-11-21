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
