import React, { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8000/notes');
      if (response.ok) {
        const data = await response.json();
        // التأكد من أن البيانات مصفوفة وليست فارغة أو غير معرّفة
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setText('');
        fetchNotes();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8000/notes/${id}`, {
        method: 'DELETE'
      });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        AI Text Summarizer 🚀
      </h1>

      <textarea
        rows="5"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste any text (English or Arabic) to summarize here..."
        dir="auto"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '16px',
          marginBottom: '15px'
        }}
      />

      <button
        onClick={handleSummarize}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'block',
          width: '100%'
        }}
      >
        Summarize Text
      </button>

      <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Saved Notes 📋</h2>

      <div>
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note.id || note[0] || index}
              style={{
                background: '#f9f9f9',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                textAlign: 'left'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
                {note.title || note[1] || 'Note'}
              </h3>
              <p style={{ margin: '0 0 15px 0', color: '#666', lineHeight: '1.5' }} dir="auto">
                {note.summary || note[2] || note.text || ''}
              </p>
              <button
                onClick={() => handleDelete(note.id || note[0])}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>No saved notes yet. Start by summarizing some text above!</p>
        )}
      </div>
    </div>
  );
}

export default App;