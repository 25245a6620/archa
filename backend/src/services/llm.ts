import OpenAI from 'openai';

export const getLlmClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;

    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY environment variable.");
    }

    return new OpenAI({
        apiKey,
        baseURL: baseURL || undefined
    });
};

export const askLlm = async (systemPrompt: string, userMessage: string, model: string = "gpt-4o") => {
    const client = getLlmClient();

    const response = await client.chat.completions.create({
        model,
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
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" }
    });

    return response.choices[0]?.message?.content || "{}";
};
