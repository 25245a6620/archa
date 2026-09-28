import { askLlm, askLlmJson } from './llm';
import { retainMemory, recallMemories } from './hindsight';

type Intent =
    | "WHY_DECISION"
    | "DECISION_OUTCOME"
    | "DECISION_TIMELINE"
    | "ARCHITECTURE_COMPONENT"
    | "HISTORICAL_LESSON"
    | "COMPARISON"
    | "GENERAL_ARCHITECTURE"
    | "UNKNOWN";

export const classifyIntent = async (question: string): Promise<Intent> => {
    const systemPrompt = `
You are an intent classifier for ARCHA, an architecture decision agent.
Categorize the user's question into exactly ONE of the following tags:
- WHY_DECISION: Asking for the rationale behind an architectural decision.
- DECISION_OUTCOME: Asking what happened after a decision was made.
- DECISION_TIMELINE: Asking about the chronology of decisions.
- ARCHITECTURE_COMPONENT: Asking about specific capabilities or details of an architecture component.
- HISTORICAL_LESSON: Asking about learnings from past architectural events.
- COMPARISON: Asking to compare decisions.
- GENERAL_ARCHITECTURE: Asking general architectural knowledge not tied to specific organizational history.
- UNKNOWN: Cannot determine.

Return JSON like:
{ "intent": "WHY_DECISION" }
    `;

    try {
        const resultString = await askLlmJson(systemPrompt, question, "gpt-4o-mini");
        const parsed = JSON.parse(resultString);
        return (parsed.intent as Intent) || "UNKNOWN";
    } catch (e) {
        return "UNKNOWN";
    }
};

const doesIntentRequireMemory = (intent: Intent): boolean => {
    const memoryIntents: Intent[] = [
        "WHY_DECISION",
        "DECISION_OUTCOME",
        "DECISION_TIMELINE",
        "HISTORICAL_LESSON",
        "COMPARISON"
    ];
    return memoryIntents.includes(intent);
};

export const answerWithAgent = async (question: string, memoryEnabled: boolean) => {
    console.log(`[ARCHA] New request received. MemoryEnabled: ${memoryEnabled}`);

    // 1 & 2. Classify intent
    const intent = await classifyIntent(question);
    console.log(`[ARCHA] Intent: ${intent}`);

    // 3. Determine if memory is needed
    let memoryRequired = doesIntentRequireMemory(intent);

    // For ARCHITECTURE_COMPONENT, let's also pull memory just in case it pertains to our context.
    if (intent === "ARCHITECTURE_COMPONENT") memoryRequired = true;

    console.log(`[ARCHA] Memory required: ${memoryRequired}`);

    let recalledContext = "";
    let memoryUsed = false;
    let memoryCount = 0;
    let sources: any[] = [];

    // 4 & 5. Hindsight Recall
    if (memoryEnabled && memoryRequired) {
        try {
            console.log(`[ARCHA] Querying Hindsight for: "${question}"`);
            const recallRes: any = await recallMemories(question);

            const results = recallRes?.results || [];
            memoryCount = results.length;

            if (memoryCount > 0) {
                memoryUsed = true;
                console.log(`[ARCHA] Hindsight recall: ${memoryCount} memories`);

                recalledContext = results.map((r: any, idx: number) => {
                    sources.push({
                        type: "hindsight",
                        id: r.id || `memory-${idx}`,
                        summary: r.text ? r.text.substring(0, 50) + "..." : "Memory"
                    });
                    return r.text;
                }).join("\n\n---\n\n");
            } else {
                console.log(`[ARCHA] Hindsight recall: 0 memories found.`);
            }
        } catch (e: any) {
            console.log(`[ARCHA] Hindsight recall failed: ${e.message}`);
            // Return safe degradation
            return {
                answer: "Historical memory is currently unavailable. This response is based only on current context.",
                intent,
                memoryUsed: false,
                memoryCount: 0,
                sources: []
            };
        }
    }

    // 6 & 7. Build context & reason
    const systemPrompt = `
You are ARCHA, an architecture historian and decision agent.
Your primary role is to combine generalized reasoning with the specific organizational historical evidence provided below.

Strict Anti-Hallucination Rules:
- Treat Hindsight memories as historical evidence.
- Do not invent decisions that are not present in memory.
- Do not claim the organization made a decision unless evidence supports it.
- Distinguish historical facts from reasoning.
- If evidence is insufficient or it's a historical question and you received NO historical evidence, explicitly state that you couldn't find historical evidence.
- Do not fabricate dates, outcomes, incidents, or architecture components.
- Generic architectural knowledge must not be presented as historical organizational fact.

## Historical Organizational Evidence
${memoryUsed ? recalledContext : "NONE PROVIDED"}

Answer the user directly and concisely. Mention your sources or lack thereof where relevant.
`;

    // 8. Generate answer
    const answer = await askLlm(systemPrompt, question);
    console.log(`[ARCHA] LLM response generated.`);

    // 9 & 10. Optional Retention (stubbed conservatively)
    // We will not auto-retain generic answers to prevent pollution.

    return {
        answer,
        intent,
        memoryUsed,
        memoryCount,
        sources
    };
};
