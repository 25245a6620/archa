import { Router, Request, Response } from 'express';
import { answerWithAgent } from '../services/agent';
import { getLlmClient } from '../services/llm';

const router = Router();

router.post('/ask', async (req: Request, res: Response) => {
    try {
        const { question, memoryEnabled } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Missing question' });
        }

        // Fast fail if LLM is unconfigured
        try {
            getLlmClient();
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }

        const isMemoryOn = memoryEnabled === true || memoryEnabled === 'true';

        const result = await answerWithAgent(question, isMemoryOn);
        res.json(result);
    } catch (error: any) {
        // Safe configuration/execution error mapping, masking real keys
        if (error.message && error.message.includes('401')) {
            return res.status(500).json({ error: 'LLM API failure: Invalid credentials configured.' });
        }
        res.status(500).json({ error: 'Agent failed to process request due to internal error.' });
    }
});

export default router;
