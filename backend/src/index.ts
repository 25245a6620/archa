import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with fallback paths
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import memoryRoutes from './routes/memory';
import agentRoutes from './routes/agent';
import decisionRoutes from './routes/decisions';
app.use('/api/memory', memoryRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/decisions', decisionRoutes);

// Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'archa-backend'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`ARCHA backend listening on port ${port}`);
});
