import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ArchitectureDecision } from '../../types/decision';
import { getDecision, getDecisionRelationships } from '../../services/decisions';
import { ArrowLeft } from 'lucide-react';

export default function DecisionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [decision, setDecision] = useState<ArchitectureDecision | null>(null);
    const [relationships, setRelationships] = useState<{ outbound: any[], inbound: any[] }>({ outbound: [], inbound: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const loadDecision = async () => {
            try {
                setLoading(true);
                setError(null);
                const d = await getDecision(id);
                setDecision(d);
                try {
                    const r = await getDecisionRelationships(id);
                    setRelationships(r);
                } catch {
                    // Fail gracefully if relationships can't load
                }
            } catch (err) {
                setError('Unable to load decision details.');
            } finally {
                setLoading(false);
            }
        };
        loadDecision();
    }, [id]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading decision {id}...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error} <button onClick={() => navigate('/timeline')}>Back</button></div>;
    if (!decision) return <div style={{ padding: '2rem', textAlign: 'center' }}>Decision not found. <button onClick={() => navigate('/timeline')}>Back</button></div>;

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{title}</h3>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <button
                onClick={() => navigate('/timeline')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 0, marginBottom: '2rem' }}
            >
                <ArrowLeft size={16} /> Back to Timeline
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>{decision.id}</div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827', margin: '0 0 1rem 0' }}>{decision.title}</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>{decision.status}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{decision.date || 'Not documented'}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {decision.technologies.map(tech => (
                    <span key={tech} style={{ padding: '0.25rem 0.75rem', background: '#f3f4f6', color: '#374151', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                        {tech}
                    </span>
                ))}
            </div>

            <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151' }}>

                <SectionHeader title="Context & Problem" />
                <p><strong>Context:</strong> {decision.context}</p>
                <p><strong>Problem:</strong> {decision.problem}</p>

                <SectionHeader title="Alternatives Considered" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* The selected alternative representation */}
                    <div style={{ border: '2px solid #2563eb', borderRadius: '0.5rem', padding: '1rem', background: '#eff6ff' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1d4ed8' }}>{decision.decision}</div>
                        <div style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, marginBottom: '0.5rem' }}>Selected</div>
                        <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>{decision.rationale.map((r, i) => <p key={i} style={{ margin: '0.25rem 0' }}>{r}</p>)}</div>
                    </div>

                    {/* The rejected alternatives */}
                    {decision.alternatives.map(alt => (
                        <div key={alt.name} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#f9fafb' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.125rem', color: '#374151' }}>{alt.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>Not selected</div>
                            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                <strong>Advantages:</strong> {alt.advantages.join(', ') || 'None listed'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                <strong>Disadvantages:</strong> {alt.disadvantages.join(', ') || 'None listed'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                <strong>Rejection reason:</strong> {alt.rejectionReason}
                            </div>
                        </div>
                    ))}
                </div>

                <SectionHeader title="Trade-offs" />
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {decision.tradeoffs.map((t, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>{t.category}</div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Benefit</span>
                                <div style={{ fontSize: '0.875rem' }}>{t.benefit}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>Cost</span>
                                <div style={{ fontSize: '0.875rem' }}>{t.cost}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <SectionHeader title="Implementation & Outcome" />
                <p><strong>Implementation:</strong> {decision.implementation}</p>
                <p><strong>Outcome:</strong> {decision.outcome}</p>
                {decision.problems && decision.problems.length > 0 && (
                    <p><strong>Problems:</strong> {decision.problems.join(', ')}</p>
                )}
                {decision.resolution && (
                    <p><strong>Resolution:</strong> {decision.resolution}</p>
                )}

                <SectionHeader title="Lesson & Future Guidance" />
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Lesson</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>{decision.lesson}</p>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>Future Guidance</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>{decision.futureGuidance}</p>
                </div>

                <SectionHeader title="Related Decisions" />
                {relationships.outbound.length === 0 && relationships.inbound.length === 0 ? (
                    <p>No related decisions documented.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {relationships.outbound.map(rel => (
                            <div key={rel.targetDecisionId} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                                <div style={{ minWidth: '80px', flexShrink: 0 }}>
                                    <button onClick={() => navigate(`/timeline/${rel.targetDecisionId}`)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, padding: 0, cursor: 'pointer' }}>{rel.targetDecisionId}</button>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Influenced</span>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{rel.explanation}</p>
                                </div>
                            </div>
                        ))}
                        {relationships.inbound.map(rel => (
                            <div key={rel.sourceDecisionId} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                                <div style={{ minWidth: '80px', flexShrink: 0 }}>
                                    <button onClick={() => navigate(`/timeline/${rel.sourceDecisionId}`)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, padding: 0, cursor: 'pointer' }}>{rel.sourceDecisionId}</button>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Influenced by</span>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{rel.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ marginTop: '4rem' }}></div>
        </div>
    );
}
