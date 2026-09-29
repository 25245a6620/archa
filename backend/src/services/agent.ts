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
        let raw = resultString.trim();
        if (raw.startsWith('```json')) raw = raw.replace(/^```json\s*/, '');
        if (raw.startsWith('```')) raw = raw.replace(/^```\s*/, '');
        if (raw.endsWith('```')) raw = raw.replace(/\s*```$/, '');
        const parsed = JSON.parse(raw);
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

            let results = recallRes?.results || [];

            // Phase 7.2 Strict Evidence Relevance Validation
            // Empirically calibrated: valid historical decisions score >= 0.80 in Hindsight, while unknown decisions score < 0.73
            const RELEVANCE_THRESHOLD = 0.80;
            results = results.filter((r: any) => r.scores && r.scores.semantic >= RELEVANCE_THRESHOLD);

            const decisionIds = results.map((r: any) => r.metadata?.decisionId).filter(Boolean);
            if (decisionIds.length > 0) {
                const primaryDecisionId = decisionIds[0];
                results = results.filter((r: any) => r.metadata?.decisionId === primaryDecisionId).slice(0, 3);
            } else if (intent === "WHY_DECISION") {
                // If asking why a decision was made and no decision metadata matches, do not attach unrelated generic policies
                results = [];
            } else {
                results = results.slice(0, 3);
            }

            memoryCount = results.length;

            if (memoryCount > 0) {
                memoryUsed = true;
                console.log(`[ARCHA] Hindsight recall: ${memoryCount} memories`);

                recalledContext = results.map((r: any, idx: number) => {
                    sources.push({
                        type: "hindsight",
                        id: r.id || `memory-${idx}`,
                        summary: r.text ? r.text.substring(0, 50) + "..." : "Memory",
                        metadata: r.metadata || {}
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
${!memoryEnabled
            ? "- Historical memory is DISABLED. You did not search historical memory. Therefore, DO NOT claim that you searched and found no evidence. Instead, clarify that historical memory was bypassed and you are providing a general architectural answer."
            : "- If evidence is insufficient or it's a historical question and you received NO historical evidence (NONE PROVIDED), explicitly state that no historical evidence was found for this question."}
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
