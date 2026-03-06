import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";

const router = Router();

// Middleware to check if user is authenticated with Twitter
const requireTwitterAuth = (req: any, res: any, next: any) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not authenticated with Twitter" });
  }
  next();
};

// --- Post Thread to Twitter ---
router.post("/post-thread", requireTwitterAuth, async (req, res) => {
  try {
    const { tweets } = req.body; // Array of strings

    if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return res.status(400).json({ error: "Invalid tweets payload" });
    }

    const accessToken = req.session.accessToken!;
    const client = new TwitterApi(accessToken);

    // Post thread
    const tweetResponses = await client.v2.tweetThread(tweets);

    res.json({ success: true, tweetResponses });
  } catch (error: any) {
    console.error("Error posting thread to Twitter:", error);
    
    // Handle token expiration
    if (error.code === 401) {
       req.session.accessToken = undefined;
       return res.status(401).json({ error: "Twitter session expired. Please reconnect." });
    }

    res.status(500).json({ error: error.message || "Failed to post thread" });
  }
});

// --- Get Mentions ---
router.get("/mentions", requireTwitterAuth, async (req, res) => {
  try {
    const accessToken = req.session.accessToken!;
    const client = new TwitterApi(accessToken);
    
    // We need the user ID to fetch mentions
    const me = await client.v2.me();
    const userId = me.data.id;

    // Fetch mentions
    const mentions = await client.v2.userMentionTimeline(userId, {
      "tweet.fields": ["created_at", "author_id", "conversation_id"],
      expansions: ["author_id", "in_reply_to_user_id"],
      "user.fields": ["name", "username", "profile_image_url"],
      max_results: 20
    });

    res.json({ success: true, data: mentions.data.data || [], includes: mentions.data.includes });
  } catch (error: any) {
    console.error("Error fetching mentions:", error);
    res.status(500).json({ error: error.message || "Failed to fetch mentions" });
  }
});

// --- Reply to Tweet ---
router.post("/reply", requireTwitterAuth, async (req, res) => {
  try {
    const { tweetId, text } = req.body;
    
    if (!tweetId || !text) {
      return res.status(400).json({ error: "Missing tweetId or text" });
    }

    const accessToken = req.session.accessToken!;
    const client = new TwitterApi(accessToken);

    const reply = await client.v2.reply(text, tweetId);
    
    res.json({ success: true, data: reply.data });
  } catch (error: any) {
    console.error("Error replying to tweet:", error);
    res.status(500).json({ error: error.message || "Failed to reply to tweet" });
  }
});

// --- Get Direct Messages ---
router.get("/dms", requireTwitterAuth, async (req, res) => {
  try {
    const accessToken = req.session.accessToken!;
    const client = new TwitterApi(accessToken);
    
    const dms = await client.v2.listDmEvents({
      "dm_event.fields": ["created_at", "sender_id", "text"],
      expansions: ["sender_id"],
      "user.fields": ["name", "username", "profile_image_url"],
      max_results: 20
    });

    res.json({ success: true, data: dms.data.data || [], includes: dms.data.includes });
  } catch (error: any) {
    console.error("Error fetching DMs:", error);
    res.status(500).json({ error: error.message || "Failed to fetch DMs" });
  }
});

// --- Send Direct Message ---
router.post("/dm", requireTwitterAuth, async (req, res) => {
  try {
    const { participantId, text } = req.body;
    
    if (!participantId || !text) {
      return res.status(400).json({ error: "Missing participantId or text" });
    }

    const accessToken = req.session.accessToken!;
    const client = new TwitterApi(accessToken);

    const dm = await client.v2.sendDmToParticipant(participantId, { text });
    
    res.json({ success: true, data: dm });
  } catch (error: any) {
    console.error("Error sending DM:", error);
    res.status(500).json({ error: error.message || "Failed to send DM" });
  }
});

export default router;
