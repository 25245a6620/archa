import express from 'express';
import { novacartDecisions } from '../data/novacartDecisions';
import { retainMemory, recallMemories } from '../services/hindsight';

const router = express.Router();

router.get('/', (req, res) => {
    res.json(novacartDecisions);
});

router.get('/:id', (req, res) => {
    const decision = novacartDecisions.find(d => d.id === req.params.id);
    if (!decision) {
        return res.status(404).json({ error: 'Decision not found' });
    }
    res.json(decision);
});

router.get('/:id/relationships', (req, res) => {
    const decision = novacartDecisions.find(d => d.id === req.params.id);
    if (!decision) {
        return res.status(404).json({ error: 'Decision not found' });
    }

    // Get relationships pointing FROM this decision
    const outbound = decision.relatedDecisions;

    // Get relationships pointing TO this decision
    const inbound = novacartDecisions
        .filter(d => d.relatedDecisions.some(r => r.targetDecisionId === decision.id))
        .map(d => {
            const rel = d.relatedDecisions.find(r => r.targetDecisionId === decision.id)!;
            return {
                sourceDecisionId: d.id,
                targetDecisionId: decision.id,
                relationship: rel.relationship,
                explanation: rel.explanation
            };
        });

    res.json({ outbound, inbound });
});

router.post('/seed', async (req, res) => {
    try {
        let seededCount = 0;
        let skippedCount = 0;

        for (const decision of novacartDecisions) {
            // Safe Duplicate Prevention via Hindsight semantics
            // Check if this decision ID already exists in the bank
            const existing = await recallMemories(`AD-${decision.id}`); // Broad enough query

            // Look into results metadata
            const alreadyExists = existing.results?.some((r: any) => r.metadata?.decisionId === decision.id);

            if (alreadyExists) {
                skippedCount++;
                continue;
            }

            // Build semantic text representation
            const content = `NOVA_CART ARCHITECTURE DECISION ${decision.id}

Decision:
${decision.title}
${decision.decision}

Context:
${decision.context}
${decision.problem}

Alternatives considered:
${decision.alternatives.map(a => `- ${a.name} (Rejected: ${a.rejectionReason})`).join('\n')}

Rationale:
${decision.rationale.join('\n')}

Trade-offs:
${decision.tradeoffs.map(t => `- ${t.category}: ${t.benefit} (Benefit) vs ${t.cost} (Cost)`).join('\n')}

Implementation:
${decision.implementation}

Outcome:
${decision.outcome}

Lesson:
${decision.lesson}

Future guidance:
${decision.futureGuidance}

Related decisions:
${decision.relatedDecisions.map(r => `- ${r.targetDecisionId} (${r.relationship}): ${r.explanation}`).join('\n')}

Technologies:
${decision.technologies.join(', ')}
`;

            // Retain to hindsight memory
            await retainMemory(content, {
                decisionId: decision.id,
                status: decision.status,
                type: 'architecture_decision'
            });
            seededCount++;
        }

        res.json({ message: 'Seeding complete', seededCount, skippedCount });
    } catch (error: any) {
        console.error("Seed error:", error);
        res.status(500).json({ error: error.message || 'Failed to seed memories' });
    }
});

export default router;
