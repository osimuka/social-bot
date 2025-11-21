import "dotenv/config";
import { mastra } from "./mastra/index.js";

console.log("=== IMPORTS SUCCESSFUL ===");

async function run() {
  console.log("=== STARTING RUN FUNCTION ===");

  try {
    const agent = mastra.getAgent("socialAgent");
    console.log("Agent loaded successfully");

    // const result = await agent.generate(
    //   `Create a fun launch post for our new AI feature and then publish it to Twitter and LinkedIn.
    //  The feature: "Automatic weekly summaries of your team Slack channels." Use the social-post tool 
    // to actually publish.`
    // );

    const result = await agent.generate(
      `Create a post: "Daily standup meetings are overrated. Here's what works better." Make it thought-provoking but respectful. Post to Twitter and LinkedIn.`,
      {
        maxSteps: 5 // Allow multiple reasoning steps
      }
    );

    // const result = await agent.generate(
    //   `Write a social media post about Dark Mode and publish it to twitter using the socialPostTool.`,
    //   {
    //     maxSteps: 5 // Allow multiple reasoning steps
    //   }
    // );

    console.log("\n=== AGENT RESPONSE ===");
    console.log("RESULTS:", result.text);

    console.log("\n=== TOOL CALLS ===");
    console.log(JSON.stringify(result.toolCalls, null, 2));

    console.log("\n=== TOOL RESULTS ===");
    console.log(JSON.stringify(result.toolResults, null, 2));

  } catch (error) {
    console.error("=== ERROR OCCURRED ===", error);
  }
}

console.log("=== CALLING RUN FUNCTION ===");
run().catch(error => {
  console.error("=== UNCAUGHT ERROR ===", error);
});
console.log("=== RUN FUNCTION CALLED ===");