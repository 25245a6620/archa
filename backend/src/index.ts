import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

import memoryRoutes from './routes/memory';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/memory', memoryRoutes);

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
