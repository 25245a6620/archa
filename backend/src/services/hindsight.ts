import { HindsightClient, RetainRequest, RecallRequest, ReflectRequest } from '@vectorize-io/hindsight-client';

const getClient = () => {
    const apiKey = process.env.HINDSIGHT_API_KEY;
    const baseUrl = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';

    if (!apiKey) {
        throw new Error('HINDSIGHT_API_KEY environment variable is missing.');
    }

    return new HindsightClient({
        apiKey,
        baseUrl
    });
};

const getBankId = (): string => {
    const bankId = process.env.HINDSIGHT_BANK_ID;
    if (!bankId) {
        throw new Error('HINDSIGHT_BANK_ID environment variable is missing.');
    }
    return bankId;
};

export const retainMemory = async (content: string, metadata: Record<string, any>) => {
    const client = getClient();
    const bankId = getBankId();

    return client.retain(bankId, content, { metadata });
};

export const recallMemories = async (query: string) => {
    const client = getClient();
    const bankId = getBankId();

    return client.recall(bankId, query);
};

export const reflectOnMemories = async (topic: string) => {
    const client = getClient();
    const bankId = getBankId();

    return client.reflect(bankId, topic);
};

export const getMemoryStats = async () => {
    const client = getClient();
    const bankId = getBankId();

    return client.getBankProfile(bankId);
};
