const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AgentSource {
    type: string;
    id: string;
    summary: string;
    metadata?: any;
}

export interface AgentResponse {
    answer: string;
    intent: string;
    memoryUsed: boolean;
    memoryCount: number;
    sources: AgentSource[];
}

export const askArcha = async (question: string, memoryEnabled: boolean): Promise<AgentResponse> => {
    const res = await fetch(`${BASE_URL}/api/agent/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, memoryEnabled })
    });

    if (!res.ok) {
        throw new Error('ARCHA could not complete the investigation.');
    }

    return res.json();
};
