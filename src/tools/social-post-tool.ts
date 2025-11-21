import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import SocialMediaAPI from "social-media-api";

const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

export const socialPostTool = createTool({
  id: "social-post",
  description: "Post a message to configured social media accounts via Ayrshare.",
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
    const res = await social.post({ post: context.text, platforms: context.platforms });
    return {
      output: `Posted successfully to ${context.platforms.join(", ")}`,
      id: (res as any).id,
    };
  },
});
