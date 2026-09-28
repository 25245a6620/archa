import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecisions } from '../../services/decisions';
import type { ArchitectureDecision } from '../../types/decision';

export default function ArchitectureMap() {
    const [decisions, setDecisions] = useState<ArchitectureDecision[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDecision, setSelectedDecision] = useState<ArchitectureDecision | null>(null);
    const navigate = useNavigate();

    const loadDecisions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDecisions();
            setDecisions(data);
        } catch {
            setError('Unable to load architecture.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDecisions();
    }, []);

    // Deterministic representation mapping helper
    const getDecisionNode = (id: string) => decisions.find(d => d.id === id);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading architecture...</div>;
    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
            <button onClick={loadDecisions} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Retry</button>
        </div>
    );
    if (decisions.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No architecture decisions available.</div>;

    const NodeMapComponent = ({ id, label, category }: { id: string, label: string, category: string }) => {
        const d = getDecisionNode(id);
        const isSelected = selectedDecision?.id === id;

        if (!d) return null;

        return (
            <div
                onClick={() => setSelectedDecision(d)}
                style={{
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    width: '200px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                    position: 'relative'
                }}
            >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{d.id}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>{category}</div>
            </div>
        );
    };

    // Very simple SVG line generator connecting items if rendered in strict grid/flex visually
    // For a hackathon timeline demonstration, a rigid flex based visual with CSS pseudo elements or explicit SVG is safest.

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

            <div style={{ padding: '1rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>ARCHA — Architecture Map</h1>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#4b5563' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '12px', height: '12px', background: 'white', border: '1px solid #d1d5db' }}></div>
                        Node / Component
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '12px', height: '12px', background: '#eff6ff', border: '1px solid #2563eb' }}></div>
                        Selected
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '16px', height: '2px', background: '#9ca3af' }}></div>
                        Relationship
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Left side: The Map */}
                <div style={{ flex: '1 1 65%', overflow: 'auto', padding: '2rem', background: '#f1f5f9', position: 'relative' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <NodeMapComponent id="AD-005" label="CloudFront" category="Global Content Delivery" />
                            <div style={{ width: '2px', height: '2rem', background: '#9ca3af' }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <NodeMapComponent id="AD-004" label="Kubernetes / EKS" category="Container Orchestration" />
                            <div style={{ width: '2px', height: '2rem', background: '#9ca3af' }}></div>
                        </div>

                        {/* Cluster mapped to Kubernetes (EKS) logically */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', maxWidth: '900px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-001" label="PostgreSQL" category="Transactional Database" />
                                <div style={{ height: '3rem' }}></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-002" label="Redis" category="Application Caching" />
                                <div style={{ height: '3rem' }}></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-003" label="Amazon S3" category="Object Storage" />
                                <div style={{ height: '3rem' }}></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-006" label="Async Processing" category="Message Brokers" />
                                <div style={{ height: '3rem' }}></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-007" label="GitHub Actions" category="CI/CD" />
                                <div style={{ height: '3rem' }}></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '2px', height: '1rem', background: '#9ca3af' }}></div>
                                <NodeMapComponent id="AD-008" label="Observability" category="Centralized Logging" />
                                <div style={{ height: '3rem' }}></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right side: Detail Panel */}
                <div style={{ flex: '0 0 35%', minWidth: '350px', background: '#ffffff', borderLeft: '1px solid #e5e7eb', overflow: 'auto', padding: '2rem' }}>
                    {selectedDecision ? (
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>{selectedDecision.id}</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 1rem 0' }}>{selectedDecision.title}</h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Why</div>
                                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{selectedDecision.rationale[0] || 'No rationale available.'}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Technology</div>
                                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', color: '#1f2937' }}>
                                    {selectedDecision.technologies[0]}
                                </span>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Decision</div>
                                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{selectedDecision.decision}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={() => navigate(`/timeline/${selectedDecision.id}`)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem', color: '#111827', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    View Decision
                                </button>
                                <button
                                    onClick={() => navigate(`/memory?decision=${selectedDecision.id}`)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#2563eb', border: 'none', borderRadius: '0.5rem', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Inspect Memory
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👋</div>
                                <div>Select an architecture component<br />to view details.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
