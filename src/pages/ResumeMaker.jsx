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
  linkedin: "linkedin.com/in/diyaagarwal",
  portfolio: "diya-agarwal.com",
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
  const [isEditionsPanelOpen, setIsEditionsPanelOpen] = useState(false);
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
    setIsEditionsPanelOpen(false);
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume edition?")) return;
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      loadSavedResumes();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete resume.");
    }
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

  const handleDownload = async () => {
    try {
      let html2canvas, jsPDF;
      try {
        const h2c = 'html2canvas';
        const jsp = 'jspdf';
        html2canvas = (await import(/* @vite-ignore */ h2c)).default;
        const jspdfModule = await import(/* @vite-ignore */ jsp);
        jsPDF = jspdfModule.jsPDF;
      } catch (e) {
        html2canvas = window.html2canvas;
        jsPDF = window.jspdf.jsPDF;
      }
      if (!html2canvas || !jsPDF) throw new Error('PDF libraries not found.');

      const element = previewRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.name}_Resume.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate PDF.');
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


  return (
    <div className="rm-layout">
      {/* Left Pane - Editor */}
      <div className="rm-left-pane">
        <div className="rm-header">
          <h1>Resume Details</h1>
          <p>Enter your raw details, and let our AI craft the perfect phrasing.</p>
        </div>

        {/* 1 Personal Information */}
        <div className="rm-section-box">
          <div className="rm-section-title">
            <div className="rm-number">1</div>
            Personal Information
          </div>
          <div className="rm-grid-2">
            <div className="rm-input-group">
              <label>Full Name</label>
              <input className="rm-input" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Full Name" />
            </div>
            <div className="rm-input-group">
              <label>Email</label>
              <input className="rm-input" value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="Email" />
            </div>
            <div className="rm-input-group">
              <label>Phone</label>
              <input className="rm-input" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} placeholder="Phone" />
            </div>
            <div className="rm-input-group">
              <label>Location</label>
              <input className="rm-input" value={data.location} onChange={e => setData({...data, location: e.target.value})} placeholder="City, State" />
            </div>
            <div className="rm-input-group">
              <label>LinkedIn URL</label>
              <input className="rm-input" value={data.linkedin || ''} onChange={e => setData({...data, linkedin: e.target.value})} placeholder="linkedin.com/..." />
            </div>
            <div className="rm-input-group">
              <label>Portfolio/Website</label>
              <input className="rm-input" value={data.portfolio || ''} onChange={e => setData({...data, portfolio: e.target.value})} placeholder="your-website.com" />
            </div>
            <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Professional Summary</label>
              <textarea className="rm-input" rows="4" value={data.summary} onChange={e => setData({...data, summary: e.target.value})} placeholder="Executive summary..."></textarea>
            </div>
          </div>
        </div>

        {/* 2 Experience */}
        <div className="rm-section-box">
          <div className="rm-section-title" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="rm-number">2</div>
              Experience
            </div>
            <button 
              className="rm-btn-outline" 
              onClick={() => setData({...data, experience: [...data.experience, { role: '', company: '', period: '', desc: '' }]})}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              + Add Role
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222', position: 'relative' }}>
                <button onClick={() => { const newExp = data.experience.filter((_, i) => i !== idx); setData({...data, experience: newExp}); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                <div className="rm-grid-2">
                  <div className="rm-input-group">
                    <label>Company</label>
                    <input className="rm-input" value={exp.company} onChange={e => { const newExp = [...data.experience]; newExp[idx].company = e.target.value; setData({...data, experience: newExp}); }} placeholder="Google" />
                  </div>
                  <div className="rm-input-group">
                    <label>Role/Title</label>
                    <input className="rm-input" value={exp.role} onChange={e => { const newExp = [...data.experience]; newExp[idx].role = e.target.value; setData({...data, experience: newExp}); }} placeholder="Senior SWE" />
                  </div>
                  <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Period (e.g., Jan 2020 - Present)</label>
                    <input className="rm-input" value={exp.period} onChange={e => { const newExp = [...data.experience]; newExp[idx].period = e.target.value; setData({...data, experience: newExp}); }} placeholder="Jan 2020 - Present" />
                  </div>
                  <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description</label>
                    <textarea className="rm-input" rows="3" value={exp.desc} onChange={e => { const newExp = [...data.experience]; newExp[idx].desc = e.target.value; setData({...data, experience: newExp}); }} placeholder="Achieved..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Education */}
        <div className="rm-section-box">
          <div className="rm-section-title" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="rm-number">3</div>
              Education
            </div>
            <button 
              className="rm-btn-outline" 
              onClick={() => setData({...data, education: [...data.education, { school: '', degree: '', period: '', desc: '' }]})}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              + Add Education
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {data.education.map((edu, idx) => (
                <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222', position: 'relative' }}>
                  <button onClick={() => { const newEdu = data.education.filter((_, i) => i !== idx); setData({...data, education: newEdu}); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  <div className="rm-grid-2">
                    <div className="rm-input-group">
                      <label>School</label>
                      <input className="rm-input" value={edu.school} onChange={e => { const newEdu = [...data.education]; newEdu[idx].school = e.target.value; setData({...data, education: newEdu}); }} placeholder="University" />
                    </div>
                    <div className="rm-input-group">
                      <label>Degree</label>
                      <input className="rm-input" value={edu.degree} onChange={e => { const newEdu = [...data.education]; newEdu[idx].degree = e.target.value; setData({...data, education: newEdu}); }} placeholder="B.S. Computer Science" />
                    </div>
                    <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Period</label>
                      <input className="rm-input" value={edu.period} onChange={e => { const newEdu = [...data.education]; newEdu[idx].period = e.target.value; setData({...data, education: newEdu}); }} placeholder="2016-2020" />
                    </div>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* 4 Skills & Certs */}
        <div className="rm-section-box">
          <div className="rm-section-title">
            <div className="rm-number">4</div>
            Skills & Certifications
          </div>
          <div className="rm-grid-2">
            <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Skills (comma separated)</label>
              <textarea className="rm-input" rows="3" value={data.skills.join(', ')} onChange={e => setData({...data, skills: e.target.value.split(',').map(s => s.trim())})} placeholder="React, Node.js..." />
            </div>
            <div className="rm-input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Certifications (comma separated)</label>
              <textarea className="rm-input" rows="2" value={data.certifications?.join(', ') || ''} onChange={e => setData({...data, certifications: e.target.value.split(',').map(s => s.trim())})} placeholder="AWS Certified..." />
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Preview */}
      <div className="rm-right-pane">
        <div className="rm-right-header">
          <h2>Preview & Customize</h2>
          <div className="rm-actions">
            <button className="rm-btn-outline" onClick={() => setShowAiModal(true)} style={{ color: '#c084fc', borderColor: '#c084fc' }}>
              <Sparkles size={16}/> Auto-Craft AI
            </button>
            <button className="rm-btn-outline" onClick={() => setIsEditionsPanelOpen(true)}>
              <FolderOpen size={16} /> Previous Editions
            </button>
            <button className="rm-btn-solid" onClick={handleSaveResume} disabled={saving} style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save
            </button>
            <button className="rm-btn-solid" onClick={handleDownload} style={{ color: '#000', background: '#fff' }}>
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Style Selector */}
        <div className="rm-style-selector">
          <div className="rm-style-label">
            <span>SELECT ART STYLE</span>
            <span>{templates.length} Styles Available</span>
          </div>
          <div className="rm-styles-row">
            {templates.map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTemplate(t.id)} 
                className={`rm-style-btn ${activeTemplate === t.id ? 'active' : ''}`}
                style={{ borderLeft: activeTemplate === t.id ? `4px solid ${t.color}` : '1px solid #222' }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="rm-preview-container">
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', width: '210mm', height: 'fit-content' }}>
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* AI Modals */}
      {showAiModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card glass" style={{ width: '450px', padding: '2rem', background: '#111', border: '1px solid #333', color: '#fff' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles className="gradient-text" /> AI Resume Magician
            </h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Let AI instantly write your professional summary, skills, and optimize your experience bullets.</p>
            
            <input 
              placeholder="Target Job Role (e.g. Senior Frontend Engineer)" 
              value={aiPrompt.role} 
              onChange={e => setAiPrompt({...aiPrompt, role: e.target.value})}
              className="rm-input"
              style={{ marginBottom: '1rem' }}
            />
            <textarea 
              placeholder="Key skills or past achievements to include... (e.g. React, Supabase, Led a team of 5)" 
              value={aiPrompt.keywords} 
              onChange={e => setAiPrompt({...aiPrompt, keywords: e.target.value})}
              className="rm-input"
              rows="4"
              style={{ marginBottom: '1.5rem' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="rm-btn-outline" onClick={() => setShowAiModal(false)}>Cancel</button>
              <button className="rm-btn-solid" onClick={handleGenerateAI} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="spin" size={16}/> : <Sparkles size={16}/>} Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Editions Slide-in Panel */}
      <div className={`rm-editions-panel ${isEditionsPanelOpen ? 'open' : ''}`}>
        <div className="rm-editions-header">
          <h3><FolderOpen size={20} /> Previous Editions</h3>
          <button onClick={() => setIsEditionsPanelOpen(false)} className="rm-close-btn">&times;</button>
        </div>
        
        <div className="rm-editions-content">
          {fetchingResumes ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}><Loader2 className="spin" size={24}/></div>
          ) : savedResumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              <p>No previous editions found.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Save your resume drafts to view them here.</p>
            </div>
          ) : (
            savedResumes.map(r => (
              <div key={r.id} className="rm-edition-card">
                <div className="rm-edition-info">
                  <h4>{r.resume_data.role || 'Draft'}</h4>
                  <p>{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="rm-edition-actions">
                  <button className="rm-btn-outline rm-btn-load" onClick={() => handleLoadResume(r)}>Load</button>
                  <button className="rm-btn-delete" onClick={() => handleDeleteResume(r.id)} title="Delete Edition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeMaker;
