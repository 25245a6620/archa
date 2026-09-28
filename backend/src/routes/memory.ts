import { Router, Request, Response } from 'express';
import { retainMemory, recallMemories, reflectOnMemories, getMemoryStats } from '../services/hindsight';

const router = Router();

router.get('/status', async (req: Request, res: Response) => {
    try {
        const stats = await getMemoryStats();
        res.json({
            connected: true,
            bankId: process.env.HINDSIGHT_BANK_ID,
            profile: stats
        });
    } catch (error: any) {
        res.status(500).json({
            connected: false,
            error: error.message || 'Failed to connect to Hindsight'
        });
    }
});

router.post('/retain', async (req: Request, res: Response) => {
    try {
        const { content, metadata } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Missing content' });
        }
        const result = await retainMemory(content, metadata || {});
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to retain memory' });
    }
});

router.post('/recall', async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Missing query' });
        }
        const result = await recallMemories(query);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to recall memory' });
    }
});

router.post('/reflect', async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Missing topic' });
        }
        const result = await reflectOnMemories(topic);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to reflect on memory' });
    }
});

export default router;
