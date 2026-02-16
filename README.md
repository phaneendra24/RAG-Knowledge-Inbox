# RAG Assignment Frontend

A modern, responsive React interface for the RAG Assignment backend. Built with Vite, TailwindCSS, and Shadcn UI.

## Repository

[https://github.com/phaneendra/rag-assignment-frontend](https://github.com/phaneendra/rag-assignment-frontend)

## Overview

This application provides a user-friendly interface to:

1.  **Chat with Documents**: Ask questions and get answers based on retrieved context.
2.  **Upload Documents**: Submit URLs for scraping and indexing.
3.  **View History**: Access past conversations and scraped documents.

## Prerequisites

- Node.js (v18+)
- Backend service running (defaults to `http://localhost:5001`)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/phaneendra/rag-assignment-frontend.git
cd rag-assignment-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Ensure the API URL points to your backend:

```env
VITE_API_URL="http://localhost:5001"
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Key Libraries

| Library            | Purpose                           |
| :----------------- | :-------------------------------- |
| **React 19**       | Core UI library                   |
| **Vite**           | Build tool & Dev server           |
| **TypeScript**     | Type safety                       |
| **TailwindCSS**    | Utility-first styling             |
| **Shadcn UI**      | Accessible component primitives   |
| **TanStack Query** | Server state management & caching |
| **React Router**   | Client-side routing               |
| **Lucide React**   | Icons                             |
| **Sonner**         | Toast notifications               |
