import { Mastra } from "@mastra/core";
import { socialAgent } from "./agents/social-agent.js";

export const mastra = new Mastra({
  agents: { socialAgent },
});
