import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recallMemory } from '../../services/memory';
import type { MemoryResult } from '../../services/memory';
import { getDecision } from '../../services/decisions';
import type { ArchitectureDecision } from '../../types/decision';

export default function MemoryInspector() {
    const [searchParams] = useSearchParams();
    const decisionId = searchParams.get('decision');

    const [decision, setDecision] = useState<ArchitectureDecision | null>(null);
    const [memories, setMemories] = useState<MemoryResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!decisionId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch structural data briefly context
            const d = await getDecision(decisionId);
            setDecision(d);

            // Fetch semantic organisational memory
            const query = `NovaCart ${d.id} ${d.technologies.join(' ')} decision rationale alternatives tradeoffs outcome lessons`;
            const mems = await recallMemory(query);

            // Limit shown memories loosely tied to decision ID or top matching scores
            const focusedMems = mems.filter(m => m.metadata?.decisionId === decisionId || m.text.includes(decisionId)).slice(0, 3);
            setMemories(focusedMems.length > 0 ? focusedMems : mems.slice(0, 3));

        } catch (err: any) {
            setError(err.message || 'Unable to retrieve historical memory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [decisionId]);

    if (!decisionId) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>No decision selected for inspection.</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <div style={{ background: '#111827', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>MEMORY INSPECTOR</h2>
                    <span style={{ fontSize: '0.75rem', background: '#374151', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 600 }}>Memory: ON</span>
                </div>

                <div style={{ padding: '1.5rem', background: '#ffffff' }}>
                    {decision && (
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Decision:</div>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', color: '#111827' }}>{decision.id} — {decision.title}</h3>
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', margin: '0 0 0.5rem 0' }}>Memory Status:</h4>
                        {loading && <div style={{ color: '#6b7280' }}>Retrieving historical memory...</div>}
                        {error && (
                            <div style={{ color: '#dc2626' }}>
                                <div>{error}</div>
                                <button onClick={loadData} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Retry</button>
                            </div>
                        )}
                        {!loading && !error && memories.length > 0 && <div style={{ color: '#166534', fontWeight: 500 }}>Historical evidence available</div>}
                        {!loading && !error && memories.length === 0 && <div style={{ color: '#9ca3af' }}>No historical memory found for this decision.</div>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {memories.map((mem, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #3b82f6', borderRadius: '0.5rem', padding: '1.5rem', position: 'relative' }}>
                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#1d4ed8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    Hindsight Memory Card
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {mem.text}
                                </p>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Source: Hindsight</span>
                                    {mem.scores && mem.scores.semantic && (
                                        <span>Confidence: {Math.round(mem.scores.semantic * 100)}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
