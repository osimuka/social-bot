import { Mastra } from "@mastra/core";
import { socialAgent } from "./agent/social-agent.js";

export const mastra = new Mastra({
  agents: { socialAgent },
});
