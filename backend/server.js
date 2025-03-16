const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const multer = require("multer")
const path = require("path")
const axios = require("axios")
const admin = require("firebase-admin")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const FormData = require("form-data")
const stream = require("stream")
const { promisify } = require("util")
const pipeline = promisify(stream.pipeline)

// Add these imports at the top with the other imports
const ffmpeg = require("fluent-ffmpeg")
const { exec } = require("child_process")
const util = require("util")
const execPromise = util.promisify(exec)

// Add these imports at the top with the other imports
const csv = require("csv-parser")
const https = require("https")

// Add this import at the top with the other imports
const loanDataService = require("./services/loanDataService")

// Load environment variables
dotenv.config()

// Initialize Firebase Admin
let serviceAccount
try {
  // Try parsing the service account from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} catch (error) {
  console.error("Error parsing Firebase service account:", error)
  // Fallback to a default service account for development
  serviceAccount = {
    type: "service_account",
    project_id: "loan-advisor-dev",
    private_key_id: "dummy-key-id",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-dummy@loan-advisor-dev.iam.gserviceaccount.com",
    client_id: "dummy-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dummy%40loan-advisor-dev.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  console.log("Firebase Admin initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase Admin:", error)
}

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration - UPDATED to allow all origins in development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // In development, allow all origins
      return callback(null, true)
    },
    credentials: false, // Changed to match frontend setting
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Add OPTIONS handling for preflight requests
app.options("*", cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/loanadvisor")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Define schemas and models
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String },
  preferredLanguage: { type: String, default: "en" },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  hasFile: { type: Boolean, default: false },
  fileName: { type: String },
  fileUrl: { type: String },
  originalText: { type: String }, // Store original text before translation
})

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [messageSchema],
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const callSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  duration: { type: Number, required: true },
  language: { type: String, default: "en" },
  timestamp: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)
const Chat = mongoose.model("Chat", chatSchema)
const Call = mongoose.model("Call", callSchema)

// Add this new schema after the existing schemas
const financialInfoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  age: { type: Number },
  occupation: { type: String },
  yearsInOccupation: { type: Number },
  annualIncome: { type: Number },
  homeOwnership: { type: String, enum: ["Own", "Rent", "Other"] },
  pastLoans: { type: String },
  creditScore: { type: Number },
  activeBankAccounts: { type: Number },
  completedQuestionnaire: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
})

const FinancialInfo = mongoose.model("FinancialInfo", financialInfoSchema)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const dir = path.join(__dirname, "uploads")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Helper function to check if Sarvam API key is valid
const isSarvamApiKeyValid = () => {
  return (
    process.env.SARVAM_API_KEY &&
    process.env.SARVAM_API_KEY !== "sarvam_dummy_key" &&
    process.env.SARVAM_API_KEY.length > 10
  )
}

// Helper function to check if Together API key is valid
const isTogetherApiKeyValid = () => {
  return (
    process.env.TOGETHER_API_KEY &&
    process.env.TOGETHER_API_KEY !== "together_dummy_key" &&
    process.env.TOGETHER_API_KEY.length > 10
  )
}

// Map our simple language codes to Sarvam's language codes
const mapToSarvamLanguageCode = (code) => {
  const languageMapping = {
    en: "en-IN",
    hi: "hi-IN",
    bn: "bn-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    mr: "mr-IN",
    or: "od-IN", // Note: Sarvam uses "od-IN" for Odia
    pa: "pa-IN",
    ta: "ta-IN",
    te: "te-IN",
  }
  return languageMapping[code] || "en-IN" // Default to English if not found
}

// Helper function to translate text using Sarvam API
const translateText = async (text, sourceLanguage, targetLanguage) => {
  if (!isSarvamApiKeyValid()) {
    console.log("No valid Sarvam API key for translation")
    throw new Error("No valid Sarvam API key")
  }

  // Don't translate if source and target are the same
  if (sourceLanguage === targetLanguage && sourceLanguage !== "auto") {
    return { translatedText: text, detectedSourceLanguage: sourceLanguage }
  }

  try {
    // Map to Sarvam language codes
    const sourceLangCode = sourceLanguage === "auto" ? "en-IN" : mapToSarvamLanguageCode(sourceLanguage)
    const targetLangCode = mapToSarvamLanguageCode(targetLanguage)

    console.log(`Translating from ${sourceLangCode} to ${targetLangCode}`)

    // Break long text into chunks - Sarvam API has a limit
    const MAX_CHUNK_SIZE = 500 // Reduced from 1000 to 500 characters

    if (text.length > MAX_CHUNK_SIZE) {
      console.log(`Text is too long (${text.length} chars), breaking into chunks for translation`)

      // Split by sentences for more natural chunks
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      let currentChunk = ""
      const chunks = []

      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= MAX_CHUNK_SIZE) {
          currentChunk += sentence
        } else {
          if (currentChunk) chunks.push(currentChunk)
          currentChunk = sentence
        }
      }

      if (currentChunk) chunks.push(currentChunk)

      console.log(`Split into ${chunks.length} chunks for translation`)

      // Translate each chunk with proper error handling
      const translatedChunks = []
      for (const chunk of chunks) {
        try {
          console.log(`Translating chunk (${chunk.length} chars): ${chunk.substring(0, 50)}...`)

          const response = await axios.post(
            "https://api.sarvam.ai/translate",
            {
              input: chunk,
              source_language_code: sourceLangCode,
              target_language_code: targetLangCode,
              speaker_gender: "Male",
              mode: "formal",
              model: "mayura:v1",
              output_script: "fully-native",
              enable_preprocessing: false,
            },
            {
              headers: {
                "api-subscription-key": process.env.SARVAM_API_KEY,
                "Content-Type": "application/json",
              },
              timeout: 30000, // 30 second timeout
            },
          )

          // Check for the correct response structure
          if (response.data && response.data.translated_text) {
            translatedChunks.push(response.data.translated_text)
            console.log(`Successfully translated chunk to: ${response.data.translated_text.substring(0, 50)}...`)
          } else {
            console.error("Invalid chunk translation response:", response.data)
            // If translation fails, use the original chunk
            translatedChunks.push(chunk)
          }
        } catch (chunkError) {
          console.error(`Error translating chunk: ${chunkError.message}`)
          if (chunkError.response) {
            console.error("API response status:", chunkError.response.status)
            console.error("API response data:", chunkError.response.data)
          }
          // If translation fails, use the original chunk
          translatedChunks.push(chunk)
        }

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      return {
        translatedText: translatedChunks.join(" "),
        detectedSourceLanguage: sourceLanguage,
      }
    }

    // For shorter text, translate normally
    console.log(`Translating short text (${text.length} chars): ${text.substring(0, 50)}...`)

    const translationResponse = await axios.post(
      "https://api.sarvam.ai/translate",
      {
        input: text,
        source_language_code: sourceLangCode,
        target_language_code: targetLangCode,
        speaker_gender: "Male",
        mode: "formal",
        model: "mayura:v1",
        output_script: "fully-native",
        enable_preprocessing: false,
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      },
    )

    // Check for the correct response structure
    if (translationResponse.data && translationResponse.data.translated_text) {
      console.log(`Translation successful: ${translationResponse.data.translated_text.substring(0, 50)}...`)
      return {
        translatedText: translationResponse.data.translated_text,
        detectedSourceLanguage: sourceLanguage,
      }
    } else {
      console.error("Invalid translation response:", translationResponse.data)
      throw new Error("Invalid response from translation API")
    }
  } catch (error) {
    console.error(`Error calling translation API: ${error.message}`)
    if (error.response) {
      console.error("API response status:", error.response.status)
      console.error("API response data:", error.response.data)
    }

    // Return original text if translation fails
    console.log("Returning original text due to translation failure")
    return {
      translatedText: text,
      detectedSourceLanguage: sourceLanguage,
      error: error.message,
    }
  }
}

// Add a function to enforce character limits on responses
// Add this function after the translateText function

// Helper function to enforce character limits on responses
const enforceCharacterLimit = (text, limit = 500) => {
  if (!text) return ""

  if (text.length <= limit) return text

  console.log(`Text exceeds ${limit} character limit (${text.length}), truncating...`)

  // Try to find a good breaking point (end of sentence)
  const breakPoint = text.lastIndexOf(".", limit - 3)
  if (breakPoint > limit * 0.7) {
    // Only use sentence break if it's not too short
    return text.substring(0, breakPoint + 1)
  }

  // Otherwise just truncate with ellipsis
  return text.substring(0, limit - 3) + "..."
}

// Helper function to get response from Together.ai Llama 3 API
const getLlamaResponse = async (prompt, systemPrompt) => {
  if (!isTogetherApiKeyValid()) {
    console.log("No valid Together API key")
    throw new Error("No valid Together API key")
  }

  try {
    console.log("Calling Together.ai Llama 3 API")
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3-8b-chat-hf", // Using Llama 3 8B model
        messages: [
          {
            role: "system",
            content:
              systemPrompt ||
              "You are a helpful loan advising assistant. You ONLY provide information related to loans, financial advice, loan eligibility, and other loan-related topics. If asked about anything else, politely explain that you can only assist with loan-related inquiries.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      },
    )

    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message
    ) {
      console.log("Together.ai response received")
      return response.data.choices[0].message.content
    } else {
      throw new Error("Invalid response from Together.ai API")
    }
  } catch (error) {
    console.error("Error calling Together.ai API:", error)
    throw error
  }
}

// API Routes

// User routes
app.post("/api/users", async (req, res) => {
  try {
    console.log("Creating/updating user:", req.body)
    const { uid, email, displayName, photoURL } = req.body

    if (!uid || !email) {
      return res.status(400).json({ error: "User ID and email are required" })
    }

    // Check if user already exists
    let user = await User.findOne({ uid })

    if (user) {
      console.log("Updating existing user:", uid)
      // Update existing user
      user.email = email
      user.displayName = displayName || user.displayName
      if (photoURL) user.photoURL = photoURL
      await user.save()
    } else {
      console.log("Creating new user:", uid)
      // Create new user
      user = new User({
        uid,
        email,
        displayName,
        photoURL,
      })
      await user.save()
    }

    res.status(201).json(user)
  } catch (error) {
    console.error("Error creating/updating user:", error)
    res.status(500).json({ error: "Failed to create/update user" })
  }
})

app.get("/api/users/:uid", async (req, res) => {
  try {
    console.log("Fetching user:", req.params.uid)
    const user = await User.findOne({ uid: req.params.uid })
    if (!user) {
      console.log("User not found, creating placeholder")
      // If user doesn't exist in MongoDB but exists in Firebase, create a placeholder
      return res.json({
        uid: req.params.uid,
        displayName: "",
        preferredLanguage: "en",
        phone: "",
      })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

app.put("/api/users/:uid", async (req, res) => {
  try {
    console.log("Updating user:", req.params.uid, req.body)
    const { displayName, preferredLanguage, phone } = req.body

    let user = await User.findOne({ uid: req.params.uid })

    if (!user) {
      console.log("User not found, creating new user")
      // Create user if it doesn't exist
      user = new User({
        uid: req.params.uid,
        email: req.body.email || "unknown@example.com", // Placeholder email
        displayName,
        preferredLanguage,
        phone,
      })
    } else {
      // Update existing user
      if (displayName) user.displayName = displayName
      if (preferredLanguage) user.preferredLanguage = preferredLanguage
      if (phone) user.phone = phone
    }

    await user.save()
    res.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

app.post("/api/users/:uid/preferences", async (req, res) => {
  try {
    console.log("Saving language preference:", req.params.uid, req.body)
    const { language } = req.body

    let user = await User.findOne({ uid: req.params.uid })

    if (!user) {
      console.log("User not found, creating new user with language preference")
      // Create user if it doesn't exist
      user = new User({
        uid: req.params.uid,
        email: "unknown@example.com", // Placeholder email
        preferredLanguage: language,
      })
    } else {
      user.preferredLanguage = language
    }

    await user.save()
    res.json({ success: true, language })
  } catch (error) {
    console.error("Error saving language preference:", error)
    res.status(500).json({ error: "Failed to save language preference" })
  }
})

app.get("/api/users/:uid/preferences", async (req, res) => {
  try {
    console.log("Fetching user preferences:", req.params.uid)
    const user = await User.findOne({ uid: req.params.uid })

    if (!user) {
      console.log("User not found, returning default preferences")
      return res.json({ language: "en" })
    }

    res.json({ language: user.preferredLanguage || "en" })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    res.status(500).json({ error: "Failed to fetch user preferences" })
  }
})

// Add these new API endpoints after the existing user routes

// Get user's financial information
app.get("/api/users/:uid/financial-info", async (req, res) => {
  try {
    console.log("Fetching financial info for user:", req.params.uid)
    const financialInfo = await FinancialInfo.findOne({ userId: req.params.uid })

    if (!financialInfo) {
      return res.json({
        completedQuestionnaire: false,
        userId: req.params.uid,
      })
    }

    res.json(financialInfo)
  } catch (error) {
    console.error("Error fetching financial info:", error)
    res.status(500).json({ error: "Failed to fetch financial information" })
  }
})

// Save user's financial information
app.post("/api/users/:uid/financial-info", async (req, res) => {
  try {
    console.log("Saving financial info for user:", req.params.uid, req.body)
    const {
      age,
      occupation,
      yearsInOccupation,
      annualIncome,
      homeOwnership,
      pastLoans,
      creditScore,
      activeBankAccounts,
      completedQuestionnaire,
    } = req.body

    let financialInfo = await FinancialInfo.findOne({ userId: req.params.uid })

    if (financialInfo) {
      // Update existing record
      financialInfo.age = age !== undefined ? age : financialInfo.age
      financialInfo.occupation = occupation || financialInfo.occupation
      financialInfo.yearsInOccupation =
        yearsInOccupation !== undefined ? yearsInOccupation : financialInfo.yearsInOccupation
      financialInfo.annualIncome = annualIncome !== undefined ? annualIncome : financialInfo.annualIncome
      financialInfo.homeOwnership = homeOwnership || financialInfo.homeOwnership
      financialInfo.pastLoans = pastLoans || financialInfo.pastLoans
      financialInfo.creditScore = creditScore !== undefined ? creditScore : financialInfo.creditScore
      financialInfo.activeBankAccounts =
        activeBankAccounts !== undefined ? activeBankAccounts : financialInfo.activeBankAccounts
      financialInfo.completedQuestionnaire =
        completedQuestionnaire !== undefined ? completedQuestionnaire : financialInfo.completedQuestionnaire
      financialInfo.updatedAt = new Date()
    } else {
      // Create new record
      financialInfo = new FinancialInfo({
        userId: req.params.uid,
        age,
        occupation,
        yearsInOccupation,
        annualIncome,
        homeOwnership,
        pastLoans,
        creditScore,
        activeBankAccounts,
        completedQuestionnaire: completedQuestionnaire || false,
        updatedAt: new Date(),
      })
    }

    await financialInfo.save()
    res.status(201).json(financialInfo)
  } catch (error) {
    console.error("Error saving financial info:", error)
    res.status(500).json({ error: "Failed to save financial information" })
  }
})

// Chat routes
app.post("/api/chat", async (req, res) => {
  try {
    console.log("Processing chat message:", req.body)
    const { userId, message, language, fileUrl } = req.body

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    // Find the most recent chat or create a new one
    let chat = await Chat.findOne({ userId }).sort({ updatedAt: -1 })

    if (!chat || chat.messages.length > 50) {
      console.log("Creating new chat for user:", userId)
      // Create a new chat if none exists or if the current one is too long
      chat = new Chat({
        userId,
        language: language || "en",
        messages: [],
      })
    }

    // Store original message
    const originalMessage = message
    let translatedMessage = message

    // Translate user message to English if not already in English
    if (language && language !== "en") {
      try {
        console.log(`Translating user message from ${language} to English`)
        const translationResult = await translateText(message, language, "en")
        if (translationResult.translatedText) {
          translatedMessage = translationResult.translatedText
          console.log("Translated user message:", translatedMessage)
        } else {
          console.warn("Translation failed, using original message")
        }
      } catch (error) {
        console.error("Error translating user message:", error)
        // Continue with original message if translation fails
      }
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: message, // Store the message in the user's language
      originalText: originalMessage, // Store the original message
      sender: "user",
      timestamp: new Date(),
      hasFile: !!fileUrl,
      fileUrl,
    }

    chat.messages.push(userMessage)
    chat.updatedAt = new Date()

    // Get user's financial information to include in the prompt
    let financialInfo = null
    try {
      financialInfo = await FinancialInfo.findOne({ userId })
    } catch (error) {
      console.error("Error fetching financial info for prompt:", error)
      // Continue without financial info if there's an error
    }

    // Process the message with Llama 3 via Together.ai
    let aiResponse
    let translationFailed = false

    try {
      console.log("Calling Together.ai Llama 3 API")

      // Create system prompt that focuses on loan advising with user's financial info
      let systemPrompt = `You are a specialized loan advising assistant. Your expertise is ONLY in loans, financial advice, loan eligibility, interest rates, loan types, and other loan-related topics. 

CRITICAL INSTRUCTION: KEEP ALL RESPONSES UNDER 500 CHARACTERS TOTAL. This is a hard requirement due to technical limitations.

If asked about anything not related to loans or financial advice, politely explain that you can only assist with loan-related inquiries.

INTENT DETECTION (VERY IMPORTANT):
You must first identify which of these three intents the user is expressing:
1. LOAN ELIGIBILITY CHECK: User wants to know if they qualify for a loan
2. LOAN APPLICATION GUIDANCE: User needs help with the loan application process
3. FINANCIAL LITERACY: User wants financial advice or education

FORMATTING INSTRUCTIONS (VERY IMPORTANT):
1. For numbered lists, use "1. ", "2. ", "3. " format (number, period, space)
2. For bullet points, use "- " format (dash, space)
3. For subheadings, end the line with a colon ":"
4. Use **bold** for important terms
5. NEVER use paragraphs for lists - always use proper numbered format
6. Keep each point short and clear
7. ALWAYS use the same formatting regardless of language

RESPONSE STRUCTURE BY INTENT:
For LOAN ELIGIBILITY CHECK:
1. Start with a brief acknowledgment
2. List 3-4 key eligibility factors as a numbered list
3. End with a personalized recommendation

For LOAN APPLICATION GUIDANCE:
1. Start with a brief acknowledgment
2. List the application steps as a numbered list
3. End with a key document reminder

For FINANCIAL LITERACY:
1. Start with a brief acknowledgment
2. Provide 2-3 financial tips as a numbered list
3. End with an encouraging note

For any non-loan topics, respond with: "I'm a loan advising AI assistant. I can only provide information about loans and financial advice."

REMEMBER: NEVER exceed 500 characters in your responses.`

      // Add user's financial information to the system prompt if available
      if (financialInfo && financialInfo.completedQuestionnaire) {
        systemPrompt += `\n\nUser's Financial Information:
- Age: ${financialInfo.age || "Not provided"}
- Occupation: ${financialInfo.occupation || "Not provided"}
- Years in current occupation: ${financialInfo.yearsInOccupation || "Not provided"}
- Annual income: ${financialInfo.annualIncome ? `₹${financialInfo.annualIncome.toLocaleString()}` : "Not provided"}
- Home ownership: ${financialInfo.homeOwnership || "Not provided"}
- Past loans: ${financialInfo.pastLoans || "Not provided"}
- Credit score: ${financialInfo.creditScore || "Not provided"}
- Number of active bank accounts: ${financialInfo.activeBankAccounts || "Not provided"}

Use this information to provide personalized advice and eligibility assessments. When the user asks about loan eligibility or financial advice, refer to this information to give tailored responses.`
      }

      // Get previous messages to maintain context (up to 10 most recent messages)
      const previousMessages = chat.messages.slice(-10, -1).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.sender === "user" ? msg.originalText || msg.text : msg.originalText || msg.text,
      }))

      // Get response from Llama 3
      const messages = [
        { role: "system", content: systemPrompt },
        ...previousMessages,
        { role: "user", content: translatedMessage },
      ]

      console.log("Sending messages to Llama:", messages.length, "messages")

      // Update the Together.ai API call to limit the max tokens
      // Find the API call to Together.ai in the /api/chat endpoint

      const response = await axios.post(
        "https://api.together.xyz/v1/chat/completions",
        {
          model: "meta-llama/Llama-3-8b-chat-hf", // Using Llama 3 8B model
          messages: messages,
          temperature: 0.7,
          max_tokens: 200, // Increased slightly to allow for better formatting
          top_p: 0.9, // Added for better quality responses
          frequency_penalty: 0.2, // Added to reduce repetition
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
        },
      )

      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0 &&
        response.data.choices[0].message
      ) {
        console.log("Together.ai response received")
        aiResponse = response.data.choices[0].message.content
      } else {
        throw new Error("Invalid response from Together.ai API")
      }
    } catch (error) {
      console.error("Error calling Together.ai API:", error)

      // Use fallback response
      console.log("Using fallback response due to API error")
      aiResponse =
        "I'm a loan advising AI assistant. I can help you with loan-related questions. However, I'm currently experiencing some technical difficulties. Please try again later or ask a different loan-related question."
    }

    // Add a post-processing step after receiving the response from Together.ai
    // Find where aiResponse is assigned from the API response and add this code after it:
    aiResponse = enforceCharacterLimit(aiResponse, 500)

    // Store original English response
    const originalAiResponse = aiResponse

    // Translate AI response if language is not English
    if (language && language !== "en") {
      try {
        console.log(`Translating AI response from English to ${language}`)
        console.log("Original AI response:", aiResponse)

        const translationResult = await translateText(aiResponse, "en", language)

        if (translationResult && translationResult.translatedText) {
          aiResponse = translationResult.translatedText
          console.log("Translated AI response:", aiResponse)
        } else {
          console.error("Translation result is missing translatedText property")
          translationFailed = true
          // Continue with English response
        }

        // Check if there was a translation error
        if (translationResult.error) {
          console.warn("Translation completed with errors:", translationResult.error)
          translationFailed = true
        }
      } catch (error) {
        console.error("Error translating AI response:", error)
        translationFailed = true
        // Continue with English response
      }
    }

    // Add AI response to chat
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse, // Store the translated response (or original if translation failed)
      originalText: originalAiResponse, // Store the original English response
      sender: "bot",
      timestamp: new Date(),
    }

    chat.messages.push(botMessage)
    await chat.save()

    res.json({
      reply: aiResponse,
      originalReply: originalAiResponse,
      translationFailed: translationFailed,
    })
  } catch (error) {
    console.error("Error processing chat:", error)
    res.status(500).json({ error: "Failed to process chat" })
  }
})

app.get("/api/chats/:userId", async (req, res) => {
  try {
    console.log("Fetching chats for user:", req.params.userId)
    const chats = await Chat.find({ userId: req.params.userId }).sort({ updatedAt: -1 })
    res.json({ chats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    res.status(500).json({ error: "Failed to fetch chats" })
  }
})

// Add this new endpoint for saving call transcripts
app.post("/api/chat/save-transcript", async (req, res) => {
  try {
    console.log("Saving call transcript:", req.body)
    const { userId, messages, language } = req.body

    if (!userId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request data" })
    }

    // Create a new chat with the transcript
    const chat = new Chat({
      userId,
      language: language || "en",
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await chat.save()
    res.status(201).json({ success: true, chatId: chat._id })
  } catch (error) {
    console.error("Error saving call transcript:", error)
    res.status(500).json({ error: "Failed to save call transcript" })
  }
})

// Call routes
app.post("/api/calls", async (req, res) => {
  try {
    console.log("Saving call data:", req.body)
    const { userId, duration, timestamp, language } = req.body

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    const call = new Call({
      userId,
      duration,
      timestamp: timestamp || new Date(),
      language: language || "en",
    })

    await call.save()
    res.status(201).json(call)
  } catch (error) {
    console.error("Error saving call data:", error)
    res.status(500).json({ error: "Failed to save call data" })
  }
})

app.get("/api/calls/:userId", async (req, res) => {
  try {
    console.log("Fetching calls for user:", req.params.userId)
    const calls = await Call.find({ userId: req.params.userId }).sort({ timestamp: -1 })
    res.json({ calls })
  } catch (error) {
    console.error("Error fetching calls:", error)
    res.status(500).json({ error: "Failed to fetch calls" })
  }
})

// File upload route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Processing file upload")
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    console.log("File uploaded:", fileUrl)

    // If the file is a document, parse it using Sarvam API
    let fileContent = ""
    if (req.file.mimetype.includes("pdf") || req.file.mimetype.includes("word") || req.file.mimetype.includes("text")) {
      try {
        if (isSarvamApiKeyValid()) {
          console.log("Parsing document with Sarvam API")
          const formData = new FormData()
          formData.append("file", fs.createReadStream(req.file.path))

          const parseResponse = await axios.post("https://api.sarvam.ai/v1/file-parser", formData, {
            headers: {
              Authorization: `Bearer ${process.env.SARVAM_API_KEY}`,
              "Content-Type": "multipart/form-data",
            },
          })

          if (parseResponse.data && parseResponse.data.text) {
            console.log("Document parsed successfully")
            fileContent = parseResponse.data.text
          }
        } else {
          console.log("Skipping document parsing - no valid Sarvam API key")
        }
      } catch (error) {
        console.error("Error parsing file:", error)
        // Continue without parsed content if parsing fails
      }
    }

    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileContent,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    res.status(500).json({ error: "Failed to upload file" })
  }
})

// Replace the speech-to-text route with this improved version
app.post("/api/speech-to-text", upload.single("file"), async (req, res) => {
  try {
    console.log("Processing speech-to-text request")
    const language = req.body.language || "en-IN"

    if (!req.file) {
      console.log("No audio file provided")
      return res.status(400).json({ error: "No audio file provided" })
    }

    console.log("Audio file received:", req.file.mimetype, req.file.size, "bytes")

    if (isSarvamApiKeyValid()) {
      try {
        // Create form data for Sarvam API
        const formData = new FormData()
        formData.append("file", fs.createReadStream(req.file.path))
        formData.append("language_code", language)

        console.log(`Calling Sarvam speech-to-text API with language ${language}`)

        // Call Sarvam API with increased timeout
        const sttResponse = await axios.post("https://api.sarvam.ai/speech-to-text", formData, {
          headers: {
            "api-subscription-key": process.env.SARVAM_API_KEY,
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 second timeout
        })

        console.log("Sarvam API response:", sttResponse.data)

        // Check for transcript field (Sarvam API returns transcript, not text)
        if (sttResponse.data && sttResponse.data.transcript) {
          console.log("Speech-to-text successful:", sttResponse.data.transcript)
          return res.json({
            text: sttResponse.data.transcript, // Map transcript to text for frontend
            language: sttResponse.data.language_code || language,
          })
        } else if (sttResponse.data && sttResponse.data.text) {
          // Fallback for older API versions that might use text field
          console.log("Speech-to-text successful (text field):", sttResponse.data.text)
          return res.json({
            text: sttResponse.data.text,
            language: sttResponse.data.language || language,
          })
        } else {
          console.error("Invalid speech-to-text response:", sttResponse.data)
          return res.status(500).json({ error: "Failed to convert speech to text" })
        }
      } catch (error) {
        console.error("Error calling speech-to-text API:", error)
        if (error.response) {
          console.error("API response status:", error.response.status)
          console.error("API response data:", error.response.data)
        }
        return res.status(500).json({ error: "Failed to convert speech to text" })
      } finally {
        // Clean up the temporary file
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error("Error deleting file:", err)
            } else {
              console.log("File deleted successfully")
            }
          })
        }
      }
    } else {
      console.log("No valid Sarvam API key")
      return res.status(500).json({ error: "No valid Sarvam API key" })
    }
  } catch (error) {
    console.error("Error processing speech-to-text:", error)
    return res.status(500).json({ error: "Failed to process speech to text" })
  }
})

// Add this new endpoint for text-to-speech
// Update the text-to-speech endpoint to better handle different languages
app.post("/api/text-to-speech", async (req, res) => {
  try {
    console.log("Processing text-to-speech request:", req.body)
    const { text, language = "en" } = req.body

    if (!text) {
      return res.status(400).json({ error: "Text is required" })
    }

    if (!isSarvamApiKeyValid()) {
      console.log("No valid Sarvam API key for text-to-speech")
      return res.status(500).json({ error: "No valid Sarvam API key" })
    }

    // Check if text exceeds the 500 character limit
    if (text.length > 500) {
      console.log(`Text exceeds 500 character limit (${text.length} chars)`)
      // Return a specific error for the frontend to handle
      return res.status(400).json({
        error: "Text exceeds 500 character limit",
        characterCount: text.length,
        message: "The text is too long for speech synthesis. Please try a shorter message.",
      })
    }

    // Map language code to Sarvam language code
    const languageCode = mapToSarvamLanguageCode(language)

    // Determine appropriate speaker and model based on language
    // You can customize this mapping based on available voices
    const speakerMapping = {
      "en-IN": "meera",
      "hi-IN": "meera",
      "bn-IN": "meera",
      "gu-IN": "meera",
      "kn-IN": "meera",
      "ml-IN": "meera",
      "mr-IN": "meera",
      "od-IN": "meera",
      "pa-IN": "meera",
      "ta-IN": "meera",
      "te-IN": "meera",
    }

    // Use appropriate model based on language
    // bulbul:v1 is for Indian languages
    const modelMapping = {
      "en-IN": "bulbul:v1",
      "hi-IN": "bulbul:v1",
      "bn-IN": "bulbul:v1",
      "gu-IN": "bulbul:v1",
      "kn-IN": "bulbul:v1",
      "ml-IN": "bulbul:v1",
      "mr-IN": "bulbul:v1",
      "od-IN": "bulbul:v1",
      "pa-IN": "bulbul:v1",
      "ta-IN": "bulbul:v1",
      "te-IN": "bulbul:v1",
    }

    const speaker = speakerMapping[languageCode] || "meera"
    const model = modelMapping[languageCode] || "bulbul:v1"

    console.log(
      `Calling Sarvam text-to-speech API with language ${languageCode}, speaker ${speaker}, and model ${model}`,
    )

    // Call Sarvam API
    const ttsResponse = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        speaker: speaker,
        loudness: 1,
        speech_sample_rate: 22050,
        enable_preprocessing: false,
        override_triplets: {},
        target_language_code: languageCode,
        pace: 1,
        model: model,
        inputs: [text],
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      },
    )

    console.log("Sarvam TTS response received:", ttsResponse.data.request_id)

    if (ttsResponse.data && ttsResponse.data.audios && ttsResponse.data.audios.length > 0) {
      // Get the base64 audio data
      const audioBase64 = ttsResponse.data.audios[0]

      // Create a unique filename
      const filename = `${Date.now()}-speech.wav`
      const filePath = path.join(__dirname, "uploads", filename)

      // Create uploads directory if it doesn't exist
      const dir = path.join(__dirname, "uploads")
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Convert base64 to buffer and save to file
      const audioBuffer = Buffer.from(audioBase64, "base64")
      fs.writeFileSync(filePath, audioBuffer)

      // Return the URL to the audio file
      const audioUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`
      console.log("Audio file created:", audioUrl)

      return res.json({ audioUrl })
    } else {
      console.error("Invalid text-to-speech response:", ttsResponse.data)
      return res.status(500).json({ error: "Failed to convert text to speech" })
    }
  } catch (error) {
    console.error("Error processing text-to-speech:", error)
    if (error.response) {
      console.error("API response status:", error.response.status)
      console.error("API response data:", error.response.data)

      // Check if the error is specifically about character limit
      if (error.response.status === 400 && error.response.data?.error?.message?.includes("characters")) {
        return res.status(400).json({
          error: "Text exceeds character limit",
          message: "The text is too long for speech synthesis. Please try a shorter message.",
        })
      }
    }
    return res.status(500).json({ error: "Failed to process text to speech" })
  }
})

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Replace the existing loan-data, loan-recommendations, and loan-eligibility routes with these improved versions
// that use the loanDataService module

app.get("/api/loan-data", async (req, res) => {
  try {
    console.log("Fetching loan dataset")

    const loanData = await loanDataService.fetchLoanData()

    // Select random 100 records if there are more than 100
    let sampleData = loanData
    if (loanData.length > 100) {
      sampleData = loanDataService.getRandomSample(loanData, 100)
      console.log("Selected 100 random records for analysis")
    }

    res.json({ data: sampleData })
  } catch (error) {
    console.error("Error processing loan data:", error)
    res.status(500).json({ error: "Failed to process loan data" })
  }
})

app.post("/api/loan-recommendations", async (req, res) => {
  try {
    console.log("Processing loan recommendations request:", req.body)
    const { loanAmount, loanType } = req.body

    if (!loanAmount || !loanType) {
      return res.status(400).json({ error: "Loan amount and type are required" })
    }

    const recommendations = await loanDataService.getBankRecommendations(Number.parseFloat(loanAmount), loanType)

    res.json({ recommendations })
  } catch (error) {
    console.error("Error processing loan recommendations:", error)
    res.status(500).json({ error: "Failed to process loan recommendations" })
  }
})

app.post("/api/loan-eligibility", async (req, res) => {
  try {
    console.log("Processing loan eligibility request:", req.body)
    const { loanAmount, loanType, creditScore, annualIncome, yearsInOccupation } = req.body

    if (!loanAmount || !loanType) {
      return res.status(400).json({ error: "Loan amount and type are required" })
    }

    const eligibilityResult = await loanDataService.checkLoanEligibility({
      loanAmount: Number.parseFloat(loanAmount),
      loanType,
      creditScore: creditScore ? Number.parseFloat(creditScore) : null,
      annualIncome: annualIncome ? Number.parseFloat(annualIncome) : null,
      yearsInOccupation: yearsInOccupation ? Number.parseFloat(yearsInOccupation) : null,
    })

    res.json(eligibilityResult)
  } catch (error) {
    console.error("Error processing loan eligibility:", error)
    res.status(500).json({ error: "Failed to process loan eligibility" })
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

