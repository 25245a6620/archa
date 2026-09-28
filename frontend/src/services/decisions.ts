import type { ArchitectureDecision } from '../types/decision';

// Assuming Vite proxy or environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getDecisions = async (): Promise<ArchitectureDecision[]> => {
    const res = await fetch(`${BASE_URL}/api/decisions`);
    if (!res.ok) {
        throw new Error('Failed to fetch decisions');
    }
    return res.json();
};

export const getDecision = async (id: string): Promise<ArchitectureDecision> => {
    const res = await fetch(`${BASE_URL}/api/decisions/${id}`);
    if (!res.ok) {
        throw new Error('Failed to fetch decision');
    }
    return res.json();
};

export const getDecisionRelationships = async (id: string): Promise<{ outbound: any[], inbound: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/decisions/${id}/relationships`);
    if (!res.ok) {
        throw new Error('Failed to fetch relationships');
    }
    return res.json();
};
