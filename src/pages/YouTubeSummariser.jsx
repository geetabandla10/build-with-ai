import React, { useState, useRef } from 'react';
import { Youtube, Search, Sparkles, Clock, CheckCircle, List, User, Link, FileText, Upload, Image, Loader2, CheckCircle2, BookmarkPlus } from 'lucide-react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const YouTubeSummariser = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'transcript', 'screenshot'
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isLocal, setIsLocal] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Bengali', code: 'bn' },
    { name: 'Telugu', code: 'te' },
    { name: 'Marathi', code: 'mr' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Urdu', code: 'ur' },
    { name: 'Gujarati', code: 'gu' },
    { name: 'Kannada', code: 'kn' },
    { name: 'Malayalam', code: 'ml' },
    { name: 'Odia', code: 'or' },
    { name: 'Punjabi', code: 'pa' },
    { name: 'Assamese', code: 'as' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Chinese', code: 'zh-CN' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Russian', code: 'ru' },
    { name: 'Portuguese', code: 'pt' }
  ];

  const translateText = async (text, targetLangName) => {
    const langObj = languages.find(l => l.name === targetLangName);
    const targetCode = langObj ? langObj.code : 'en';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch (e) {
      console.error('Translation failed:', e);
      return text;
    }
  };

  const localSummarize = (title, content) => {
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','these','those','it','its','as','so','if','then','than','not','no','up','out','about','into','through','during','before','after','above','below','between','each','more','also','can','just','i','you','he','she','we','they','my','your','his','her','our','their','me','him','us','them','what','which','who']);
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const words = content.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const scored = sentences.map(sentence => {
      const sWords = sentence.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => !stopWords.has(w));
      const score = sWords.reduce((acc, w) => acc + (freq[w] || 0), 0) / (sWords.length || 1);
      return { sentence: sentence.trim(), score };
    });
    const topIndices = scored
      .map((s, i) => ({ ...s, i }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.i)
      .sort((a, b) => a - b);
    const summary = topIndices.map(i => scored[i].sentence).join(' ');
    return summary || sentences[0]?.trim() || content.slice(0, 300);
  };

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

  const handleSaveToNotes = async () => {
    if (!summary || !user?.email || savingNote) return;
    setSavingNote(true);
    try {
      let title = 'Saved Summary';
      if (activeTab === 'url') {
        try {
          title = `Video Summary: ${url.slice(0, 30)}${url.length > 30 ? '...' : ''}`;
        } catch { /* ignore */ }
      }
      else if (activeTab === 'transcript') title = 'Transcript Summary';
      else title = 'Screenshot Summary';

      const content = `**Overview:**\n${summary.overview}\n\n**Key Highlights:**\n${summary.highlights.map(h => '• ' + h).join('\n')}\n\n**Verdict:**\n${summary.verdict}`;

      const { error } = await supabase
        .from('notes')
        .insert([{
          title,
          content,
          user_email: user.email,
          color: '#818cf8'
        }]);

      if (error) {
        console.warn('Failed to save to Supabase, trying local storage...', error);
        // Fallback to local storage
        const STORAGE_KEY = 'notes_saver_local';
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const userNotes = all[user.email] || [];
        userNotes.unshift({
          id: Date.now(),
          title,
          content,
          user_email: user.email,
          color: '#818cf8',
          created_at: new Date().toISOString()
        });
        all[user.email] = userNotes;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
      
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(false);
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
      setStep(0); // "Analyzing input source..."
      await new Promise(r => setTimeout(r, 600));
      
      let prompt = '';
      if (activeTab === 'url') {
        setStep(1); // "Extracting textual content..."
        try {
          const { data } = await axios.get(`/api/transcript?url=${encodeURIComponent(url)}`);
          prompt = `Please summarize the following transcript from a video in ${targetLanguage}: ${data.transcript}. \n\nInclude an Overview in ${targetLanguage}, Key Highlights (as a bulleted list in ${targetLanguage}), and a Verdict in ${targetLanguage}.`;
        } catch (err) {
          const status = err.response?.status;
          if (status === 500) {
            throw new Error('This video has transcripts disabled. Please try the "Paste Transcript" tab instead.');
          }
          throw new Error(err.response?.data?.error || 'Failed to extract transcript. Please check the URL or try another tab.');
        }
      } else if (activeTab === 'transcript') {
        setStep(1);
        await new Promise(r => setTimeout(r, 400));
        prompt = `Please summarize the following transcript in ${targetLanguage}: ${manualTranscript}. Include an Overview in ${targetLanguage}, Key Highlights (as a bulleted list in ${targetLanguage}), and a Verdict in ${targetLanguage}.`;
      } else if (activeTab === 'screenshot') {
        setStep(1);
        await new Promise(r => setTimeout(r, 400));
        if (!screenshot) throw new Error("Please upload a screenshot first.");
        prompt = `Please summarize the content from this uploaded screenshot in ${targetLanguage}. Assume the screenshot contains text related to a video or document. Include an Overview in ${targetLanguage}, Key Highlights (as a bulleted list in ${targetLanguage}), and a Verdict in ${targetLanguage}.`;
      }

      setStep(2); // "Analyzing semantic structure..."
      await new Promise(r => setTimeout(r, 800));

      // Format message depending on whether it's an image or text
      const messages = [{ role: 'user', content: prompt }];
      if (activeTab === 'screenshot') {
        messages[0].content = [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: screenshot } }
        ];
      }

      setStep(3); // "Generating AI summary..."
      let aiResponse = '';
      let isFallback = false;

      try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: activeTab === 'screenshot' ? 'nvidia/nemotron-nano-12b-v2-vl:free' : 'openrouter/free',
          messages: messages
        }, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Career AI Suite',
            'Content-Type': 'application/json'
          }
        });
        aiResponse = response.data.choices[0].message.content;
      } catch (err) {
        if (err.response?.status === 401 || !import.meta.env.VITE_OPENROUTER_API_KEY) {
          console.warn('OpenRouter unauthorized/missing, falling back to local summarizer.');
          
          setStep(3); // Keep generating UI state
          
          if (activeTab === 'screenshot') {
            try {
               setStep(1); // "Extracting textual content..."
               // Use Tesseract.js to perform OCR on the base64 screenshot
               const { data: { text } } = await Tesseract.recognize(screenshot, 'eng', { logger: m => console.log(m) });
               
               setStep(2); // "Analyzing semantic structure..."
               if (!text || text.trim().length < 10) {
                 throw new Error("No readable text found in screenshot.");
               }

               let rawSummary = localSummarize('Screenshot Summary', text);
               let translatedSummary = await translateText(rawSummary, targetLanguage);
               let translatedHighlights = [
                 await translateText('* Key point extracted from the image.', targetLanguage),
                 await translateText('* Important insight from the image text.', targetLanguage),
                 await translateText('* Critical takeaway for the user.', targetLanguage)
               ].join('\n');
               let translatedVerdict = await translateText('Local offline OCR summary provided as AI service is currently unavailable.', targetLanguage);
               let extraNote = targetLanguage !== 'English' ? await translateText('\n\nNote: This is a translated offline fallback summary.', targetLanguage) : '';

               aiResponse = `Overview: ${translatedSummary} \n\nKey Highlights: \n${translatedHighlights} \n\nVerdict: ${translatedVerdict}${extraNote}`;
            } catch (ocrErr) {
               console.error("OCR Failed:", ocrErr);
               let translatedSummary = await translateText('Screenshot analysis failed in offline fallback mode. Could not extract text from the image using local OCR capabilities.', targetLanguage);
               aiResponse = `Overview: ${translatedSummary} \n\nKey Highlights: \n* ${await translateText('Cannot read image data offline without clear text.', targetLanguage)} \n\nVerdict: ${await translateText('Action required: Please provide a valid API key to use advanced computer vision features.', targetLanguage)}`;
            }
          } else {
            let rawSummary = localSummarize('Video Summary', prompt.split(': ')[1] || prompt);
            let translatedSummary = await translateText(rawSummary, targetLanguage);
            let translatedHighlights = [
              await translateText('* Key point extracted from the transcript.', targetLanguage),
              await translateText('* Important insight from the video content.', targetLanguage),
              await translateText('* Critical takeaway for the user.', targetLanguage)
            ].join('\n');
            let translatedVerdict = await translateText('Local smart summary provided as AI service is currently unavailable.', targetLanguage);
            let extraNote = targetLanguage !== 'English' ? await translateText('\n\nNote: This is a translated offline fallback summary.', targetLanguage) : '';

            aiResponse = `Overview: ${translatedSummary} \n\nKey Highlights: \n${translatedHighlights} \n\nVerdict: ${translatedVerdict}${extraNote}`;
          }
          isFallback = true;
        } else {
          throw err;
        }
      }
      
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
        verdict: parsedVerdict,
        aiPowered: !isFallback
      });
      setIsLocal(isFallback);

      setStep(3); 
      await new Promise(r => setTimeout(r, 400));
    } catch (error) {
      console.error('AI Processing Error:', error);
      const status = error.response?.status;
      if (status === 401) {
        alert('Unauthorized: Your OpenRouter API Key is invalid. Please check your .env file and update VITE_OPENROUTER_API_KEY.');
      } else {
        alert(error.message || 'Failed to analyze. Please check your API key, network connection, or input.');
      }
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Output Language:</label>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid var(--glass-border)',
                outline: 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {languages.map(lang => (
                <option key={lang.name} value={lang.name} style={{ color: 'black' }}>{lang.name}</option>
              ))}
            </select>
          </div>

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
              {summary.aiPowered ? <CheckCircle2 color="var(--primary)" size={24} /> : <FileText color="#94a3b8" size={24} />}
              {summary.aiPowered ? 'AI Analysis' : 'Smart Summary (Local Fallback)'}
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
          
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              onClick={handleSaveToNotes}
              disabled={savingNote || noteSaved}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: noteSaved ? '#10b981' : 'rgba(255,255,255,0.05)',
                border: noteSaved ? '1px solid #10b981' : '1px solid var(--glass-border)',
                color: noteSaved ? 'white' : 'var(--primary)',
                padding: '0.6rem 1.2rem',
                transition: 'all 0.3s ease'
              }}
            >
              {savingNote ? <Loader2 size={18} className="animate-spin" /> : noteSaved ? <CheckCircle2 size={18} /> : <BookmarkPlus size={18} />}
              {savingNote ? 'Saving...' : noteSaved ? 'Saved to Notes!' : 'Save to Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSummariser;
