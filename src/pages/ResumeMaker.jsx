import React, { useState, useRef } from 'react';
import { Download, Layout, User, Briefcase, GraduationCap, Code, Globe, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const templates = [
  { id: 'professional', name: 'Professional', color: '#1e293b' },
  { id: 'modern', name: 'Modern Blue', color: '#3b82f6' },
  { id: 'minimalist', name: 'Minimalist', color: '#64748b' },
  { id: 'creative', name: 'Creative Pink', color: '#ec4899' },
  { id: 'elegant', name: 'Elegant Gold', color: '#b45309' },
  { id: 'compact', name: 'Compact', color: '#475569' },
  { id: 'bold', name: 'Bold Dark', color: '#0f172a' },
  { id: 'classic', name: 'Classic', color: '#000000' },
];

const ResumeMaker = () => {
  const [activeTemplate, setActiveTemplate] = useState('professional');
  const previewRef = useRef(null);
  
  const [data, setData] = useState({
    name: 'Tharun Bandla',
    role: 'AI Software Engineer',
    email: 'tharun@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    summary: 'Innovative AI Software Engineer with 5+ years of experience in building scalable agentic systems and interactive React applications. Passionate about bridging the gap between LLMs and user-centric design.',
    skills: ['React', 'Node.js', 'Python', 'LLMs', 'Prompt Engineering', 'TypeScript'],
    experience: [
      { company: 'Nexus AI', role: 'Senior Developer', period: '2022 - Present', desc: 'Leading the development of agentic coding assistants and multi-modal summarization tools.' },
      { company: 'SparkFlow', role: 'Full Stack Dev', period: '2019 - 2022', desc: 'Built real-time data visualization dashboards and integrated OpenAI APIs for customer support bots.' }
    ],
    education: 'B.Tech in Computer Science, IIT Bangalore'
  });

  const handleDownload = async () => {
    try {
      let html2canvas, jsPDF;
      
      try {
        // Try dynamic imports first
        const h2c = 'html2canvas';
        const jsp = 'jspdf';
        html2canvas = (await import(/* @vite-ignore */ h2c)).default;
        const jspdfModule = await import(/* @vite-ignore */ jsp);
        jsPDF = jspdfModule.jsPDF;
      } catch (e) {
        console.warn('Vite failed to resolve modules, falling back to CDN globals...');
        html2canvas = window.html2canvas;
        jsPDF = window.jspdf.jsPDF;
      }

      if (!html2canvas || !jsPDF) {
        throw new Error('PDF libraries not found. Please refresh or check your internet connection.');
      }

      const element = previewRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.name}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again or restart the dev server.');
    }
  };

  const renderTemplate = () => {
    const themeColor = templates.find(t => t.id === activeTemplate)?.color || '#000';
    const baseStyle = {
      backgroundColor: '#fff',
      color: '#333',
      minHeight: '297mm',
      padding: activeTemplate === 'compact' ? '20mm' : '25mm',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    };

    switch (activeTemplate) {
      case 'modern':
        return (
          <div ref={previewRef} style={{ ...baseStyle, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div style={{ backgroundColor: themeColor, color: '#fff', margin: '-25mm 0 -25mm -25mm', padding: '25mm' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{data.name}</h2>
              <p style={{ opacity: 0.9, marginBottom: '2rem' }}>{data.role}</p>
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {data.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {data.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> {data.location}</span>
              </div>
            </div>
            <div>
              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: themeColor, borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Summary</h3>
                <p style={{ lineHeight: '1.6' }}>{data.summary}</p>
              </section>
              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: themeColor, borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Experience</h3>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                      <span>{exp.role} @ {exp.company}</span>
                      <span>{exp.period}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>{exp.desc}</p>
                  </div>
                ))}
              </section>
            </div>
          </div>
        );
      case 'bold':
        return (
          <div ref={previewRef} style={{ ...baseStyle, background: '#111', color: '#eee' }}>
            <div style={{ borderLeft: `8px solid ${themeColor}`, paddingLeft: '2rem' }}>
              <h1 style={{ fontSize: '3rem', color: '#fff' }}>{data.name}</h1>
              <h3 style={{ color: themeColor }}>{data.role}</h3>
            </div>
            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
              <div>
                <h4 style={{ color: themeColor, textTransform: 'uppercase' }}>Work History</h4>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginTop: '1.5rem' }}>
                    <strong>{exp.company}</strong> <br/>
                    <small style={{ color: '#aaa' }}>{exp.period}</small>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{exp.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: themeColor }}>Contact</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>{data.email}<br/>{data.phone}</p>
                <h4 style={{ color: themeColor, marginTop: '2rem' }}>Skills</h4>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '1rem' }}>
                  {data.skills.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div ref={previewRef} style={baseStyle}>
            <header style={{ borderBottom: `4px solid ${themeColor}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', color: themeColor }}>{data.name}</h1>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>{data.role}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                <span>{data.email}</span> <span>{data.phone}</span> <span>{data.location}</span>
              </div>
            </header>
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: themeColor, marginBottom: '0.75rem' }}>Professional Summary</h3>
              <p style={{ lineHeight: '1.6' }}>{data.summary}</p>
            </section>
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: themeColor, marginBottom: '0.75rem' }}>Experience</h3>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{exp.role} | {exp.company}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{exp.period}</div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>{exp.desc}</p>
                </div>
              ))}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="page-title gradient-text">AI Resume Maker</h2>
          <p className="page-subtitle">Design your professional career story.</p>
        </div>
        <button className="btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <Download size={20} /> Download PDF
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Layout size={20}/> Select Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {templates.map(t => (
                <button key={t.id} onClick={() => setActiveTemplate(t.id)} className="tab-btn" style={{
                  padding: '10px', borderRadius: '8px',
                  border: activeTemplate === t.id ? `2px solid ${t.color}` : '2px solid transparent',
                  background: activeTemplate === t.id ? `${t.color}15` : 'rgba(255,255,255,0.05)',
                  color: '#fff', textAlign: 'left', fontSize: '0.85rem'
                }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20}/> Basic Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Full Name" />
              <input value={data.role} onChange={e => setData({...data, role: e.target.value})} placeholder="Professional Title" />
              <textarea value={data.summary} onChange={e => setData({...data, summary: e.target.value})} placeholder="Brief Summary" rows="4" />
            </div>
          </div>
        </div>
        <div style={{ overflow: 'hidden', borderRadius: '8px', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default ResumeMaker;
