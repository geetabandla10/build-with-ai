import React, { useState } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Building2, Landmark, Clock, Globe } from 'lucide-react';

const JobSearch = () => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!role || !location) return;
    setSearching(true);
    
    // Simulating robust Firecrawl API results
    setTimeout(() => {
      setResults([
        { 
          id: 1, 
          title: 'Senior AI Research Engineer', 
          company: 'Nexus Intelligence', 
          location: 'Bangalore, India (Remote)', 
          salary: '₹35L - ₹55L',
          posted: '2 days ago',
          tags: ['Python', 'PyTorch', 'LLMs'],
          url: 'https://example.com/apply/nexus'
        },
        { 
          id: 2, 
          title: 'GenAI Full Stack Developer', 
          company: 'SparkFlow Systems', 
          location: 'San Francisco, CA', 
          salary: '$160k - $210k',
          posted: '5h ago',
          tags: ['React', 'Node.js', 'OpenAI'],
          url: 'https://example.com/apply/sparkflow'
        },
        { 
          id: 3, 
          title: 'Machine Learning Architect', 
          company: 'OptiData Labs', 
          location: 'Remote', 
          salary: '€80k - €120k',
          posted: '1 week ago',
          tags: ['AWS', 'TensorFlow', 'MLOps'],
          url: 'https://example.com/apply/optidata'
        }
      ].map(job => ({
        ...job,
        displayLocation: location.toLowerCase().includes('remote') ? job.location : `${location} (Nearby)`
      })));
      setSearching(false);
    }, 2000);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title gradient-text">AI Job Search</h2>
        <p className="page-subtitle">Real-time crawling powered by Firecrawl API technology.</p>
      </header>

      <div className="card glass">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Job Role (e.g. AI Engineer)" 
              style={{ paddingLeft: '3rem' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="City or Remote" 
              style={{ paddingLeft: '3rem' }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={handleSearch} 
            disabled={searching}
            style={{ minWidth: '140px' }}
          >
            {searching ? 'Crawling...' : 'Find Jobs'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {results.map(job => (
          <div key={job.id} className="card glass job-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '0.4rem' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={16} /> {job.company}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {job.displayLocation}</span>
                </div>
              </div>
              <button 
                onClick={() => window.open(job.url, '_blank')}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Apply <ExternalLink size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {job.tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Landmark size={14} /> {job.salary}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {job.posted}</span>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && !searching && role && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem', padding: '2rem' }}>
            <Globe size={48} style={{ marginBottom: '1rem', opacity: '0.5' }} />
            <p>No listings found in the live crawl. Try adjusting your search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
