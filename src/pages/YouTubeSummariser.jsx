import React, { useState, useRef } from 'react';
import { Youtube, Search, Sparkles, Clock, CheckCircle, List, User, Link, FileText, Upload, Image, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const YouTubeSummariser = () => {
  const [url, setUrl] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'transcript', 'screenshot'
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    "Analyzing input source...",
    "Extracting textual content...",
    "Analyzing semantic structure...",
    "Generating AI summary..."
  ];

  const handleSummarize = async () => {
    const input = activeTab === 'url' ? url : activeTab === 'transcript' ? manualTranscript : screenshot;
    if (!input) return;
    
    setLoading(true);
    setSummary(null);
    setStep(0);

    try {
      setStep(0); 
      await new Promise(r => setTimeout(r, 800));
      setStep(1); 
      await new Promise(r => setTimeout(r, 800));
      setStep(2); 
      await new Promise(r => setTimeout(r, 800));

      let prompt = '';
      if (activeTab === 'url') {
        setStep(1); // "Extracting textual content..."
        try {
          const { data } = await axios.get(`/api/transcript?url=${encodeURIComponent(url)}`);
          prompt = `Please summarize the following transcript from a video: ${data.transcript}. \n\nInclude an Overview, Key Highlights (as a bulleted list), and a Verdict.`;
        } catch (err) {
          throw new Error(err.response?.data?.error || 'Failed to extract transcript. Please try the "Paste Transcript" tab for this video.');
        }
      } else if (activeTab === 'transcript') {
        prompt = `Please summarize the following transcript: ${manualTranscript}. Include an Overview, Key Highlights (as a bulleted list), and a Verdict.`;
      } else if (activeTab === 'screenshot') {
        if (!screenshot) throw new Error("Please upload a screenshot first.");
        prompt = `Please summarize the content from this uploaded screenshot. Assume the screenshot contains text related to a video or document. Include an Overview, Key Highlights (as a bulleted list), and a Verdict.`;
      }

      // Format message depending on whether it's an image or text
      const messages = [{ role: 'user', content: prompt }];
      if (activeTab === 'screenshot') {
        messages[0].content = [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: screenshot } }
        ];
      }

      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: activeTab === 'screenshot' ? 'google/gemini-2.5-flash:free' : 'openrouter/free',
        messages: messages
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Career AI Suite',
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      const overviewMatch = aiResponse.match(/Overview:\s*([\s\S]*?)(?=(Key Highlights:|Verdict:|$))/i);
      const highlightsMatch = aiResponse.match(/Key Highlights:([\s\S]*?)(?=(Verdict:|$))/i);
      const verdictMatch = aiResponse.match(/Verdict:\s*([\s\S]*)/i);

      const parsedOverview = overviewMatch ? overviewMatch[1].trim() : aiResponse.split('\n\n')[0] || 'Summary generated.';
      const parsedHighlights = highlightsMatch 
        ? highlightsMatch[1].split('\n').map(line => line.trim()).filter(line => line.startsWith('*') || line.startsWith('-')).map(line => line.replace(/^[*-\s]+/, '').trim())
        : aiResponse.split('\n').filter(l => l.includes('*') || l.includes('-')).slice(0, 5).map(line => line.replace(/^[*-\s]+/, '').trim());
      const parsedVerdict = verdictMatch ? verdictMatch[1].trim() : aiResponse.split('Verdict:')[1] || 'Highly recommended for professional insights.';

      setSummary({
        overview: parsedOverview,
        highlights: parsedHighlights,
        verdict: parsedVerdict
      });

      setStep(3); 
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.error('AI Processing Error:', error);
      alert(error.message || 'Failed to analyze. Please check your API key, network connection, or input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title gradient-text">AI Summariser</h2>
        <p className="page-subtitle">Get instant insights from URLs, text transcripts, or screenshots.</p>
      </header>
      
      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { id: 'url', label: 'Video URL', icon: <Youtube size={16} /> },
          { id: 'transcript', label: 'Paste Transcript', icon: <FileText size={16} /> },
          { id: 'screenshot', label: 'Upload Screenshot', icon: <Image size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="card glass">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeTab === 'url' && (
            <div style={{ position: 'relative' }}>
              <Youtube size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
              <input 
                type="text" 
                placeholder="Paste YouTube Video URL..." 
                style={{ paddingLeft: '3rem' }} 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
            </div>
          )}

          {activeTab === 'transcript' && (
            <textarea 
              placeholder="Paste your transcript or copy-pasted video text here..." 
              rows="6" 
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              style={{ padding: '1.25rem' }}
            />
          )}

          {activeTab === 'screenshot' && (
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: '2px dashed var(--glass-border)', 
                borderRadius: '16px', 
                padding: screenshotPreview ? '1rem' : '3rem', 
                textAlign: 'center', 
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
              
              {screenshotPreview ? (
                <>
                  <img src={screenshotPreview} alt="Screenshot preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <p style={{ color: 'white', fontWeight: 'bold' }}>Click to change image</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ marginBottom: '0.5rem' }}>Click to upload screenshot</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Best for mobile users who cannot copy transcripts</p>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-primary" 
              onClick={handleSummarize} 
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Start Summarising'}
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${((step + 1) / steps.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>{steps[step]}</p>
          </div>
        )}
      </div>

      {summary && (
        <div className="card glass" style={{ marginTop: '2rem', borderLeft: '4px solid var(--primary)', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <CheckCircle2 color="var(--primary)" size={24} /> AI Analysis
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#e2e8f0' }}>{summary.overview}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.9rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Highlights</h4>
            <ul style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
              {summary.highlights.map((h, i) => (
                <li key={i} style={{ lineHeight: '1.5', display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <strong style={{ color: '#818cf8', marginRight: '8px' }}>Verdict:</strong> {summary.verdict}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSummariser;
