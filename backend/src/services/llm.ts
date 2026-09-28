import OpenAI from 'openai';

export const getLlmClient = () => {
    // Utilize OpenAI SDK via Nvidia-compatible endpoint mapping
    const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.NVIDIA_BASE_URL || process.env.OPENAI_BASE_URL;

    if (!apiKey) {
        throw new Error("Missing LLM API_KEY environment variable.");
    }

    return new OpenAI({
        apiKey,
        baseURL: baseURL || undefined,
        timeout: 15000 // 15 seconds to prevent indefinite hangs
    });
};

const getModel = (defaultModel: string) => process.env.NVIDIA_MODEL || defaultModel;

export const askLlm = async (systemPrompt: string, userMessage: string, model: string = "gpt-4o") => {
    const client = getLlmClient();

    const response = await client.chat.completions.create({
        model: getModel(model),
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    });

    return response.choices[0]?.message?.content || "";
};

export const askLlmJson = async (systemPrompt: string, userMessage: string, model: string = "gpt-4o") => {
    const client = getLlmClient();

    const response = await client.chat.completions.create({
        model: getModel(model),
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    });

    return response.choices[0]?.message?.content || "{}";
};
