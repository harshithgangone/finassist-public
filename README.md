# 🌍💰 Multilingual Loan Advisor

🚀 **An AI-powered multilingual loan advisory platform that provides personalized loan recommendations via Chat and WhatsApp, supporting voice and text interactions in multiple languages.**  

## 🏗️ Tech Stack

| **Category**          | **Technologies Used**  |
|----------------------|---------------------|
| **Frontend (Web App)** | React + Vite + Material UI + Redux |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Atlas) + Firebase Firestore |
| **Authentication** | Firebase Auth |
| **Messaging (Chat & WhatsApp)** | Twilio API (WhatsApp Integration) |
| **Speech Processing** | Sarvam TTS (Bulbul:v1) + Sarvam STT (Sarika:v2) |
| **Translation** | Sarvam Translation API (Mayura:v1) |
| **Document Handling** | Sarvam File Parser API |
| **LLM (AI Processing)** | LLaMA 3 (Custom Fine-tuned) |
| **Real-time Communication** | WebSockets (Socket.io) |
| **File Storage** | Server-side Storage |

---

## 🌟 Features

✅ **Seamless Login & Authentication** - Firebase Auth secures user login  
✅ **AI-Powered Loan Suggestions** - Personalized loan recommendations using LLaMA 3  
✅ **Multilingual Support** - Supports multiple languages with real-time translation  
✅ **Voice & Text-Based Assistance** - Speech-to-text & text-to-speech powered by Sarvam APIs  
✅ **WhatsApp Integration** - Loan advisor accessible via WhatsApp (Twilio API)  
✅ **Smart Document Parsing** - Users can upload loan-related documents for analysis  
✅ **Real-Time Conversations** - Instant responses using WebSockets  
✅ **Data Security & Storage** - All user data is stored securely in MongoDB  

---

## 🔥 Why Choose Us?

💡 Intelligent AI Assistance - Get smart, AI-powered loan recommendations based on your profile
🌎 Truly Multilingual - No language barriers! Talk in any language, and we understand you
🗣 Voice & Text Flexibility - Choose between typing or speaking for easy interactions
📲 WhatsApp-Friendly - No need for extra apps—get help via WhatsApp anytime!
📑 Document Insights - Upload your loan documents, and let AI extract key information
🔐 Secure & Scalable - Built with Firebase, MongoDB, and secure API integrations
📲 Call & Text - You can have a call and also chat with our AI assistant
🚀Trianing - Also trained on realtime datasets

---

## 🎯 How It Works

1️⃣ **User logs in** via Firebase Authentication  
2️⃣ **User sends a query** (either voice or text) via the app or WhatsApp  
3️⃣ **AI processes the query** using speech-to-text (Sarvam API) and translates it to English  
4️⃣ **LLaMA 3 analyzes** the request and generates a loan suggestion  
5️⃣ **AI translates** the response back to the user’s preferred language  
6️⃣ **AI-generated response is sent** via app UI or WhatsApp  
7️⃣ **User can upload loan documents**, and AI extracts key details for better suggestions  

---

## 📌 Installation & Setup

### 🔹 Prerequisites
- Node.js & npm installed
- MongoDB Atlas setup
- Firebase project configured
- Twilio API credentials
- Sarvam API keys

### 🔹 Backend Setup
```sh
git clone https://github.com/your-repo/loan-advisor.git
cd loan-advisor/backend
npm install
node server.js
