import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit3, Search, Check, X, Sparkles, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'notes_saver_local';

const getLocalNotes = (email) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[email] || [];
  } catch { return []; }
};

const saveLocalNotes = (email, notes) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[email] = notes;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) { console.error('Failed to save notes locally:', e); }
};

const NotesSaver = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  // Modal states
  const [editNote, setEditNote] = useState(null); // { id, title, content }
  const [viewNote, setViewNote] = useState(null); // { id, title, content }
  const [viewSummaryNote, setViewSummaryNote] = useState(null); // { id, title, content }
  const titleInputRef = useRef(null);

  // Auto-select title text when modal opens
  useEffect(() => {
    if (editNote && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editNote]);

  // Summarizer state: { [noteId]: { loading, result, error } }
  const [summaries, setSummaries] = useState({});

  const fetchNotes = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed, using localStorage:', error.message);
        setUseLocal(true);
        setNotes(getLocalNotes(user.email));
      } else {
        setUseLocal(false);
        setNotes(data || []);
      }
    } catch (err) {
      console.warn('Supabase unreachable, using localStorage:', err.message);
      setUseLocal(true);
      setNotes(getLocalNotes(user.email));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) fetchNotes();
  }, [user, fetchNotes]);

  useEffect(() => {
    if (useLocal && user?.email && !loading) {
      saveLocalNotes(user.email, notes);
    }
  }, [notes, useLocal, user, loading]);

  // ── Add note ──────────────────────────────────────────────────────────────
  const addNote = async () => {
    if (!user?.email || isAdding) return;
    setIsAdding(true);

    const baseNote = {
      title: 'Untitled Note',
      content: '',
      user_email: user.email,
      color: '#818cf8',
    };

    try {
      if (useLocal) {
        const localNote = { ...baseNote, id: Date.now(), created_at: new Date().toISOString() };
        setNotes(prev => [localNote, ...prev]);
        setEditNote(localNote);
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([baseNote])
        .select()
        .single();

      if (error || !data) {
        console.warn('Supabase insert failed, switching to localStorage:', error?.message);
        setUseLocal(true);
        const localNote = { ...baseNote, id: Date.now(), created_at: new Date().toISOString() };
        setNotes(prev => [localNote, ...prev]);
        setEditNote(localNote);
      } else {
        setNotes(prev => [data, ...prev]);
        setEditNote(data);
      }
    } catch (err) {
      console.warn('Supabase unreachable, switching to localStorage:', err.message);
      setUseLocal(true);
      const localNote = { ...baseNote, id: Date.now(), created_at: new Date().toISOString() };
      setNotes(prev => [localNote, ...prev]);
      setEditNote(localNote);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteNote = async (id, e) => {
    e?.stopPropagation();
    if (!useLocal) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) console.warn('Supabase delete failed:', error.message);
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editNote?.id === id) setEditNote(null);
    setSummaries(prev => { const s = { ...prev }; delete s[id]; return s; });
  };

  const saveNote = async () => {
    if (!editNote) return;
    if (!useLocal) {
      const { error } = await supabase
        .from('notes')
        .update({ title: editNote.title, content: editNote.content })
        .eq('id', editNote.id);
      if (error) console.warn('Supabase update failed:', error.message);
    }
    setNotes(prev => prev.map(n => n.id === editNote.id ? { ...n, title: editNote.title, content: editNote.content } : n));
    if (viewNote?.id === editNote.id) {
      setViewNote({ ...viewNote, title: editNote.title, content: editNote.content });
    }
    if (viewSummaryNote?.id === editNote.id) {
      setViewSummaryNote({ ...viewSummaryNote, title: editNote.title, content: editNote.content });
    }
    setEditNote(null);
  };

  // ── Local extractive summarizer (no API needed) ───────────────────────────
  const localSummarize = (title, content) => {
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','these','those','it','its','as','so','if','then','than','not','no','up','out','about','into','through','during','before','after','above','below','between','each','more','also','can','just','i','you','he','she','we','they','my','your','his','her','our','their','me','him','us','them','what','which','who']);

    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const words = content.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    // Word frequency map
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    // Score each sentence
    const scored = sentences.map(sentence => {
      const sWords = sentence.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => !stopWords.has(w));
      const score = sWords.reduce((acc, w) => acc + (freq[w] || 0), 0) / (sWords.length || 1);
      return { sentence: sentence.trim(), score };
    });

    // Pick top 2 sentences by score (preserve original order)
    const topIndices = scored
      .map((s, i) => ({ ...s, i }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(s => s.i)
      .sort((a, b) => a - b);

    const summary = topIndices.map(i => scored[i].sentence).join(' ');
    return summary || sentences[0]?.trim() || content.slice(0, 200);
  };

  // ── AI Summarizer ─────────────────────────────────────────────────────────
  const summarizeNote = async (note, e) => {
    e.stopPropagation();
    const id = note.id;

    // Toggle off if summary already loaded
    if (summaries[id]?.result) {
      setSummaries(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    const content = note.content?.trim();
    if (!content) {
      setSummaries(prev => ({ ...prev, [id]: { loading: false, result: null, error: 'Note is empty — add some content first.' } }));
      return;
    }

    setSummaries(prev => ({ ...prev, [id]: { loading: true, result: null, error: null } }));

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    // Try OpenRouter AI if key is available
    if (apiKey) {
      try {
        const prompt = `Summarize the following note in 2-3 concise sentences. Focus on key points only.\n\nNote Title: "${note.title}"\n\nNote Content:\n${content}`;
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          { model: 'openrouter/auto', messages: [{ role: 'user', content: prompt }] },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Career AI Suite – Notes Saver',
              'Content-Type': 'application/json',
            },
          }
        );
        const result = response.data.choices[0].message.content.trim();
        setSummaries(prev => ({ ...prev, [id]: { loading: false, result, error: null, aiPowered: true } }));
        return;
      } catch (err) {
        console.warn('OpenRouter failed, falling back to local summarizer:', err.message);
      }
    }

    // Fallback: local extractive summarizer (always works)
    await new Promise(r => setTimeout(r, 400)); // small delay for UX
    const result = localSummarize(note.title, content);
    setSummaries(prev => ({ ...prev, [id]: { loading: false, result, error: null, aiPowered: false } }));
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title gradient-text">Notes Saver</h2>
        <p className="page-subtitle">Your personal space for {user?.name}'s insights.</p>
      </header>

      {/* ── Toolbar ── */}
      <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.45, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.6rem', marginBottom: 0 }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={addNote}
            disabled={isAdding}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap', opacity: isAdding ? 0.7 : 1, flexShrink: 0 }}
          >
            {isAdding
              ? <><Loader2 size={16} className="spin-icon" /> Creating…</>
              : <><Plus size={18} /> New Note</>
            }
          </button>
        </div>

        {useLocal && (
          <div style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.8rem', color: '#fbbf24' }}>
            ⚠️ Notes are saved locally (Supabase unavailable)
          </div>
        )}
      </div>

      {/* ── Notes Grid ── */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Loading your notes…</div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No notes found. Create your first one!</div>
        ) : (
          filteredNotes.map(note => {
            const sumState = summaries[note.id];
            return (
              <div
                key={note.id}
                className="card glass"
                onClick={() => setViewNote(note)}
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.6rem', 
                  borderRadius: '16px', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '3px', cursor: 'pointer', display: 'flex' }}
                    title="Delete note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Title & content preview */}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: '1.3' }}>{note.title}</h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.5',
                  flexGrow: 1
                }}>
                  {note.content || 'No content yet…'}
                </p>

                {/* AI Summary panel */}
                {sumState && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); setViewSummaryNote(note); }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: sumState.error ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                      border: `1px solid ${sumState.error ? 'rgba(239, 68, 68, 0.25)' : 'rgba(99, 102, 241, 0.2)'}`,
                      animation: 'noteFadeIn 0.3s ease-out',
                      cursor: 'zoom-in'
                    }}
                  >
                    {sumState.loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#818cf8', fontSize: '0.82rem' }}>
                        <Loader2 size={13} className="spin-icon" /> Summarizing…
                      </div>
                    ) : sumState.error ? (
                      <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>⚠️ {sumState.error}</p>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.4rem' }}>
                          {sumState.aiPowered ? <Sparkles size={11} color="#818cf8" /> : <FileText size={11} color="#94a3b8" />}
                          <span style={{ fontSize: '0.7rem', color: sumState.aiPowered ? '#818cf8' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {sumState.aiPowered ? 'AI Summary' : 'Smart Summary'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>{sumState.result}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditNote({ ...note }); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>

                  <button
                    onClick={(e) => summarizeNote(note, e)}
                    disabled={sumState?.loading}
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.28)',
                      color: sumState?.result ? '#94a3b8' : '#818cf8',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: sumState?.loading ? 'wait' : 'pointer',
                      opacity: sumState?.loading ? 0.7 : 1,
                    }}
                    title={sumState?.result ? 'Remove summary' : 'Summarize with AI'}
                  >
                    <Sparkles size={12} />
                    {sumState?.result ? 'Hide' : 'Summarise'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── View Modal ── */}
      {viewNote && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            animation: 'noteFadeIn 0.2s ease-out'
          }}
          onClick={() => setViewNote(null)}
        >
          <div
            className="card glass"
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              maxHeight: '90vh',
              padding: '2.5rem', 
              borderRadius: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  {new Date(viewNote.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: '1.2', color: 'white' }}>{viewNote.title}</h2>
              </div>
              <button 
                onClick={() => setViewNote(null)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              paddingRight: '1rem',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap'
            }}>
              {viewNote.content || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No content in this note.</span>}
              
              {summaries[viewNote.id] && (
                <div style={{ 
                  marginTop: '2rem', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  border: '1px solid rgba(99, 102, 241, 0.2)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    {summaries[viewNote.id].aiPowered ? <Sparkles size={16} color="#818cf8" /> : <FileText size={16} color="#94a3b8" />}
                    <span style={{ fontSize: '0.9rem', color: summaries[viewNote.id].aiPowered ? '#818cf8' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {summaries[viewNote.id].aiPowered ? 'AI Summary' : 'Smart Summary'}
                    </span>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.6' }}>{summaries[viewNote.id].result}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setEditNote({ ...viewNote }); }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'rgba(255,255,255,0.05)', 
                  color: 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit3 size={18} /> Edit Note
              </button>
              <button
                className="btn-primary"
                onClick={() => setViewNote(null)}
                style={{ padding: '0.75rem 2rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary View Modal ── */}
      {viewSummaryNote && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 950,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            animation: 'noteFadeIn 0.2s ease-out'
          }}
          onClick={() => setViewSummaryNote(null)}
        >
          <div
            className="card glass"
            style={{ 
              width: '100%', 
              maxWidth: '700px', 
              maxHeight: '85vh',
              padding: '2.5rem', 
              borderRadius: '28px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  {summaries[viewSummaryNote.id]?.aiPowered ? <Sparkles size={18} color="#818cf8" /> : <FileText size={18} color="#94a3b8" />}
                  <span style={{ fontSize: '0.9rem', color: summaries[viewSummaryNote.id]?.aiPowered ? '#818cf8' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {summaries[viewSummaryNote.id]?.aiPowered ? 'AI Summary' : 'Smart Summary'} View
                  </span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{viewSummaryNote.title}</h2>
              </div>
              <button 
                onClick={() => setViewSummaryNote(null)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              paddingRight: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              <div style={{ 
                padding: '2rem', 
                borderRadius: '20px', 
                background: 'rgba(99, 102, 241, 0.15)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '1.25rem',
                lineHeight: '1.6',
                color: '#fff',
                fontStyle: 'italic'
              }}>
                "{summaries[viewSummaryNote.id]?.result || "No summary available."}"
              </div>

              <div style={{ opacity: 0.6 }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', color: 'var(--text-muted)' }}>Full Note Reference</h4>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                  {viewSummaryNote.content || "Empty note."}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setEditNote({ ...viewSummaryNote }); }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'rgba(255,255,255,0.05)', 
                  color: 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit3 size={18} /> Edit Note
              </button>
              <button
                className="btn-primary"
                onClick={() => setViewSummaryNote(null)}
                style={{ padding: '0.75rem 2rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editNote && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'noteFadeIn 0.2s ease-out'
          }}
          onClick={() => setEditNote(null)}
        >
          <div
            className="card glass"
            style={{ width: '100%', maxWidth: '540px', padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Note</h3>
              <button onClick={() => setEditNote(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                ref={titleInputRef}
                value={editNote.title}
                onChange={e => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title"
                style={{ fontWeight: 600, fontSize: '1rem' }}
              />
              <textarea
                value={editNote.content}
                onChange={e => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your note here…"
                rows={7}
                style={{ fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setEditNote(null)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={saveNote}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin-icon { animation: noteSpin 1s linear infinite; display: inline-block; }
        @keyframes noteSpin { to { transform: rotate(360deg); } }
        @keyframes noteFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default NotesSaver;
