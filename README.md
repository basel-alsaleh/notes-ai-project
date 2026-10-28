# Notes AI Project

A simple full-stack web app that takes long text, generates a summary using AI, and lets you manage saved notes.

## Tech Stack
- Frontend: React 
- Backend: FastAPI
- Database: MySQL

## Main Features
- Summarize long text automatically
- Save summarized notes to MySQL database
- Click notes to load them back or delete them
- API documentation available via FastAPI Swagger UI

## How to Run

1. Backend (FastAPI):
   uvicorn main:app --reload

2. Frontend (React):
   cd frontend
   npm run dev
