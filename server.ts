import express from "express";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import FileStoreFactory from "session-file-store";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./server/routes/auth.routes.js";
import twitterRoutes from "./server/routes/twitter.routes.js";

dotenv.config();

const FileStore = FileStoreFactory(session);

// Extend session type
declare module "express-session" {
  interface SessionData {
    codeVerifier?: string;
    state?: string;
    accessToken?: string;
    refreshToken?: string;
    twitterUserId?: string;
    twitterUsername?: string;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required for secure cookies behind a reverse proxy (like Cloud Run)
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(cookieParser());
  
  // Session setup for storing OAuth state and tokens
  app.use(
    session({
      store: new FileStore({
        path: './sessions',
        retries: 0
      }),
      name: 'socialgraph_session',
      secret: process.env.SESSION_SECRET || "super-secret-key-for-dev",
      resave: true,
      saveUninitialized: true,
      proxy: true, // Crucial for secure cookies behind proxy
      cookie: {
        secure: true, // Required for SameSite=None
        sameSite: "none", // Required for cross-origin iframe
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
    })
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", session: req.sessionID });
  });

  // Mount modular routes
  app.use("/api/auth", authRoutes);
  app.use("/api/twitter", twitterRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
