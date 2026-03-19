import React, { useState, useRef, useEffect } from 'react';
import { Download, Layout, User, Briefcase, GraduationCap, Code, Globe, Mail, Phone, MapPin, Sparkles, Save, FolderOpen, Loader2, Trash2, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const templates = [
  // Premium / Visual Layouts (Matching User Screenshot)
  { id: 'header-block', name: 'Executive Block', color: '#1e293b', layout: 'header-block', font: "'Inter', sans-serif", badge: 'New', photoType: 'Monogram', layoutStyle: 'Graphics', columns: 1 },
  { id: 'monogram-center', name: 'Modern Monogram', color: '#3b82f6', layout: 'monogram-center', font: "'Merriweather', serif", badge: 'Recommended', photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'sidebar-left', name: 'Sidebar Left', color: '#4f46e5', layout: 'sidebar-left', font: "'Inter', sans-serif", photoType: 'Headshot', layoutStyle: 'Graphics', columns: 2 },
  { id: 'sidebar-right', name: 'Sidebar Right', color: '#0891b2', layout: 'sidebar-right', font: "'Inter', sans-serif", photoType: 'Headshot', layoutStyle: 'Graphics', columns: 2 },
  
  // High Fidelity Diversions
  { id: 'creative-grid', name: 'Creative Page', color: '#ec4899', layout: 'header-block', font: "'Poppins', sans-serif", photoType: 'Monogram', layoutStyle: 'Graphics', columns: 1 },
  { id: 'elegant-serif', name: 'Elegant Serif', color: '#b45309', font: "'Georgia', serif", align: 'center', upperCase: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'compact-gold', name: 'Academic Gold', color: '#92400e', font: "'Merriweather', serif", align: 'left', compact: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'legal-bold', name: 'Legal Standard', color: '#111827', font: "'Times New Roman', serif", align: 'center', upperCase: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'ats-standard', name: 'ATS Standard', color: '#333333', font: "'Inter', sans-serif", align: 'left', clean: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'executive-pro', name: 'Executive Pro', color: '#1a365d', font: "'Garamond', serif", align: 'center', upperCase: true, heavyBorder: true, photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'tech-guru', name: 'Tech Guru', color: '#0ea5e9', font: "'Roboto Mono', monospace", align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'startup-glow', name: 'Startup Glow', color: '#8b5cf6', font: "'Nunito', sans-serif", align: 'center', noBorder: true, photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'marketing-pro', name: 'Marketing Pro', color: '#f97316', font: "'Montserrat', sans-serif", align: 'right', photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'finance-dark', name: 'Finance Dark', color: '#064e3b', font: "'Arial', sans-serif", align: 'center', heavyBorder: true, photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'healthcare-pro', name: 'Healthcare Pro', color: '#0891b2', font: "'Open Sans', sans-serif", align: 'left', clean: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'design-studio', name: 'Design Studio', color: '#14b8a6', font: "'Playfair Display', serif", align: 'center', photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'entry-pro', name: 'Entry Pro', color: '#6366f1', font: "'Verdana', sans-serif", align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'sleek-silver', name: 'Sleek Silver', color: '#9ca3af', font: "'Inter', sans-serif", align: 'center', noBorder: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'academic-pro', name: 'Academic Elite', color: '#1e3a8a', font: "'Merriweather', serif", align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'engineering-pro', name: 'Eng. Master', color: '#dc2626', font: "'Tahoma', sans-serif", align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  
  // Extending to 43+ items
  { id: 'minimal-1', name: 'Minimal One', color: '#111', font: 'sans-serif', align: 'left', clean: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'minimal-2', name: 'Minimal Two', color: '#444', font: 'serif', align: 'center', clean: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'pro-1', name: 'Professional One', color: '#2563eb', font: 'sans-serif', align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'pro-2', name: 'Professional Two', color: '#1d4ed8', font: 'sans-serif', align: 'left', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'creative-1', name: 'Creative One', color: '#db2777', font: "'Poppins', sans-serif", photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'creative-2', name: 'Creative Two', color: '#be185d', font: "'Poppins', sans-serif", photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'sidebar-1', name: 'Sidebar Blue', color: '#2563eb', layout: 'sidebar-left', photoType: 'Headshot', layoutStyle: 'Graphics', columns: 2 },
  { id: 'sidebar-2', name: 'Sidebar Dark', color: '#1e293b', layout: 'sidebar-right', photoType: 'Headshot', layoutStyle: 'Graphics', columns: 2 },
  { id: 'monogram-1', name: 'Monogram Slate', color: '#475569', layout: 'monogram-center', photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'monogram-2', name: 'Monogram Emerald', color: '#059669', layout: 'monogram-center', photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'bold-1', name: 'Bold Header', color: '#ef4444', layout: 'header-block', photoType: 'Monogram', layoutStyle: 'Graphics', columns: 1 },
  { id: 'bold-2', name: 'Deep Sea Header', color: '#0369a1', layout: 'header-block', photoType: 'Monogram', layoutStyle: 'Graphics', columns: 1 },
  { id: 'compact-1', name: 'Ultra Compact', color: '#333', compact: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'compact-2', name: 'Dense Info', color: '#444', compact: true, photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'serif-1', name: 'Classic Serif', color: '#000', font: 'serif', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'serif-2', name: 'Modern Serif', color: '#222', font: 'serif', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'startup-1', name: 'Startup Bold', color: '#7c3aed', photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'startup-2', name: 'Startup Clean', color: '#6d28d9', photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 },
  { id: 'finance-1', name: 'Executive Finance', color: '#065f46', photoType: 'Monogram', layoutStyle: 'Simple', columns: 1 },
  { id: 'tech-1', name: 'Developer Pro', color: '#0369a1', font: 'monospace', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'tech-2', name: 'Admin Pro', color: '#0e7490', font: 'monospace', photoType: 'No Photo', layoutStyle: 'Simple', columns: 1 },
  { id: 'last-one', name: 'Ultimate Resume', color: '#111', badge: 'Elite', photoType: 'No Photo', layoutStyle: 'Graphics', columns: 1 }
];

// Placeholder person image for high-fidelity templates
const PERSON_IMAGE = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop";

const defaultData = {
  name: "Diya Agarwal",
  role: "Retail Sales Associate",
  email: "d.agarwal@example.in",
  phone: "+91 11 5555 3345",
  location: "New Delhi, India 110034",
  photo: PERSON_IMAGE,
  summary: "Customer-focused Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations.",
  skills: ["Cash register operation", "Inventory management", "POS system operation", "Accurate money handling", "Sales expertise", "Documentation and recordkeeping"],
  experience: [
    {
      company: "ZARA - New Delhi, India",
      role: "Retail Sales Associate",
      period: "02/2017 - Current",
      desc: "Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability. Prevented store losses by leveraging awareness, attention to detail, and integrity to identify and investigate concerns."
    },
    {
      company: "Dunkin' Donuts - New Delhi, India",
      role: "Barista",
      period: "03/2015 - 01/2017",
      desc: "Upheld seasonal drinks and pastries, boosting average store sales by ₹1500 weekly. Managed morning rush of over 300 customers daily with efficient, level-headed customer service."
    }
  ],
  education: [
    {
      school: "University of Delhi",
      degree: "Bachelor of Commerce",
      period: "2011 - 2014",
      desc: "Graduated with honors. Focused on business management and retail marketing."
    }
  ],
  certifications: ["Retail Sales Specialist (RSS)", "Advanced Customer Engagement"]
};

const ResumeMaker = () => {
  const { user } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState('header-block');
  const previewRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [showGallery, setShowGallery] = useState(true);
  const [filters, setFilters] = useState({ photo: 'All', layout: 'All', columns: 'All', color: 'All' });

  // Get Initials for Monogram
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // New states for AI & Supabase features
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ role: '', keywords: '' });
  
  const [saving, setSaving] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(false);

  useEffect(() => {
    if (user) {
      loadSavedResumes();
    }
  }, [user]);

  const loadSavedResumes = async () => {
    if (!user) return;
    setFetchingResumes(true);
    try {
      const { data: records, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSavedResumes(records || []);
    } catch (err) {
      console.error("Error loading resumes:", err);
    } finally {
      setFetchingResumes(false);
    }
  };

  const handleSaveResume = async () => {
    if (!user) {
      alert("Please login (or use Guest Login) to save resumes to the cloud.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .insert([{
          user_email: user.email,
          resume_data: { ...data, template: activeTemplate }
        }]);

      if (error) {
        if (error.message.includes('relation "resumes" does not exist')) {
          throw new Error("The 'resumes' table hasn't been created yet. Please execute the SQL setup file in Supabase.");
        }
        throw error;
      }
      
      alert("Resume saved successfully!");
      loadSavedResumes();
    } catch (error) {
      console.error("Save Error:", error);
      alert(error.message || "Failed to save resume securely.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadResume = (record) => {
    setData(record.resume_data);
    if (record.resume_data.template) {
      setActiveTemplate(record.resume_data.template);
    }
    setShowSavedModal(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.role) return alert("Please enter a target role.");
    setAiLoading(true);
    try {
      const systemPrompt = `You are an expert resume writer. Generate a highly professional resume JSON for a candidate targeting the role: "${aiPrompt.role}". 
Keywords focusing on: ${aiPrompt.keywords}. 

Respond ONLY with valid JSON exactly matching this structure:
{
  "name": "Alex Johnson (Change to placeholder)",
  "role": "The target role",
  "summary": "3-4 sentences of highly impactful professional summary",
  "skills": ["Skill 1", "Skill 2" ... up to 10 max],
  "experience": [
    { "company": "Example Corp", "role": "Matching past role", "period": "2020 - Present", "desc": "1-2 impactful sentences detailing achievements." },
    { "company": "Tech Solutions", "role": "Previous role", "period": "2018 - 2020", "desc": "1-2 impactful sentences." }
  ],
  "education": "BS in Computer Science, University Name (Change to placeholder)"
}`;

      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'openrouter/free',
        messages: [{ role: 'user', content: systemPrompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Career AI Suite',
          'Content-Type': 'application/json'
        }
      });
      
      let aiResponseText = response.data.choices[0].message.content;
      // Strip markdown code blocks if any
      aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(aiResponseText);
      
      // Preserve original name/contact info but update professional content
      setData({
        ...data,
        role: parsedData.role || data.role,
        summary: parsedData.summary || data.summary,
        skills: parsedData.skills || data.skills,
        experience: parsedData.experience || data.experience,
      });
      setShowAiModal(false);
      
    } catch (error) {
      console.error("AI Generation failed:", error);
      if (error.response?.status === 401 || !import.meta.env.VITE_OPENROUTER_API_KEY) {
         console.warn("OpenRouter API invalid. Using local smart fallback generator.");
         
         // Smart Local Fallback Generator
         const userRole = aiPrompt.role || data.role;
         const splitKeywords = aiPrompt.keywords ? aiPrompt.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
         
         const fallbackData = {
           role: userRole,
           summary: `Results-driven and highly motivated ${userRole} with a proven track record of delivering high-quality solutions. Adaptable team player with strong expertise in modern methodologies. Passionate about leveraging ${splitKeywords[0] || 'innovative technologies'} to drive business growth and user engagement.`,
           skills: splitKeywords.length > 0 ? [...new Set([...splitKeywords, 'Leadership', 'Problem Solving', 'Project Management'])].slice(0, 8) : ['Leadership', 'Problem Solving', 'Project Management', 'Communication', 'Agile Methodology'],
           experience: [
             { company: 'Tech Solutions Inc', role: `Senior ${userRole}`, period: '2021 - Present', desc: `Spearheaded major initiatives utilizing ${splitKeywords[0] || 'core technologies'}, resulting in a 30% increase in overall efficiency. Mentored junior team members and fostered a collaborative environment.` },
             { company: 'Global Innovations', role: userRole, period: '2018 - 2021', desc: 'Developed and maintained mission-critical applications. Collaborated closely with cross-functional teams to define, design, and ship new highly requested features.' }
           ]
         };

         setData({
            ...data,
            role: fallbackData.role,
            summary: fallbackData.summary,
            skills: fallbackData.skills,
            experience: fallbackData.experience,
         });
         setShowAiModal(false);
      } else {
         alert("Failed to generate resume content. Please try again or check your API key.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const h2c = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = previewRef.current;
      const canvas = await h2c(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Try using the "Print" button instead for better results.');
    }
  };

  const renderTemplate = () => {
    const tConfig = templates.find(t => t.id === activeTemplate) || templates[0];
    const themeColor = tConfig.color;
    
    const baseStyle = {
      backgroundColor: '#fff',
      color: '#333',
      minHeight: '297mm',
      padding: tConfig.compact ? '15mm' : '25mm',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontFamily: tConfig.font || "'Inter', sans-serif",
      position: 'relative'
    };

    const headerBorder = tConfig.noBorder ? 'none' : tConfig.heavyBorder ? `4px solid ${themeColor}` : `1px solid ${themeColor}`;
    const headTransform = tConfig.upperCase ? 'uppercase' : 'none';
    const align = tConfig.align || 'left';

    // Premium Layout: Header Block (Dark Top)
    if (tConfig.layout === 'header-block') {
      return (
        <div ref={previewRef} style={baseStyle}>
          <header style={{ backgroundColor: themeColor, color: '#fff', margin: '-25mm -25mm 2rem -25mm', padding: '25mm', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ padding: '20px', border: '2px solid rgba(255,255,255,0.3)', fontSize: '2.5rem', fontWeight: 'bold' }}>{getInitials(data.name)}</div>
            <div>
              <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{data.name}</h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '5px' }}>{data.role}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <span>{data.email}</span> <span>{data.phone}</span> <span>{data.location}</span>
              </div>
            </div>
          </header>
          <div style={{ padding: '0 5mm' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: themeColor, textTransform: 'uppercase', fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>Summary</h3>
              <p style={{ lineHeight: '1.6' }}>{data.summary}</p>
            </section>
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: themeColor, textTransform: 'uppercase', fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>Experience</h3>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{exp.role} | {exp.company}</span>
                    <span style={{ fontWeight: 'normal', color: '#666' }}>{exp.period}</span>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>{exp.desc}</p>
                </div>
              ))}
            </section>
            <section>
              <h3 style={{ color: themeColor, textTransform: 'uppercase', fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '1rem' }}>Skills</h3>
              <p style={{ color: '#444', lineHeight: '1.8' }}>{data.skills.join(' • ')}</p>
            </section>
          </div>
        </div>
      );
    }

    // Premium Layout: Monogram Center
    if (tConfig.layout === 'monogram-center') {
      return (
        <div ref={previewRef} style={baseStyle}>
          <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
             <div style={{ 
               width: '80px', height: '80px', borderRadius: '50%', border: `1px solid ${themeColor}`, 
               display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 1.5rem', fontSize: '1.5rem', color: themeColor 
             }}>{getInitials(data.name)}</div>
             <h1 style={{ fontSize: '2.8rem', color: '#111', fontWeight: '400', letterSpacing: '1px' }}>{data.name}</h1>
             <p style={{ color: '#888', fontStyle: 'italic', marginTop: '5px' }}>{data.role}</p>
             <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '20px', color: '#666', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
               <span>{data.email}</span> • <span>{data.phone}</span> • <span>{data.location}</span>
             </div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
             <section>
               <h3 style={{ textAlign: 'center', color: '#888', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>Professional Profile</h3>
               <p style={{ lineHeight: '1.8', textAlign: 'center', maxWidth: '80%', margin: '0 auto' }}>{data.summary}</p>
             </section>
             <section>
               <h3 style={{ textAlign: 'center', color: '#888', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>Experience</h3>
               {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '2rem' }}>
                  <div style={{ fontWeight: '500', fontSize: '1.1rem', textAlign: 'center' }}>{exp.company}</div>
                  <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: themeColor, textAlign: 'center' }}>{exp.role} ({exp.period})</div>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: '#555', lineHeight: '1.6', textAlign: 'center' }}>{exp.desc}</p>
                </div>
              ))}
             </section>
          </div>
        </div>
      );
    }

    // Premium Layout: Sidebar Left
    if (tConfig.layout === 'sidebar-left') {
      return (
        <div ref={previewRef} style={{ ...baseStyle, display: 'grid', gridTemplateColumns: '220mm 1fr', padding: 0 }}>
          {/* Main Column */}
          <div style={{ padding: '25mm' }}>
             <h1 style={{ fontSize: '3rem', color: '#111', margin: 0 }}>{data.name}</h1>
             <p style={{ fontSize: '1.3rem', color: themeColor, marginBottom: '2rem' }}>{data.role}</p>
             
             <section style={{ marginBottom: '2.5rem' }}>
               <h3 style={{ color: '#333', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Summary</h3>
               <p style={{ lineHeight: '1.6', color: '#555' }}>{data.summary}</p>
             </section>
             
             <section>
               <h3 style={{ color: '#333', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Experience</h3>
               {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{exp.role}</span>
                    <span style={{ color: themeColor }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '0.5rem' }}>{exp.company}</div>
                  <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>{exp.desc}</p>
                </div>
              ))}
             </section>
          </div>
          {/* Sidebar */}
          <div style={{ background: '#f8fafc', borderLeft: '1px solid #e2e8f0', padding: '25mm 15mm' }}>
             <div style={{ marginBottom: '2rem' }}>
                {data.photo ? (
                  <img src={data.photo} alt="Profile" style={{ width: '45mm', height: '45mm', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${themeColor}` }} />
                ) : (
                  <div style={{ width: '45mm', height: '45mm', borderRadius: '50%', backgroundColor: themeColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{getInitials(data.name)}</div>
                )}
             </div>
             <section style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Contact</h4>
                <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>{data.email}</span>
                  <span>{data.phone}</span>
                  <span>{data.location}</span>
                </div>
             </section>

             <section>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Skills</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.skills.map(s => <span key={s} style={{ fontSize: '0.85rem', color: '#334155' }}>• {s}</span>)}
                </div>
             </section>
          </div>
        </div>
      );
    }

    // Premium Layout: Sidebar Right
    if (tConfig.layout === 'sidebar-right') {
      return (
        <div ref={previewRef} style={{ ...baseStyle, display: 'grid', gridTemplateColumns: '1fr 220mm', padding: 0 }}>
          {/* Sidebar */}
          <div style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '25mm 15mm' }}>
             <div style={{ marginBottom: '2rem' }}>
                {data.photo ? (
                  <img src={data.photo} alt="Profile" style={{ width: '45mm', height: '45mm', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${themeColor}` }} />
                ) : (
                  <div style={{ width: '45mm', height: '45mm', borderRadius: '50%', backgroundColor: themeColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{getInitials(data.name)}</div>
                )}
             </div>
             <section style={{ marginBottom: '2.5rem' }}>

                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Contact</h4>
                <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>{data.email}</span>
                  <span>{data.phone}</span>
                  <span>{data.location}</span>
                </div>
             </section>
             <section>
                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Skills</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.skills.map(s => <span key={s} style={{ fontSize: '0.85rem', color: '#334155' }}>• {s}</span>)}
                </div>
             </section>
          </div>
          {/* Main Column */}
          <div style={{ padding: '25mm' }}>
             <h1 style={{ fontSize: '3rem', color: '#111', margin: 0 }}>{data.name}</h1>
             <p style={{ fontSize: '1.3rem', color: themeColor, marginBottom: '2rem' }}>{data.role}</p>
             
             <section style={{ marginBottom: '2.5rem' }}>
               <h3 style={{ color: '#333', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Summary</h3>
               <p style={{ lineHeight: '1.6', color: '#555' }}>{data.summary}</p>
             </section>
             
             <section>
               <h3 style={{ color: '#333', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', marginBottom: '1rem' }}>Experience</h3>
               {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{exp.role}</span>
                    <span style={{ color: themeColor }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '0.5rem' }}>{exp.company}</div>
                  <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>{exp.desc}</p>
                </div>
              ))}
             </section>
          </div>
        </div>
      );
    }

    return (
      <div ref={previewRef} style={baseStyle}>
        <header style={{ borderBottom: headerBorder, paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: align }}>
          <h1 style={{ fontSize: '2.5rem', color: themeColor, textTransform: headTransform, letterSpacing: tConfig.upperCase ? '2px' : 'normal' }}>{data.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '0.5rem', textTransform: headTransform }}>{data.role}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '20px', fontSize: '0.9rem', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
            <span>{data.email}</span> <span>{data.phone}</span> <span>{data.location}</span>
          </div>
        </header>
        
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: themeColor, marginBottom: '0.75rem', borderBottom: tConfig.clean ? 'none' : `1px solid #eee`, paddingBottom: '4px', textTransform: headTransform }}>Professional Summary</h3>
          <p style={{ lineHeight: '1.6', textAlign: 'justify' }}>{data.summary}</p>
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: themeColor, marginBottom: '0.75rem', borderBottom: tConfig.clean ? 'none' : `1px solid #eee`, paddingBottom: '4px', textTransform: headTransform }}>Experience</h3>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>{exp.role} | {exp.company}</span>
                <span style={{ fontWeight: 'normal', color: '#666' }}>{exp.period}</span>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.6', textAlign: 'justify' }}>{exp.desc}</p>
            </div>
          ))}
        </section>
        
        <section style={{ marginBottom: '2rem' }}>
           <h3 style={{ color: themeColor, marginBottom: '0.75rem', borderBottom: tConfig.clean ? 'none' : `1px solid #eee`, paddingBottom: '4px', textTransform: headTransform }}>Skills</h3>
           <p style={{ lineHeight: '1.6' }}>{data.skills.join(tConfig.clean ? '  •  ' : ' | ')}</p>
        </section>
      </div>
    );
  };


  if (showGallery) {
    return (
      <div className="page-container" style={{ maxWidth: '1400px', background: '#f1f5f9', minHeight: '100vh', padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: '#111', fontWeight: 'bold' }}>Choose a template</h2>
            <p style={{ color: '#666' }}>Standard, modern, and creative templates to help you land the job.</p>
          </div>
          <button className="btn-secondary" onClick={() => setShowGallery(false)}>Back to Editor</button>
        </header>

        {/* Professional Filter Bar - Matching User Image UI */}
        <div style={{ 
          background: '#fff', padding: '1.25rem 2rem', borderRadius: '12px', 
          display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0', marginBottom: '3rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Filter by</span>
             <select 
                className="input-field" 
                style={{ width: '130px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                value={filters.photo}
                onChange={(e) => setFilters({...filters, photo: e.target.value})}
             >
                <option>All</option>
                <option>Headshot</option>
                <option>No Photo</option>
             </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <select 
                className="input-field" 
                style={{ width: '130px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                value={filters.layout}
                onChange={(e) => setFilters({...filters, layout: e.target.value})}
             >
                <option>All</option>
                <option>Graphics</option>
                <option>Simple</option>
             </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <select 
                className="input-field" 
                style={{ width: '130px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                value={filters.columns}
                onChange={(e) => setFilters({...filters, columns: e.target.value})}
             >
                <option>All</option>
                <option>1 Column</option>
                <option>2 Columns</option>
             </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
             <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Colors</span>
             <div style={{ display: 'flex', gap: '10px' }}>
                {['All', '#333', '#4f46e5', '#0891b2', '#f97316', '#dc2626'].map(c => (
                   <div 
                      key={c} 
                      onClick={() => setFilters({...filters, color: c})}
                      style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', 
                        background: c === 'All' ? 'linear-gradient(45deg, #eee, #bbb)' : c, 
                        cursor: 'pointer', border: filters.color === c ? '2px solid #3b82f6' : '2px solid #fff', 
                        boxShadow: '0 0 0 1px #cbd5e1' 
                      }} 
                   />
                ))}
             </div>
          </div>
        </div>

        
        <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: '#334155' }}>All templates (43)</h3>
        
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem', paddingBottom: '4rem' 
        }}>
          {templates
            .filter(t => {
              if (filters.photo !== 'All' && t.photoType !== filters.photo) return false;
              if (filters.layout !== 'All' && t.layoutStyle !== filters.layout) return false;
              if (filters.columns !== 'All') {
                const colMatch = filters.columns === '1 Column' ? 1 : 2;
                if (t.columns !== colMatch) return false;
              }
              if (filters.color !== 'All' && t.color !== filters.color) return false;
              return true;
            })
            .map(t => (
            <div key={t.id} style={{ 
              position: 'relative', background: '#fff', borderRadius: '16px', 
              overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: activeTemplate === t.id ? `2px solid #3b82f6` : '1px solid #e2e8f0',
              display: 'flex', flexDirection: 'column'
            }} className="template-card-hover">
               
               {t.badge && (
                 <span style={{ 
                   position: 'absolute', top: '20px', right: '20px', zIndex: 10,
                   background: '#dbeafe', color: '#1e40af', padding: '6px 14px', 
                   borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold',
                   boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                 }}>{t.badge}</span>
               )}

               <div style={{ padding: '20px', height: '480px', background: '#f8fafc', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                 <div style={{ transform: 'scale(0.35)', transformOrigin: 'top center', pointerEvents: 'none' }}>
                   {(() => {
                      const tConfig = t;
                      const mData = {
                        name: 'DIYA AGARWAL',
                        role: 'Retail Sales Associate',
                        email: 'd.agarwal@example.in',
                        phone: '+91 11 5555 3345',
                        location: 'New Delhi, India 110034',
                        summary: 'Customer-focused Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations.',
                        skills: ['Cash register operation', 'Inventory management', 'POS system operation', 'Accurate money handling', 'Sales expertise', 'Documentation and recordkeeping'],
                        experience: [
                          { company: 'ZARA - New Delhi, India', role: 'Retail Sales Associate', period: '02/2017 - Current', desc: 'Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability. Prevented store losses by leveraging awareness, attention to detail, and integrity to identify and investigate concerns.' },
                          { company: 'Dunkin\' Donuts - New Delhi, India', role: 'Barista', period: '03/2015 - 01/2017', desc: 'Upheld seasonal drinks and pastries, boosting average store sales by ₹1500 weekly. Managed morning rush of over 300 customers daily with efficient, level-headed customer service.' }
                        ]
                      };
                      
                      const baseStyle = { backgroundColor: '#fff', color: '#111', minHeight: '297mm', width: '210mm', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontFamily: "'Inter', sans-serif" };
                      
                      const TextLines = ({ lines = 3, width = '100%', color = '#f1f5f9' }) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width }}>
                          {[...Array(lines)].map((_, i) => (
                            <div key={i} style={{ height: '14px', background: color, width: i === lines - 1 ? '70%' : '100%', borderRadius: '4px' }} />
                          ))}
                        </div>
                      );

                      if (tConfig.layout === 'header-block') {
                        return (
                          <div style={baseStyle}>
                            <div style={{ backgroundColor: '#2d3748', color: '#fff', margin: '-20mm -20mm 30mm -20mm', padding: '20mm 25mm', display: 'flex', alignItems: 'center', gap: '30px' }}>
                              <div style={{ width: '100px', height: '100px', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)' }}>DA</div>
                              <div>
                                <h1 style={{ fontSize: '4rem', margin: 0, letterSpacing: '2px' }}>{mData.name}</h1>
                                <p style={{ fontSize: '1.2rem', margin: '5px 0 0 0', opacity: 0.8 }}>{mData.location} | {mData.phone}</p>
                              </div>
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                               <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Summary</h3>
                               <p style={{ lineHeight: '1.6', fontSize: '1rem', color: '#444' }}>{mData.summary}</p>
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                               <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Skills</h3>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                  {mData.skills.map(s => <div key={s} style={{ fontSize: '1rem', color: '#444' }}>• {s}</div>)}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Experience</h3>
                            {mData.experience.map((exp, i) => (
                              <div key={i} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>{exp.role}</span><span>{exp.period}</span></div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{exp.company}</div>
                                <p style={{ fontSize: '1rem', marginTop: '8px' }}>{exp.desc}</p>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      if (tConfig.layout === 'monogram-center') {
                        return (
                          <div style={baseStyle}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                              <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '1px solid #111', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#111' }}>DA</div>
                              <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0', letterSpacing: '1px' }}>{mData.name}</h1>
                              <p style={{ color: '#666', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>{mData.email} | {mData.phone} | {mData.location}</p>
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                               <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'center', marginBottom: '20px' }}>Summary</h3>
                               <p style={{ lineHeight: '1.6', fontSize: '1rem' }}>{mData.summary}</p>
                            </div>
                            <div style={{ marginTop: '30px' }}>
                               <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'center', marginBottom: '20px' }}>Skills</h3>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                  <TextLines lines={3} />
                                  <TextLines lines={3} />
                               </div>
                            </div>
                          </div>
                        );
                      }

                      if (tConfig.layout === 'sidebar-left') {
                        return (
                          <div style={{ ...baseStyle, display: 'grid', gridTemplateColumns: '70mm 1fr', padding: 0 }}>
                             <div style={{ borderRight: '1px solid #eee', padding: '15mm 10mm', backgroundColor: '#fff' }}>
                                <div style={{ width: '50mm', height: '50mm', background: `url(${PERSON_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '30px' }} />
                                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#1a365d', borderBottom: '1px solid #1a365d', paddingBottom: '5px', marginBottom: '15px' }}>Summary</h3>
                                <TextLines lines={4} />
                                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#1a365d', borderBottom: '1px solid #1a365d', paddingBottom: '5px', marginTop: '30px', marginBottom: '15px' }}>Skills</h3>
                                <TextLines lines={6} color="#f8fafc" />
                             </div>
                             <div style={{ padding: '15mm' }}>
                                <h1 style={{ fontSize: '4rem', color: '#1a365d', margin: '0 0 20px 0' }}>{mData.name}</h1>
                                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>{mData.location} | {mData.phone}</p>
                                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#1a365d', borderTop: '2px solid #1a365d', paddingTop: '10px', marginBottom: '20px' }}>Experience</h3>
                                <TextLines lines={10} />
                             </div>
                          </div>
                        );
                      }

                      return (
                        <div style={baseStyle}>
                           <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0' }}>{mData.name}</h1>
                           <div style={{ height: '3px', background: '#111', width: '100%', marginBottom: '20px' }} />
                           <TextLines lines={2} color="#f8fafc" />
                           <div style={{ marginTop: '40px' }}>
                             <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>Summary</h3>
                             <p style={{ lineHeight: '1.6' }}>{mData.summary}</p>
                           </div>
                           <div style={{ marginTop: '40px' }}>
                             <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>Experience</h3>
                             <TextLines lines={12} />
                           </div>
                        </div>
                      );
                   })()}
                 </div>
               </div>

               <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', color: '#111', margin: 0, fontWeight: 'bold' }}>{t.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Premium Layout</p>
                 </div>
                 <button 
                   className="btn-primary" 
                   onClick={() => { setActiveTemplate(t.id); setShowGallery(false); }}
                   style={{ 
                     width: '80%', padding: '0.9rem', borderRadius: '50px', 
                     fontWeight: 'bold', background: '#3b82f6', border: 'none', 
                     color: '#fff', cursor: 'pointer', fontSize: '1rem',
                     boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                   }}
                 >
                   Choose template
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1800px', width: '95%' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title gradient-text">AI Resume Maker</h2>
          <p className="page-subtitle">Designing with: <strong>{templates.find(t=>t.id===activeTemplate)?.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => setShowGallery(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <Layout size={18} /> Templates
          </button>
          <button className="btn-secondary" onClick={() => setShowSavedModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <FolderOpen size={18} /> Load Cloud Resumes
          </button>
          <button className="btn-secondary" onClick={handleSaveResume} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '8px' }}>
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Save to Cloud
          </button>
          <button className="btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#059669' }}>
            <BookOpen size={18} /> Print A4
          </button>
          <button className="btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Download size={18} /> Download PDF
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '10px' }}>
          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Layout size={20}/> Select Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
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
              <input value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="Email" />
              <textarea value={data.summary} onChange={e => setData({...data, summary: e.target.value})} placeholder="Brief Summary" rows="4" />
            </div>
          </div>

          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Briefcase size={20}/> Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {data.experience.map((exp, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', position: 'relative' }}>
                  <button 
                    onClick={() => {
                      const newExp = data.experience.filter((_, i) => i !== idx);
                      setData({...data, experience: newExp});
                    }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input value={exp.role} onChange={e => {
                      const newExp = [...data.experience];
                      newExp[idx].role = e.target.value;
                      setData({...data, experience: newExp});
                    }} placeholder="Role" />
                    <input value={exp.company} onChange={e => {
                      const newExp = [...data.experience];
                      newExp[idx].company = e.target.value;
                      setData({...data, experience: newExp});
                    }} placeholder="Company" />
                    <input value={exp.period} onChange={e => {
                      const newExp = [...data.experience];
                      newExp[idx].period = e.target.value;
                      setData({...data, experience: newExp});
                    }} placeholder="Period (e.g. 2020 - Present)" />
                    <textarea value={exp.desc} onChange={e => {
                      const newExp = [...data.experience];
                      newExp[idx].desc = e.target.value;
                      setData({...data, experience: newExp});
                    }} placeholder="Description" rows="3" />
                  </div>
                </div>
              ))}
              <button 
                className="btn-secondary" 
                onClick={() => setData({...data, experience: [...data.experience, { role: '', company: '', period: '', desc: '' }]})}
                style={{ width: '100%', padding: '10px', border: '1px dashed var(--glass-border)' }}
              >
                + Add Experience
              </button>
            </div>
          </div>

          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><GraduationCap size={20}/> Education</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {data.education.map((edu, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', position: 'relative' }}>
                  <button 
                    onClick={() => {
                      const newEdu = data.education.filter((_, i) => i !== idx);
                      setData({...data, education: newEdu});
                    }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input value={edu.school} onChange={e => {
                      const newEdu = [...data.education];
                      newEdu[idx].school = e.target.value;
                      setData({...data, education: newEdu});
                    }} placeholder="School" />
                    <input value={edu.degree} onChange={e => {
                      const newEdu = [...data.education];
                      newEdu[idx].degree = e.target.value;
                      setData({...data, education: newEdu});
                    }} placeholder="Degree" />
                    <input value={edu.period} onChange={e => {
                      const newEdu = [...data.education];
                      newEdu[idx].period = e.target.value;
                      setData({...data, education: newEdu});
                    }} placeholder="Period" />
                    <textarea value={edu.desc} onChange={e => {
                      const newEdu = [...data.education];
                      newEdu[idx].desc = e.target.value;
                      setData({...data, education: newEdu});
                    }} placeholder="Description" rows="2" />
                  </div>
                </div>
              ))}
              <button 
                className="btn-secondary" 
                onClick={() => setData({...data, education: [...data.education, { school: '', degree: '', period: '', desc: '' }]})}
                style={{ width: '100%', padding: '10px', border: '1px dashed var(--glass-border)' }}
              >
                + Add Education
              </button>
            </div>
          </div>

          <div className="card glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles size={20}/> Skills & Certs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#aaa' }}>Skills (comma separated)</label>
                <textarea 
                  value={data.skills.join(', ')} 
                  onChange={e => setData({...data, skills: e.target.value.split(',').map(s => s.trim())})} 
                  placeholder="React, Node.js, Python..." 
                  rows="3" 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#aaa' }}>Certifications (comma separated)</label>
                <textarea 
                  value={data.certifications?.join(', ') || ''} 
                  onChange={e => setData({...data, certifications: e.target.value.split(',').map(s => s.trim())})} 
                  placeholder="AWS Certified, Google Cloud..." 
                  rows="3" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', overflowY: 'auto', maxHeight: '1100px' }}>
           <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center', width: '210mm' }}>
             {renderTemplate()}
           </div>
        </div>
      </div>

      {/* AI Modals */}
      {showAiModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card glass" style={{ width: '450px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles className="gradient-text"/> AI Resume Magician
            </h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Let AI instantly write your professional summary, skills, and optimize your experience bullets.</p>
            
            <input 
              placeholder="Target Job Role (e.g. Senior Frontend Engineer)" 
              value={aiPrompt.role} 
              onChange={e => setAiPrompt({...aiPrompt, role: e.target.value})}
              style={{ marginBottom: '1rem', width: '100%' }}
            />
            <textarea 
              placeholder="Key skills or past achievements to include... (e.g. React, Supabase, Led a team of 5)" 
              value={aiPrompt.keywords} 
              onChange={e => setAiPrompt({...aiPrompt, keywords: e.target.value})}
              rows="4"
              style={{ width: '100%', marginBottom: '1.5rem' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowAiModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleGenerateAI} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {aiLoading ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>} Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Cloud Resumes Modal */}
      {showSavedModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card glass" style={{ width: '600px', padding: '2rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderOpen size={24} /> Cloud Saved Resumes
            </h3>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fetchingResumes ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}><Loader2 className="spin" size={24}/></div>
              ) : savedResumes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No saved resumes found in your cloud. Generate one and click Save!</div>
              ) : (
                savedResumes.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{r.resume_data.role || 'Professional Resume'}</h4>
                      <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>Last updated: {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleLoadResume(r)}>Load Draft</button>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowSavedModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeMaker;
