export interface Alternative {
    name: string;
    advantages: string[];
    disadvantages: string[];
    rejectionReason: string;
}

export interface Tradeoff {
    category: string;
    benefit: string;
    cost: string;
}

export interface DecisionRelationship {
    targetDecisionId: string;
    relationship: string;
    explanation: string;
}

export interface ArchitectureDecision {
    id: string;
    title: string;
    status: string;
    date: string;
    context: string;
    problem: string;
    alternatives: Alternative[];
    decision: string;
    rationale: string[];
    tradeoffs: Tradeoff[];
    implementation: string;
    outcome: string;
    problems?: string[];
    resolution?: string;
    lesson: string;
    futureGuidance: string;
    technologies: string[];
    relatedDecisions: DecisionRelationship[];
}
