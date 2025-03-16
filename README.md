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

💡 Intelligent AI Assistance - Get smart, AI-powered loan recommendations based on your profile
🌎 Truly Multilingual - No language barriers! Talk in any language, and we understand you
🗣 Voice & Text Flexibility - Choose between typing or speaking for easy interactions
📲 WhatsApp-Friendly - No need for extra apps—get help via WhatsApp anytime!
📑 Document Insights - Upload your loan documents, and let AI extract key information
🔐 Secure & Scalable - Built with Firebase, MongoDB, and secure API integrations
📲 Call & Text - You can have a call and also chat with our AI assistant

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
- **Node.js** & **npm** installed
- **MongoDB Atlas** account & cluster setup
- **Firebase project** configured for authentication
- **Twilio API credentials** for WhatsApp messaging
- **Sarvam API keys** for speech, translation, and document processing

### 🔹 Backend Setup
```sh
# Clone the repository
git clone https://github.com/your-repo/loan-advisor.git

# Navigate to backend folder
cd loan-advisor/backend

# Install dependencies
npm install

# Start the backend server
node server.js
```

### 🔹 Frontend Setup
```sh
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Start the frontend (React + Vite)
npm run dev
```

---

## 🔹 Environment Variables Configuration

Create a **.env** file in both the `backend` and `frontend` directories with the following variables:

### **Backend (.env)**
```
PORT=5000
MONGO_URI=your-mongodb-url
FIREBASE_API_KEY=your-firebase-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
SARVAM_API_KEY=your-sarvam-api-key
```

### **Frontend (.env)**
```
VITE_APP_FIREBASE_API_KEY=your-firebase-api-key
VITE_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_APP_FIREBASE_APP_ID=your-firebase-app-id
VITE_APP_BACKEND_URL=http://localhost:5000
```

---

## 💡 Future Enhancements

🚀 **AI-Powered Loan Comparison** - Compare loan offers dynamically  
📊 **Loan EMI Calculator** - Help users plan their loan payments  
🤖 **Advanced Sentiment Analysis** - Understand user emotions for better support  
📍 **Location-Based Loan Offers** - Personalized loan options based on user location  

---

## 🤝 Contributing

We welcome contributions! Feel free to **fork this repo, raise issues, and submit PRs** 🚀  

---

## 🛠️ Built With

- 🖥 **React + Vite** - For a fast and interactive UI  
- 🏗 **Node.js + Express.js** - Scalable and efficient backend  
- 🛢 **MongoDB + Firebase** - Secure and structured data storage  
- 🔊 **Sarvam APIs** - State-of-the-art speech & text processing  
- 🔗 **Twilio API** - For WhatsApp integration  
- 🤖 **LLaMA 3** - AI-powered intelligent loan advisory  

---

## 📞 Contact Us

📩 **Email:** harshith.gangone@gmail.com


💙 **Star this repo if you find it useful!** ⭐🚀
