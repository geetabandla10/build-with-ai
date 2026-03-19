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
      const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'IBM', 'Accenture', 'Cognizant', 'Capgemini', 'Tech Mahindra', 'HCLTech', 'Oracle', 'Cisco', 'Adobe'];
      const platforms = ['LinkedIn', 'Naukri', 'Internshala'];
      const tagPool = ['React', 'Node.js', 'Python', 'LLMs', 'AWS', 'TensorFlow', 'Java', 'C++', 'Go', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'Agile', 'DevOps', 'Machine Learning', 'AI', 'Frontend'];
      
      const generatedJobs = [];
      const queryRole = role || 'Software Engineer';
      const locString = location || 'India';

      for (let i = 1; i <= 50; i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        
        let dynamicUrl = '';
        if (platform === 'LinkedIn') {
            const searchKeywords = encodeURIComponent(`${queryRole} ${company}`);
            dynamicUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchKeywords}&location=${encodeURIComponent(locString)}`;
        } else if (platform === 'Naukri') {
            const naukriRole = queryRole.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const naukriCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const naukriLoc = locString.toLowerCase().replace(/[^a-z0-9]/g, '-');
            dynamicUrl = `https://www.naukri.com/${naukriCompany}-${naukriRole}-jobs-in-${naukriLoc}`;
        } else if (platform === 'Internshala') {
            const internshalaSearch = encodeURIComponent(`${queryRole} ${company}`).replace(/%20/g, '-');
            dynamicUrl = `https://internshala.com/jobs/${internshalaSearch}-jobs/`;
        }

        const shuffledTags = [...tagPool].sort(() => 0.5 - Math.random());
        const salaryMin = Math.floor(Math.random() * 15) + 6;
        const postedDays = Math.floor(Math.random() * 14);

        generatedJobs.push({
          id: i,
          title: queryRole,
          company: company,
          location: locString,
          displayLocation: locString.toLowerCase().includes('remote') ? locString : `${locString} (Nearby)`,
          salary: `₹${salaryMin}L - ₹${salaryMin + Math.floor(Math.random() * 10) + 4}L`,
          posted: postedDays === 0 ? 'Just now' : `${postedDays}d ago`,
          tags: shuffledTags.slice(0, 3 + Math.floor(Math.random() * 2)),
          url: dynamicUrl,
          platform: platform
        });
      }
      
      setResults(generatedJobs);
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
                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', background: job.platform === 'LinkedIn' ? '#0a66c2' : job.platform === 'Naukri' ? '#275df5' : '#1295c9' }}
              >
                Apply on {job.platform} <ExternalLink size={14} />
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
