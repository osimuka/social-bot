import { mastra } from "./mastra";

async function run() {
  const agent = mastra.getAgent("socialAgent");
  const result = await agent.generate(
    `Create a fun launch post for our new AI feature and then publish it to Twitter and LinkedIn. The feature: "Automatic weekly summaries of your team Slack channels." Use the social-post tool to actually publish.`
  );

  console.log(result.text);
}

run().catch(console.error);
