// Assuming Vite proxy or environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface MemoryResult {
    id: string;
    text: string;
    type: string;
    metadata?: any;
    scores?: any;
}

export const recallMemory = async (query: string): Promise<MemoryResult[]> => {
    const res = await fetch(`${BASE_URL}/api/memory/recall`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });

    if (!res.ok) {
        throw new Error('Failed to fetch memory from backend');
    }

    const data = await res.json();
    return data.results || [];
};
