# 🏙️ CivicAI — AI-Powered Civic Intelligence Platform

**CivicAI** is a real-time, full-stack web platform built to bridge the communication gap between citizens and local municipal authorities for reporting and tracking daily civic issues.

🚀 **Live Demo:** [https://civicai-app-af2ee.web.app](https://civicai-app-af2ee.web.app)  
💻 **GitHub Repository:** [https://github.com/aahanachoudhary01/civicai](https://github.com/aahanachoudhary01/civicai)

---

## 💡 The Story Behind CivicAI
The spark for this project came from the **vibe2ship hackathon**. Inspired by that energy, I challenged myself to build a high-impact, real-world solution completely from scratch within a **30-day build sprint**. 

---

## 🏙️ The Problem
Civic issues like potholes, water leakages, and garbage overflow are part of daily life. However, the reporting process is often fragmented, slow, and completely lacks transparency, leaving citizens in the dark.

---

## ✨ Key Technical Highlights

- **📸 AI-Driven Detection:** Integrated Google Gemini Vision to automatically identify issue types, assess severity levels, and draft structured complaints in just a few seconds.
- **🎙️ Multilingual Voice Support:** Built-in Hindi & English voice reporting to maximize accessibility for all users.
- **🗺️ Live Heatmaps:** Combined Leaflet Maps with an OpenStreetMap/Nominatim geocoding pipeline to dynamically map text addresses into exact coordinate pins.
- **📊 Smart Priority Scoring:** An automated crowd-sourcing algorithm that ranks complaints dynamically based on user upvotes.
- **🔐 Secure User Controls:** Implemented Firebase Auth and strict Firestore Rules for real-time **conditional delete** options, ensuring users can only manage or delete their own reports.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite)
- **Database & Auth:** Firebase Firestore & Firebase Authentication
- **AI Ecosystem:** Google Gemini AI (Vision & Text)
- **Maps:** Leaflet.js & OpenStreetMap API

---

## 🚀 Local Setup

1. **Clone the repo:** `git clone https://github.com/aahanachoudhary01/civicai.git`
2. **Install dependencies:** `npm install`
3. **Configure Environment:** Create a `.env` file with your Firebase and Gemini API keys.
4. **Run development server:** `npm run dev`
