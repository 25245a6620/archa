import { useNavigate } from 'react-router-dom';
import type { ArchitectureDecision } from '../../types/decision';
import { ArrowRight } from 'lucide-react';

interface Props {
    decision: ArchitectureDecision;
}

export default function TimelineItem({ decision }: Props) {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', marginBottom: '2rem', paddingLeft: '2rem' }}>
            {/* Timeline Dot */}
            <div style={{ position: 'absolute', left: '-0.375rem', top: '1.25rem', width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#3b82f6', outline: '4px solid #ffffff' }}></div>

            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>{decision.id}</div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>{decision.title}</h3>
                    </div>
                    <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {decision.status}
                    </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>WHY</div>
                    <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>{decision.rationale[0] || 'No rationale provided.'}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>TECHNOLOGY</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {decision.technologies.map(tech => (
                            <span key={tech} style={{ padding: '0.125rem 0.5rem', background: '#f3f4f6', color: '#374151', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {decision.relatedDecisions.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>RELATED</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {decision.relatedDecisions.map(rel => (
                                <span key={rel.targetDecisionId} style={{ fontSize: '0.875rem', color: '#4b5563' }}>{rel.targetDecisionId}</span>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate(`/timeline/${decision.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                >
                    View Decision <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
