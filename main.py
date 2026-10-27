import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

api_key_value = os.getenv("OPENROUTER_API_KEY")

ai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key_value,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# شكل البيانات المطلوبة عند إنشاء أو تعديل ملاحظة
class NoteSchema(BaseModel):
    title: str
    content: str

# دالة الاتصال بقاعدة البيانات
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="tilSTH&101", # استبدلها بكلمة مرورك الخاصة
        database="notes_db"
    )

# 1. عرض كل الملاحظات (GET)
@app.get("/notes")
def get_notes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM notes")
    notes = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"notes": notes}

# 2. إضافة ملاحظة جديدة (POST)
@app.post("/notes")
def create_note(note: NoteSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (title, content) VALUES (%s, %s)", (note.title, note.content))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Note created successfully!"}

# 3. تعديل ملاحظة (PUT)
@app.put("/notes/{note_id}")
def update_note(note_id: int, note: NoteSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notes SET title=%s, content=%s WHERE id=%s", (note.title, note.content, note_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Note updated successfully!"}

# 4. حذف ملاحظة (DELETE)
@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id=%s", (note_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Note deleted successfully!"}
@app.post("/ai/summarize")
def summarize_note(text: str):
    response = ai_client.chat.completions.create(
        model="meta-llama/llama-3.1-8b-instruct",
        messages=[
            {
                "role": "system", 
                "content": "أنت مساعد ذكي متخصص في تلخيص النصوص. قم بتلخيص النص المطلوب باللغة العربية فقط في 2 إلى 3 جمل قصيرة ومباشرة بدون إضافة أي كلمات أجنبية أو رموز غريبة."
            },
            {"role": "user", "content": f"لخص النص التالي بشكل مختصر جداً:\n{text}"}
        ]
    )
    
    summary = response.choices[0].message.content
    return {"summary": summary}    
