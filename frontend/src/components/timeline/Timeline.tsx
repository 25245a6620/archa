import { useEffect, useState } from 'react';
import type { ArchitectureDecision } from '../../types/decision';
import { getDecisions } from '../../services/decisions';
import TimelineItem from './TimelineItem';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Database', 'Caching', 'Storage', 'Infrastructure', 'Delivery', 'Processing', 'CI/CD', 'Observability'];

export default function Timeline() {
    const [decisions, setDecisions] = useState<ArchitectureDecision[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const loadDecisions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDecisions();
            // Ensure they are chronologically ordered by date ideally, assuming they arrive in ID order
            setDecisions(data);
        } catch (err) {
            setError('Unable to load NovaCart architecture decisions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDecisions();
    }, []);

    const filteredDecisions = decisions.filter(d => {
        // Search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const searchString = `${d.id} ${d.title} ${d.context} ${d.problem} ${d.decision} ${d.rationale.join(' ')} ${d.technologies.join(' ')} ${d.lesson} ${d.futureGuidance}`.toLowerCase();
            if (!searchString.includes(term)) return false;
        }

        // Category matching by deterministic fallback maps (based on Phase 4 data)
        if (filterCategory !== 'All') {
            const techs = d.technologies.map(t => t.toLowerCase());
            const cat = filterCategory.toLowerCase();
            if (cat === 'database' && !techs.includes('postgresql')) return false;
            if (cat === 'caching' && !techs.includes('redis')) return false;
            if (cat === 'storage' && !techs.includes('amazon s3')) return false;
            if (cat === 'infrastructure' && !techs.includes('kubernetes')) return false;
            if (cat === 'delivery' && !techs.includes('cdn')) return false;
            if (cat === 'processing' && !techs.includes('background workers')) return false;
            if (cat === 'ci/cd' && !techs.includes('ci/cd')) return false;
            if (cat === 'observability' && !techs.includes('metrics')) return false;
        }

        return true;
    });

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading architecture decisions...</div>;

    if (error) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
            <button onClick={loadDecisions} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>Retry</button>
        </div>
    );

    if (decisions.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No architecture decisions have been recorded yet.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>NovaCart Architecture Evolution</h1>
                <p style={{ color: '#6b7280' }}>A chronological history of core architectural decisions.</p>
            </div>

            {/* EVOLUTION SUMMARY */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Evolution Summary</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 1:</b> Transactional foundation → PostgreSQL</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 2:</b> Performance & objects → Redis + S3</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 3:</b> Global delivery → CloudFront</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 4:</b> Orchestration → EKS</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 5:</b> Async workloads → Async Processing</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 6:</b> Automation → GitHub Actions</div>
                    <div style={{ fontSize: '0.875rem' }}><b>Stage 7:</b> Visibility → Centralized Observability</div>
                </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#9ca3af' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search architecture decisions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                    />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                border: filterCategory === cat ? '1px solid #2563eb' : '1px solid #e5e7eb',
                                background: filterCategory === cat ? '#eff6ff' : '#ffffff',
                                color: filterCategory === cat ? '#1d4ed8' : '#4b5563',
                                cursor: 'pointer'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* TIMELINE LIST */}
            <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', marginLeft: '1rem' }}>
                {filteredDecisions.length === 0 ? (
                    <div style={{ padding: '2rem', color: '#6b7280' }}>No decisions match your search criteria.</div>
                ) : (
                    filteredDecisions.map((decision) => (
                        <TimelineItem key={decision.id} decision={decision} />
                    ))
                )}
            </div>
        </div>
    );
}
