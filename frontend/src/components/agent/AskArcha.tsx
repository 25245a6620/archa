import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { askArcha } from '../../services/agent';
import type { AgentResponse } from '../../services/agent';
import { getDecisionRelationships } from '../../services/decisions';
import type { DecisionRelationship } from '../../types/decision';

export default function AskArcha() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState('');
    const [memoryEnabled, setMemoryEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<AgentResponse | null>(null);
    const [questionHistory, setQuestionHistory] = useState<string[]>([]);

    // Extracted related decisions if a valid decision ID is in sources
    const [relatedDecisions, setRelatedDecisions] = useState<{ outbound: DecisionRelationship[], inbound: any[] }>({ outbound: [], inbound: [] });
    // Unique parsed decision ID from sources, if any
    const [primaryDecisionId, setPrimaryDecisionId] = useState<string | null>(null);

    // Initialize history from session storage
    useEffect(() => {
        const h = sessionStorage.getItem('archa_history');
        if (h) {
            try {
                setQuestionHistory(JSON.parse(h));
            } catch { }
        }
    }, []);

    const saveHistory = (q: string) => {
        const updated = [q, ...questionHistory.filter(x => x !== q)].slice(0, 10);
        setQuestionHistory(updated);
        sessionStorage.setItem('archa_history', JSON.stringify(updated));
    };

    const handleAsk = async (q: string) => {
        if (!q.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResponse(null);
        setPrimaryDecisionId(null);
        setRelatedDecisions({ outbound: [], inbound: [] });

        saveHistory(q);

        try {
            const data = await askArcha(q, memoryEnabled);
            setResponse(data);

            // Attempt to derive decisionId from sources
            if (data.sources && data.sources.length > 0) {
                // Find first source that has metadata.decisionId
                const sourceWithId = data.sources.find(s => s.metadata?.decisionId);
                if (sourceWithId) {
                    const dId = sourceWithId.metadata.decisionId;
                    setPrimaryDecisionId(dId);

                    // Fetch real related decisions to render
                    try {
                        const rels = await getDecisionRelationships(dId);
                        setRelatedDecisions(rels);
                    } catch {
                        // ignore error
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'ARCHA could not complete the investigation.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setQuestion('');
        setResponse(null);
        setError(null);
        setPrimaryDecisionId(null);
        setRelatedDecisions({ outbound: [], inbound: [] });
    };

    const suggested = [
        "Why did NovaCart choose PostgreSQL?",
        "What influenced the move to Kubernetes?",
        "What trade-offs did Redis introduce?",
        "Why was CloudFront added?"
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>ASK ARCHA</h1>

            {/* Input Section */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '1rem', marginTop: 0 }}>Ask about NovaCart's architecture...</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(question); }}
                        placeholder="Why did NovaCart choose PostgreSQL?"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #d1d5db', fontSize: '1rem' }}
                        disabled={loading}
                    />
                    <button
                        onClick={() => handleAsk(question)}
                        disabled={loading || !question.trim()}
                        style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 600, cursor: (loading || !question.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !question.trim()) ? 0.7 : 1 }}
                    >
                        ASK ARCHA
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                        <input
                            type="checkbox"
                            checked={memoryEnabled}
                            onChange={(e) => setMemoryEnabled(e.target.checked)}
                            disabled={loading}
                        />
                        Memory: {memoryEnabled ? 'ON' : 'OFF'}
                    </label>

                    {(response || error) && (
                        <button onClick={handleClear} disabled={loading} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '0.875rem' }}>
                            Clear / New Question
                        </button>
                    )}
                </div>
            </div>

            {/* Helper Empty States */}
            {!loading && !response && !error && (
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>Suggested Questions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {suggested.map(q => (
                                <button key={q} onClick={() => setQuestion(q)} style={{ textAlign: 'left', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem', borderRadius: '0.25rem', color: '#1d4ed8', cursor: 'pointer', fontSize: '0.875rem' }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                    {questionHistory.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>Recent Questions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {questionHistory.map(q => (
                                    <button key={q} onClick={() => setQuestion(q)} style={{ textAlign: 'left', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', color: '#4b5563', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontSize: '1.25rem', fontWeight: 500 }}>
                    ARCHA is investigating...
                </div>
            )}

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '0.5rem', color: '#dc2626' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
                    <button onClick={() => handleAsk(question)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Retry</button>
                </div>
            )}

            {/* Answer State */}
            {response && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* ARCHA ANSWER */}
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ background: '#1f2937', color: 'white', padding: '1rem', fontWeight: 600 }}>ARCHA ANSWER</div>
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            <div style={{ fontSize: '1rem', color: '#111827', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                {response.answer}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
                                <div><strong>Intent:</strong> {response.intent}</div>
                                <div>
                                    <strong>Historical Memory:</strong>{' '}
                                    {!memoryEnabled ? 'Disabled' : response.memoryUsed ? 'Used' : 'Not Used'}
                                </div>
                                {memoryEnabled && (
                                    <div><strong>Evidence:</strong> {response.memoryCount > 0 ? `${response.memoryCount} memories` : 'No matching memories'}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* No Memory Found Notice */}
                    {memoryEnabled && response.memoryCount === 0 && (
                        <div style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '0.5rem', fontWeight: 500 }}>
                            No historical evidence was found for this question. This answer relies only on generic architectural knowledge.
                        </div>
                    )}

                    {/* HISTORICAL EVIDENCE */}
                    {memoryEnabled && response.memoryUsed && (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <div style={{ background: '#f3f4f6', color: '#374151', padding: '1rem', fontWeight: 600 }}>HISTORICAL EVIDENCE</div>
                            <div style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {response.sources.length === 0 ? (
                                    <div style={{ color: '#6b7280' }}>No direct historical sources were returned.</div>
                                ) : (
                                    response.sources.map((s, idx) => (
                                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cfe2ff', padding: '1rem', borderRadius: '0.25rem' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hindsight Memory</div>
                                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#1e293b' }}>{s.summary}</p>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {s.metadata?.decisionId && (
                                                    <button onClick={() => navigate(`/timeline/${s.metadata.decisionId}`)} style={{ background: 'transparent', border: 'none', color: '#2563eb', padding: 0, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                                        View Decision {s.metadata.decisionId}
                                                    </button>
                                                )}
                                                {s.metadata?.decisionId && (
                                                    <button onClick={() => navigate(`/memory?decision=${s.metadata.decisionId}`)} style={{ background: 'transparent', border: 'none', color: '#2563eb', padding: 0, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                                        Inspect Memory
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ARCHITECTURE CONNECTIONS */}
                    {primaryDecisionId && (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <div style={{ background: '#f3f4f6', color: '#374151', padding: '1rem', fontWeight: 600 }}>ARCHITECTURE CONNECTIONS</div>
                            <div style={{ padding: '1.5rem', background: 'white' }}>
                                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
                                    {primaryDecisionId}
                                </div>

                                {relatedDecisions.outbound.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Related decisions:</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {relatedDecisions.outbound.map(rel => (
                                                <div key={rel.targetDecisionId}>
                                                    <button onClick={() => navigate(`/timeline/${rel.targetDecisionId}`)} style={{ background: 'transparent', border: 'none', color: '#2563eb', padding: 0, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                                        {rel.targetDecisionId}
                                                    </button>
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>— {rel.explanation}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <button
                                        onClick={() => navigate('/architecture')}
                                        style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.25rem', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        View on Architecture Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
