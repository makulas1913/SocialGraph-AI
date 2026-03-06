import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";

const router = Router();

// Helper to get redirect URI based on environment
const getRedirectUri = () => {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/api/auth/twitter/callback`;
};

// 1. Generate Auth URL
router.get("/twitter/url", (req, res) => {
  try {
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      return res.status(500).json({ error: "Twitter Client ID or Secret is not configured." });
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const redirectUri = getRedirectUri();

    // Generate OAuth 2.0 PKCE auth link
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      redirectUri,
      { scope: ["tweet.read", "tweet.write", "users.read", "offline.access", "dm.read", "dm.write"] }
    );

    // Encode the codeVerifier into the state parameter
    const statePayload = Buffer.from(JSON.stringify({
      s: state,
      v: codeVerifier
    })).toString('base64url');

    // Replace the original state in the URL with our payload
    const finalUrl = url.replace(`state=${state}`, `state=${statePayload}`);

    res.json({ url: finalUrl });
  } catch (error: any) {
    console.error("Error generating Twitter Auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// 2. Callback Handler
router.get(["/twitter/callback", "/twitter/callback/"], async (req, res) => {
  try {
    const { state: statePayload, code } = req.query;

    if (!statePayload || !code) {
      return res.status(400).send("Missing state or code from Twitter.");
    }

    // Decode the state payload
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(statePayload as string, 'base64url').toString());
    } catch (e) {
      return res.status(400).send("Invalid state payload.");
    }

    const { s: originalState, v: codeVerifier } = decoded;

    if (!codeVerifier || !originalState) {
      return res.status(400).send("Invalid session data in state.");
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const redirectUri = getRedirectUri();

    // Exchange code for access token
    const { client: loggedClient, accessToken, refreshToken } = await client.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri,
    });

    // Get user info
    const user = await loggedClient.v2.me();

    // Store in session
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    req.session.twitterUserId = user.data.id;
    req.session.twitterUsername = user.data.username;

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'TWITTER_AUTH_SUCCESS', username: '${user.data.username}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Twitter callback error:", error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

// 3. Check Auth Status
router.get("/twitter/status", (req, res) => {
  if (req.session.accessToken && req.session.twitterUsername) {
    res.json({ authenticated: true, username: req.session.twitterUsername });
  } else {
    res.json({ authenticated: false });
  }
});

// 4. Logout
router.post("/twitter/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("socialgraph_session");
    res.json({ success: true });
  });
});

export default router;
