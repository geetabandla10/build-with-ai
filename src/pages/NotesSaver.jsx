import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, Search, StickyNote as NoteIcon, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const NotesSaver = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch notes from Supabase
  useEffect(() => {
    if (user?.email) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching notes:', error);
    else setNotes(data || []);
    setLoading(false);
  };

  const addNote = async () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      user_email: user.email,
      color: '#818cf8'
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select();

    if (error) console.error('Error adding note:', error);
    else {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0]);
      setIsEditing(true);
    }
  };

  const deleteNote = async (id, e) => {
    e?.stopPropagation();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting note:', error);
    else {
      setNotes(notes.filter(note => note.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    }
  };

  const saveNote = async () => {
    const { error } = await supabase
      .from('notes')
      .update({ title: activeNote.title, content: activeNote.content })
      .eq('id', activeNote.id);

    if (error) console.error('Error saving note:', error);
    else {
      setNotes(notes.map(n => n.id === activeNote.id ? activeNote : n));
      setIsEditing(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title gradient-text">Notes Saver</h2>
        <p className="page-subtitle">Your personal space for {user?.name}'s insights.</p>
      </header>
      
      <div className="card glass">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <button className="btn-primary" onClick={addNote} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <Plus size={20} /> New Note
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Loading your notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No notes found. Create your first one!</div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className={`card glass ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => { setActiveNote(note); setIsEditing(false); }}
              style={{ padding: '1.5rem', cursor: 'pointer', border: activeNote?.id === note.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => deleteNote(note.id, e)} style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {isEditing && activeNote?.id === note.id ? (
                <div onClick={e => e.stopPropagation()}>
                  <input 
                    value={activeNote.title} 
                    onChange={e => setActiveNote({...activeNote, title: e.target.value})}
                    style={{ marginBottom: '0.5rem', fontWeight: '600' }}
                  />
                  <textarea 
                    value={activeNote.content} 
                    onChange={e => setActiveNote({...activeNote, content: e.target.value})}
                    rows="4"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => setIsEditing(false)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}><X size={20} /></button>
                    <button onClick={saveNote} style={{ color: 'var(--primary)', background: 'transparent', border: 'none' }}><Check size={20} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{note.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content || 'No content yet...'}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveNote(note); setIsEditing(true); }}
                    style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={14} /> Edit Note
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSaver;
