/**
 * Simple demo without Mastra - direct posting to social media via Ayrshare
 * Run with: node dist/simple-demo.js
 */
import SocialMediaAPI from "social-media-api";

const social = new SocialMediaAPI(process.env.AYRSHARE_API_KEY!);

async function demo() {
  try {
    // Post to multiple platforms
    const post = await social.post({
      post: "Hello from my TypeScript bot 🤖",
      platforms: ["twitter", "facebook", "linkedin"],
    });

    console.log("✅ Posted successfully:", post);

    // Get posting history
    const history = await social.history();
    console.log("\n📜 Recent posts:", history);
  } catch (error) {
    console.error("❌ Error posting:", error);
  }
}

demo();
