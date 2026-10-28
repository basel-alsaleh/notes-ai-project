from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password="tilSTH&101",
        database=os.getenv("DB_NAME", "notes_db")
    )

class NoteItem(BaseModel):
    text: str

@app.get("/notes")
def get_notes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, content FROM notes ORDER BY id DESC")
        notes = cursor.fetchall()
        cursor.close()
        conn.close()
        return notes
    except Exception as e:
        return []

@app.post("/summarize")
def summarize_text(item: NoteItem):
    try:
        sentences = item.text.split(". ")
        short_summary = sentences[0] + "." if len(sentences) > 0 else item.text
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO notes (title, content) VALUES (%s, %s)",
            ("Smart Note", short_summary)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return {"status": "success", "summary": short_summary}
        
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success"}
   
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))