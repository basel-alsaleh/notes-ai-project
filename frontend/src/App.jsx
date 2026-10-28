import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setText(''); // تفريغ الصندوق فوراً
        fetchNotes();
      } else {
        alert("حدث خطأ في السيرفر");
      }
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بالباك إند!");
    } finally {
      setLoading(false);
    }
  };

  // دالة حذف الملاحظة
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // منع تفعيل النقر على الكرت عند الضغط على زر الحذف
    try {
      const res = await fetch(`http://127.0.0.1:8000/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchNotes(); // تحديث القائمة بعد الحذف
      } else {
        alert("Failed to delete note");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '650px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>AI Text Summarizer 🚀</h1>
      <form onSubmit={handleSummarize}>
        <textarea
          rows="6"
          style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' }}
          placeholder="Type or paste any text (English or Arabic) to summarize here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Summarizing...' : 'Summarize Text'}
        </button>
      </form>

      {summary && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px', textAlign: 'left' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Summary Result:</h3>
          <p style={{ margin: '0', whiteSpace: 'pre-wrap', lineHeight: '1.6', wordBreak: 'break-word' }}>{summary}</p>
        </div>
      )}

      <h2 style={{ marginTop: '30px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>Saved Notes 📋</h2>
      {notes.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No saved notes yet. Start by summarizing some text above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          {notes.map((note) => (
            <div 
              key={note.id} 
              onClick={() => setSummary(note.content)} 
              style={{ 
                position: 'relative',
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* زر الحذف الأحمر */}
              <button
                onClick={(e) => handleDelete(e, note.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>

              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff', marginBottom: '6px', paddingRight: '50px' }}>
                📌 {note.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#495057', 
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {note.content}
              </div>
              <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '8px', textAlign: 'right' }}>
                (Click to view full note above 👆)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;