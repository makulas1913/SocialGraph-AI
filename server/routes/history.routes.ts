import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Get history
router.get("/", async (req, res) => {
  try {
    const history = await prisma.history.findMany({
      where: { userId: null }, // Global for now, can be updated to use req.session.twitterUserId
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50
    });

    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Save to history
router.post("/", async (req, res) => {
  try {
    const { prompt, content, type } = req.body;
    
    const newHistory = await prisma.history.create({
      data: {
        prompt,
        content: JSON.stringify(content),
        type: type || "thread",
        userId: null // Global for now
      }
    });

    res.json({ success: true, data: newHistory });
  } catch (error: any) {
    console.error("Failed to save history:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

// Delete history item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.history.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete history:", error);
    res.status(500).json({ error: "Failed to delete history" });
  }
});

export default router;
