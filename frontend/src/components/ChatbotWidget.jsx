"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Zoom,
  Fade,
  Divider,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  DialogActions,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Menu as MenuIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Call as CallIcon,
  VolumeUp as VolumeUpIcon,
  AttachFile as AttachFileIcon,
  VolumeDown as VolumeDownIcon,
  Translate as TranslateIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import CallInterface from "./CallInterface"
// Add this import at the top with the other imports
import * as loanService from "../services/loanService"

// Language options
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "or", name: "Odia" },
  { code: "pa", name: "Punjabi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
]

// Define the questionnaire
const questionnaire = [
  {
    id: "age",
    question: "What is your age?",
    type: "number",
    placeholder: "Enter your age",
    validation: (value) => value >= 18 && value <= 100,
    errorMessage: "Please enter a valid age between 18 and 100",
  },
  {
    id: "occupation",
    question: "What is your occupation?",
    type: "text",
    placeholder: "Enter your occupation",
    validation: (value) => value.trim().length > 0,
    errorMessage: "Please enter your occupation",
  },
  {
    id: "yearsInOccupation",
    question: "How many years have you been working in your current occupation?",
    type: "number",
    placeholder: "Enter number of years",
    validation: (value) => value >= 0 && value <= 60,
    errorMessage: "Please enter a valid number between 0 and 60",
  },
  {
    id: "annualIncome",
    question: "What is your annual income (in INR)?",
    type: "number",
    placeholder: "Enter your annual income",
    validation: (value) => value >= 0,
    errorMessage: "Please enter a valid income amount",
  },
  {
    id: "homeOwnership",
    question: "What is your home ownership status?",
    type: "radio",
    options: [
      { value: "Own", label: "Own" },
      { value: "Rent", label: "Rent" },
      { value: "Other", label: "Other" },
    ],
    validation: (value) => ["Own", "Rent", "Other"].includes(value),
    errorMessage: "Please select your home ownership status",
  },
  {
    id: "pastLoans",
    question: "Do you have any past or current loans?",
    type: "text",
    placeholder: "Describe your loan history briefly",
    validation: (value) => value.trim().length > 0,
    errorMessage: "Please provide information about your loan history",
  },
  {
    id: "creditScore",
    question: "What is your credit score?",
    type: "number",
    placeholder: "Enter your credit score (300-900)",
    validation: (value) => value >= 300 && value <= 900,
    errorMessage: "Please enter a valid credit score between 300 and 900",
  },
  {
    id: "activeBankAccounts",
    question: "How many active bank accounts do you have?",
    type: "number",
    placeholder: "Enter number of accounts",
    validation: (value) => value >= 0 && value <= 20,
    errorMessage: "Please enter a valid number between 0 and 20",
  },
]

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [language, setLanguage] = useState("en") // Default to English
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" })
  const [selectedFile, setSelectedFile] = useState(null)
  const [playingMessageId, setPlayingMessageId] = useState(null)
  const [processingAudio, setProcessingAudio] = useState(false)
  const [loanGuidanceDialogOpen, setLoanGuidanceDialogOpen] = useState(false)
  const [loanEligibilityDialogOpen, setLoanEligibilityDialogOpen] = useState(false)
  const [loanGuidanceData, setLoanGuidanceData] = useState({
    loanAmount: "",
    loanType: "Home Loan",
  })
  const [loanEligibilityData, setLoanEligibilityData] = useState({
    loanAmount: "",
    loanType: "Home Loan",
    creditScore: "",
    annualIncome: "",
    yearsInOccupation: "",
  })
  const [loanRecommendations, setLoanRecommendations] = useState([])
  const [eligibilityResult, setEligibilityResult] = useState(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  // Questionnaire state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaireStep, setQuestionnaireStep] = useState(0)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({})
  const [questionnaireError, setQuestionnaireError] = useState("")
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [completedQuestionnaire, setCompletedQuestionnaire] = useState(false)
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false)
  const [translatedQuestions, setTranslatedQuestions] = useState([])

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const theme = useTheme()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [chatHistory, setChatHistory] = useState([])

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now().toString(),
      text: "Hello! I'm your financial assistant specialized in loan advising. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  useEffect(() => {
    // Check if user is logged in and if it's their first time
    if (currentUser) {
      // Check if user has a preferred language stored
      const fetchUserPreferences = async () => {
        try {
          console.log("Fetching user preferences for:", currentUser.uid)
          const response = await axios.get(`/api/users/${currentUser.uid}/preferences`)
          console.log("User preferences response:", response.data)

          if (response.data && response.data.language) {
            setLanguage(response.data.language)
          } else {
            setLanguageDialogOpen(true)
          }

          // Check if user has completed the questionnaire
          checkQuestionnaireStatus()
        } catch (error) {
          console.error("Error fetching user preferences:", error)
          setLanguageDialogOpen(true)
        }
      }

      fetchUserPreferences()
    } else if (!language) {
      // If no language is set, show language dialog
      setLanguageDialogOpen(true)
    }
  }, [currentUser])

  useEffect(() => {
    if (open && currentUser) {
      fetchChatHistory()
      checkQuestionnaireStatus()
    }
  }, [open, currentUser])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Initialize audio context for recording
  useEffect(() => {
    return () => {
      // Clean up media recorder on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }

      // Clean up audio playback
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  // Translate questionnaire when language changes
  useEffect(() => {
    if (showQuestionnaire && language !== "en") {
      translateQuestionnaire()
    } else if (language === "en") {
      // Use original questions for English
      setTranslatedQuestions(questionnaire.map((q) => ({ ...q, translatedQuestion: q.question })))
    }
  }, [language, showQuestionnaire])

  const translateQuestionnaire = async () => {
    if (language === "en") return

    setLoadingQuestionnaire(true)
    try {
      const translatedQs = await Promise.all(
        questionnaire.map(async (q) => {
          try {
            const response = await axios.post("/api/translate", {
              text: q.question,
              source_language: "en",
              target_language: language,
            })

            return {
              ...q,
              translatedQuestion: response.data?.translated_text || q.question,
            }
          } catch (error) {
            console.error(`Error translating question: ${q.id}`, error)
            return { ...q, translatedQuestion: q.question }
          }
        }),
      )

      setTranslatedQuestions(translatedQs)
    } catch (error) {
      console.error("Error translating questionnaire:", error)
      // Fallback to original questions
      setTranslatedQuestions(questionnaire.map((q) => ({ ...q, translatedQuestion: q.question })))
    } finally {
      setLoadingQuestionnaire(false)
    }
  }

  const checkQuestionnaireStatus = async () => {
    if (!currentUser) return

    try {
      const response = await axios.get(`/api/users/${currentUser.uid}/financial-info`)
      console.log("Financial info response:", response.data)

      if (response.data && response.data.completedQuestionnaire) {
        setCompletedQuestionnaire(true)
        setQuestionnaireAnswers({
          age: response.data.age,
          occupation: response.data.occupation,
          yearsInOccupation: response.data.yearsInOccupation,
          annualIncome: response.data.annualIncome,
          homeOwnership: response.data.homeOwnership,
          pastLoans: response.data.pastLoans,
          creditScore: response.data.creditScore,
          activeBankAccounts: response.data.activeBankAccounts,
        })
      } else {
        setCompletedQuestionnaire(false)
        setShowQuestionnaire(true)
      }
    } catch (error) {
      console.error("Error checking questionnaire status:", error)
      // Assume questionnaire not completed if there's an error
      setCompletedQuestionnaire(false)
      setShowQuestionnaire(true)
    }
  }

  const handleQuestionnaireNext = () => {
    const currentQuestion = questionnaire[questionnaireStep]

    // Validate current answer
    if (!currentQuestion.validation(currentAnswer)) {
      setQuestionnaireError(currentQuestion.errorMessage)
      return
    }

    // Save answer
    setQuestionnaireAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: currentAnswer,
    }))

    setQuestionnaireError("")

    // Move to next question or finish
    if (questionnaireStep < questionnaire.length - 1) {
      setQuestionnaireStep((prev) => prev + 1)
      // Set current answer to the existing answer for the next question or empty
      const nextQuestionId = questionnaire[questionnaireStep + 1].id
      setCurrentAnswer(questionnaireAnswers[nextQuestionId] || "")
    } else {
      // Save all answers to database
      saveQuestionnaireAnswers()
    }
  }

  const handleQuestionnaireBack = () => {
    if (questionnaireStep > 0) {
      setQuestionnaireStep((prev) => prev - 1)
      // Set current answer to the existing answer for the previous question
      const prevQuestionId = questionnaire[questionnaireStep - 1].id
      setCurrentAnswer(questionnaireAnswers[prevQuestionId] || "")
    }
  }

  const saveQuestionnaireAnswers = async () => {
    if (!currentUser) return

    setLoadingQuestionnaire(true)
    try {
      const response = await axios.post(`/api/users/${currentUser.uid}/financial-info`, {
        ...questionnaireAnswers,
        completedQuestionnaire: true,
      })

      console.log("Saved questionnaire answers:", response.data)
      setCompletedQuestionnaire(true)
      setShowQuestionnaire(false)

      // Add a system message to acknowledge the completed questionnaire
      const systemMessage = {
        id: Date.now().toString(),
        text: "Thank you for completing the questionnaire. I'll use this information to provide you with personalized loan advice. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, systemMessage])
      showNotification("Questionnaire completed successfully", "success")
    } catch (error) {
      console.error("Error saving questionnaire answers:", error)
      showNotification("Failed to save your information. Please try again.", "error")
    } finally {
      setLoadingQuestionnaire(false)
    }
  }

  const skipQuestionnaire = () => {
    showNotification("You can complete the questionnaire later in your profile", "info")
    setShowQuestionnaire(false)
  }

  // Update the fetchChatHistory function to ensure messages are displayed in the user's preferred language
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

  const fetchChatHistory = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      console.log("Fetching chat history for:", currentUser.uid)
      const response = await axios.get(`/api/chats/${currentUser.uid}`)
      console.log("Chat history response:", response.data)

      if (response.data.chats && response.data.chats.length > 0) {
        // Get the most recent chat
        const recentChat = response.data.chats[0]
        if (recentChat.messages && recentChat.messages.length > 0) {
          // Check if the chat language matches the current selected language
          if (recentChat.language !== language && language !== "en") {
            // Need to translate messages to the current language
            const translatedMessages = await Promise.all(
              recentChat.messages.map(async (message) => {
                // Only translate bot messages, keep user messages as is
                if (message.sender === "bot" && message.originalText) {
                  try {
                    const translationResponse = await axios.post("/api/translate", {
                      text: message.originalText,
                      source_language: "en",
                      target_language: language,
                    })

                    if (translationResponse.data && translationResponse.data.translated_text) {
                      return {
                        ...message,
                        text: translationResponse.data.translated_text,
                      }
                    }
                  } catch (error) {
                    console.error("Error translating message:", error)
                  }
                }
                return message
              }),
            )

            setMessages(translatedMessages)
          } else {
            // Language matches or is English, use messages as is
            setMessages(recentChat.messages)
          }

          setChatHistory(response.data.chats)
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error)
      showNotification("Failed to load chat history", "error")
    } finally {
      setLoading(false)
    }
  }

  // Update the handleSendMessage function to ensure proper translation
  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
      hasFile: !!selectedFile,
      fileName: selectedFile?.name,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Check for loan guidance intent
      if (
        input.toLowerCase().includes("loan guidance") ||
        input.toLowerCase().includes("bank recommendation") ||
        input.toLowerCase().includes("which bank") ||
        input.toLowerCase().includes("best bank") ||
        input.toLowerCase().includes("apply for loan")
      ) {
        setLoanGuidanceDialogOpen(true)
      }

      // Check for loan eligibility intent
      if (
        input.toLowerCase().includes("loan eligibility") ||
        input.toLowerCase().includes("eligible for loan") ||
        input.toLowerCase().includes("qualify for loan") ||
        input.toLowerCase().includes("can i get loan") ||
        input.toLowerCase().includes("will i get loan")
      ) {
        setLoanEligibilityDialogOpen(true)
      }

      // If there's a file, upload it first
      let fileUrl = null
      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("userId", currentUser?.uid || "anonymous")

        console.log("Uploading file:", selectedFile.name)
        const fileResponse = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        console.log("File upload response:", fileResponse.data)
        fileUrl = fileResponse.data.fileUrl
        setSelectedFile(null)
      }

      // Send message to backend
      console.log("Sending chat message:", {
        userId: currentUser?.uid || "anonymous",
        message: input.trim(),
        language,
        fileUrl,
      })

      const response = await axios.post("/api/chat", {
        userId: currentUser?.uid || "anonymous",
        message: input.trim(),
        language,
        fileUrl,
      })

      console.log("Chat response:", response.data)

      // Check if translation failed
      if (response.data.translationFailed) {
        showNotification("Translation failed. Showing response in English.", "warning")
      }

      // Display the translated response in the user's preferred language
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply || response.data.originalReply, // Use translated text or fall back to English
        originalText: response.data.originalReply, // Store original English response (hidden from user)
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      // Add a fallback bot message if the API call fails
      let errorMessage = "I'm sorry, I'm having trouble connecting to the server. Please try again later."

      // Translate the error message if possible
      if (language !== "en") {
        try {
          const translationResponse = await axios.post("/api/translate", {
            text: errorMessage,
            source_language: "en",
            target_language: language,
          })

          if (translationResponse.data && translationResponse.data.translated_text) {
            errorMessage = translationResponse.data.translated_text
          }
        } catch (translationError) {
          console.error("Error translating error message:", translationError)
          // Continue with English error message if translation fails
        }
      }

      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fallbackMessage])
      showNotification("Failed to send message", "error")
    } finally {
      setLoading(false)
    }
  }

  // Replace the handleVoiceInput function with this Vosk implementation
  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      return
    }

    try {
      setIsRecording(true)
      showNotification(
        `Recording started. Please speak in ${languages.find((l) => l.code === language)?.name || "English"}...`,
        "info",
      )

      // Reset audio chunks
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create media recorder
      const options = { mimeType: "audio/webm" }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())

        if (audioChunksRef.current.length === 0) {
          setIsRecording(false)
          showNotification("No audio recorded. Please try again.", "warning")
          return
        }

        try {
          showNotification("Processing audio...", "info")
          setProcessingAudio(true)

          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

          // Send to Sarvam API
          const formData = new FormData()
          formData.append("file", audioBlob, "recording.wav")
          formData.append("language", mapToSarvamLanguageCode(language))

          // Send to backend proxy endpoint
          const response = await axios.post("/api/speech-to-text", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })

          if (response.data && response.data.text) {
            setInput(response.data.text)
            showNotification("Speech recognition completed successfully!", "success")
          } else {
            showNotification("Could not transcribe audio. Please try again.", "error")
          }
        } catch (error) {
          console.error("Error processing audio:", error)
          showNotification(`Error: ${error.message}. Please try again.`, "error")
        } finally {
          setIsRecording(false)
          setProcessingAudio(false)
        }
      }

      // Start recording
      mediaRecorder.start()

      // Set a timeout to stop recording after 15 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop()
        }
      }, 15000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
      showNotification(`Could not access microphone: ${error.message}`, "error")
    }
  }

  // Text-to-speech implementation with better error handling
  const handleTextToSpeech = async (text, messageId) => {
    if (!text || playingMessageId) return

    try {
      showNotification("Converting text to speech...", "info")
      setPlayingMessageId(messageId) // Set the ID of the message being played

      const response = await axios.post("/api/text-to-speech", {
        text: text,
        language: language,
      })

      if (response.data && response.data.audioUrl) {
        // Play the audio
        if (audioRef.current) {
          audioRef.current.src = response.data.audioUrl

          // Add error handling for audio loading
          audioRef.current.onerror = (e) => {
            console.error("Error loading audio:", e)
            setPlayingMessageId(null)
            showNotification("Error playing audio response", "error")
          }

          audioRef.current.oncanplaythrough = () => {
            audioRef.current.play().catch((err) => {
              console.error("Error playing audio:", err)
              setPlayingMessageId(null)
              showNotification("Error playing audio: " + err.message, "error")
            })
            showNotification("Playing audio response", "success")
          }

          audioRef.current.onended = () => {
            setPlayingMessageId(null)
            console.log("Audio playback completed")
          }
        }
      } else if (response.data && response.data.error) {
        // Handle specific error from backend
        throw new Error(response.data.error)
      } else {
        throw new Error("No audio URL returned from text-to-speech API")
      }
    } catch (error) {
      console.error("Error converting text to speech:", error)

      // Check if the error is specifically about character limit
      if (
        error.response &&
        error.response.status === 400 &&
        (error.response.data?.error?.includes("character limit") || error.response.data?.message?.includes("too long"))
      ) {
        showNotification(
          "This message is too long for voice playback (max 500 characters). Try shorter messages for voice.",
          "warning",
        )
      } else {
        showNotification("Unable to play audio response: " + (error.message || "Unknown error"), "warning")
      }

      setPlayingMessageId(null)
    }
  }

  // Stop audio playback
  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayingMessageId(null)
    }
  }

  // Update the handleLanguageSelect function to ensure proper translation of welcome message
  const handleLanguageSelect = async (langCode) => {
    const previousLanguage = language
    setLanguage(langCode)
    setLanguageDialogOpen(false)

    // Save user preference
    if (currentUser) {
      try {
        console.log("Saving language preference:", langCode)
        await axios.post(`/api/users/${currentUser.uid}/preferences`, {
          language: langCode,
        })
      } catch (error) {
        console.error("Error saving language preference:", error)
      }
    }

    const langName = languages.find((l) => l.code === langCode)?.name || "English"

    // Only add a system message if the language actually changed
    if (previousLanguage !== langCode) {
      // Create welcome message based on selected language
      let welcomeMessage = `Language changed to ${langName}. How can I help you today?`

      // If language is not English, translate the welcome message
      if (langCode !== "en") {
        try {
          const translationResponse = await axios.post("/api/translate", {
            text: welcomeMessage,
            source_language: "en",
            target_language: langCode,
          })

          if (translationResponse.data && translationResponse.data.translated_text) {
            welcomeMessage = translationResponse.data.translated_text
          }
        } catch (error) {
          console.error("Error translating welcome message:", error)
          // Continue with English message if translation fails
        }
      }

      const systemMessage = {
        id: Date.now().toString(),
        text: welcomeMessage,
        originalText: `Language changed to ${langName}. How can I help you today?`, // Store original English text (hidden from user)
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, systemMessage])

      // Show notification about language change
      showNotification(`Language changed to ${langName}`, "success")

      // Translate questionnaire if it's open
      if (showQuestionnaire) {
        translateQuestionnaire()
      }
    }
  }

  // Add this function to handle starting a call
  const handleStartCall = () => {
    setInCall(true)
  }

  // Handle ending a call
  const handleEndCall = async (callDuration, callTranscript) => {
    setInCall(false)

    // Ensure all audio tracks are stopped
    if (window.activeTracks && window.activeTracks.length > 0) {
      window.activeTracks.forEach((track) => track.stop())
      window.activeTracks = []
    }

    // Format duration for display
    const minutes = Math.floor(callDuration / 60)
    const seconds = callDuration % 60
    const formattedDuration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

    // Add call summary to messages
    const callSummary = {
      id: Date.now().toString(),
      text: `Call ended. Duration: ${formattedDuration}`,
      sender: "system",
      timestamp: new Date(),
      isCallSummary: true,
    }

    // Add call transcript to regular chat messages
    setMessages((prev) => [...prev, callSummary, ...callTranscript])

    showNotification("Call ended", "info")
  }

  // Save call transcript to database
  const handleSaveTranscript = async (transcript, duration) => {
    if (currentUser && transcript.length > 0) {
      try {
        console.log("Saving call data:", {
          userId: currentUser.uid,
          duration: duration,
          language,
        })

        await axios.post("/api/calls", {
          userId: currentUser.uid,
          duration: duration,
          language,
          timestamp: new Date(),
        })
      } catch (error) {
        console.error("Error saving call data:", error)
      }
    }
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setOpen(false)
      navigate("/login")
      showNotification("Logged out successfully", "success")
    } catch (error) {
      console.error("Error logging out:", error)
      showNotification("Failed to log out", "error")
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      showNotification(`File selected: ${file.name}`, "info")
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  // Load chat session from history
  const loadChatSession = async (chatId) => {
    const selectedChat = chatHistory.find((chat) => chat._id === chatId)
    if (selectedChat) {
      // Check if the chat language matches the current selected language
      if (selectedChat.language !== language && language !== "en") {
        // Need to translate messages to the current language
        setLoading(true)
        try {
          const translatedMessages = await Promise.all(
            selectedChat.messages.map(async (message) => {
              // Only translate bot messages, keep user messages as is
              if (message.sender === "bot" && message.originalText) {
                try {
                  const translationResponse = await axios.post("/api/translate", {
                    text: message.originalText,
                    source_language: "en",
                    target_language: language,
                  })

                  if (translationResponse.data && translationResponse.data.translated_text) {
                    return {
                      ...message,
                      text: translationResponse.data.translated_text,
                    }
                  }
                } catch (error) {
                  console.error("Error translating message:", error)
                }
              }
              return message
            }),
          )

          setMessages(translatedMessages)
        } catch (error) {
          console.error("Error translating chat session:", error)
          showNotification("Error translating chat messages", "error")
          // Fall back to original messages
          setMessages(selectedChat.messages || [])
        } finally {
          setLoading(false)
        }
      } else {
        // Language matches or is English, use messages as is
        setMessages(selectedChat.messages || [])
      }

      setDrawerOpen(false)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const showNotification = (message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Get language name from code
  const getLanguageName = (code) => {
    return languages.find((l) => l.code === code)?.name || "English"
  }

  // Render the current question
  const renderQuestion = () => {
    if (loadingQuestionnaire) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (translatedQuestions.length === 0) {
      return null
    }

    const currentQuestion = translatedQuestions[questionnaireStep]
    if (!currentQuestion) return null

    return (
      <Box sx={{ my: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQuestion.translatedQuestion}
        </Typography>

        {currentQuestion.type === "radio" ? (
          <FormControl component="fieldset">
            <RadioGroup value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)}>
              {currentQuestion.options.map((option) => (
                <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            type={currentQuestion.type}
            placeholder={currentQuestion.placeholder}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            error={!!questionnaireError}
            helperText={questionnaireError}
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    )
  }

  // Add a function to format message text with basic markdown-like syntax
  // Add this function before the return statement

  // Function to format message text with basic markdown-like syntax
  const formatMessageText = (text) => {
    if (!text) return ""

    // First, handle bold text
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Create a container for our formatted content
    let result = '<div class="formatted-message">'

    // Split by lines and process each line
    const lines = formattedText.split("\n")

    // Track if we're in a list
    let inOrderedList = false
    let inUnorderedList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines

      // Universal number pattern that works across languages
      // This matches any digit(s) followed by a period, regardless of spacing
      const numberPattern = /^\d+\.(\s|$)/

      // Check for numbered list items (works with any language)
      if (numberPattern.test(line)) {
        // Extract the content after the number
        const content = line.substring(line.indexOf(".") + 1).trim()

        // Start a new ordered list if needed
        if (!inOrderedList) {
          // Close any unordered list if open
          if (inUnorderedList) {
            result += "</ul>"
            inUnorderedList = false
          }
          result += '<ol style="margin-top: 8px; margin-bottom: 8px; padding-left: 24px;">'
          inOrderedList = true
        }

        // Add the list item
        result += `<li style="margin-bottom: 4px;">${content}</li>`
      }
      // Check for bullet points
      else if (line.startsWith("-") || line.startsWith("•") || line.startsWith(":")) {
        const content = line.substring(1).trim()

        // Start a new unordered list if needed
        if (!inUnorderedList) {
          // Close any ordered list if open
          if (inOrderedList) {
            result += "</ol>"
            inOrderedList = false
          }
          result += '<ul style="margin-top: 8px; margin-bottom: 8px; padding-left: 24px;">'
          inUnorderedList = true
        }

        // Add the list item
        result += `<li style="margin-bottom: 4px;">${content}</li>`
      }
      // Check for lines ending with colon (subheadings)
      else if (line.endsWith(":")) {
        // Close any open lists
        if (inOrderedList) {
          result += "</ol>"
          inOrderedList = false
        }
        if (inUnorderedList) {
          result += "</ul>"
          inUnorderedList = false
        }

        // Add as a subheading
        result += `<div style="font-weight: bold; margin-top: 10px; margin-bottom: 5px;">${line}</div>`
      }
      // Special case for any format with numbers at start (like "2. text" or "2 text")
      // This is a more aggressive pattern match for numbered items
      else if (/^\d+[.\s]/.test(line)) {
        // Extract the content after the number
        const match = line.match(/^\d+[.\s]\s*(.*)/)
        const content = match ? match[1] : line.substring(2).trim()

        // Start a new ordered list if needed
        if (!inOrderedList) {
          // Close any unordered list if open
          if (inUnorderedList) {
            result += "</ul>"
            inUnorderedList = false
          }
          result += '<ol style="margin-top: 8px; margin-bottom: 8px; padding-left: 24px;">'
          inOrderedList = true
        }

        // Add the list item
        result += `<li style="margin-bottom: 4px;">${content}</li>`
      }
      // Regular text
      else {
        // Close any open lists
        if (inOrderedList) {
          result += "</ol>"
          inOrderedList = false
        }
        if (inUnorderedList) {
          result += "</ul>"
          inUnorderedList = false
        }

        // Add as regular paragraph
        result += `<p style="margin-bottom: 8px;">${line}</p>`
      }
    }

    // Close any open lists
    if (inOrderedList) {
      result += "</ol>"
    }
    if (inUnorderedList) {
      result += "</ul>"
    }

    // Close the container
    result += "</div>"

    return result
  }

  // Add these loan type options
  const loanTypeOptions = [
    "Home Loan",
    "Personal Loan",
    "Business Loan",
    "Education Loan",
    "Car Loan",
    "Agriculture Loan",
  ]

  // Add this function to handle loan guidance dialog changes
  const handleLoanGuidanceChange = (e) => {
    const { name, value } = e.target
    setLoanGuidanceData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add this function to handle loan eligibility dialog changes
  const handleLoanEligibilityChange = (e) => {
    const { name, value } = e.target
    setLoanEligibilityData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Replace the getLoanRecommendations function with this improved version
  const getLoanRecommendations = async () => {
    if (!loanGuidanceData.loanAmount || !loanGuidanceData.loanType) {
      showNotification("Please enter loan amount and select loan type", "error")
      return
    }

    setLoadingRecommendations(true)
    try {
      const recommendations = await loanService.getBankRecommendations(
        Number.parseFloat(loanGuidanceData.loanAmount),
        loanGuidanceData.loanType,
      )

      console.log("Loan recommendations:", recommendations)
      setLoanRecommendations(recommendations)

      // Format recommendations for chat
      let recommendationsText = `Based on analysis of loan data, here are the top bank recommendations for your ${loanGuidanceData.loanType} of ${loanService.formatCurrency(Number.parseFloat(loanGuidanceData.loanAmount))}:\n\n`

      recommendations.forEach((rec, index) => {
        recommendationsText += `${index + 1}. **${rec.bankName}**\n   - Interest Rate: ${rec.interestRate}%\n   - Processing Fee: ${loanService.formatCurrency(Number.parseFloat(rec.processingFee))}\n   - EMI: ${loanService.formatCurrency(Number.parseFloat(rec.emi))}/month\n   - Acceptance Rate: ${rec.acceptanceRate}\n   - Loan Tenure: ${rec.loanTenure} years\n\n`
      })

      if (recommendations.length === 0) {
        recommendationsText +=
          "No matching recommendations found in our dataset. Please try a different loan amount or type."
      } else {
        recommendationsText += "Would you like more information about any of these banks or loan options?"
      }

      // Add bot message with recommendations
      const botMessage = {
        id: Date.now().toString(),
        text: recommendationsText,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setLoanGuidanceDialogOpen(false)
    } catch (error) {
      console.error("Error getting loan recommendations:", error)
      showNotification("Failed to get loan recommendations", "error")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  // Replace the checkLoanEligibility function with this improved version
  const checkLoanEligibility = async () => {
    if (!loanEligibilityData.loanAmount || !loanEligibilityData.loanType) {
      showNotification("Please enter loan amount and select loan type", "error")
      return
    }

    setLoadingRecommendations(true)
    try {
      const eligibilityResult = await loanService.checkLoanEligibility({
        loanAmount: Number.parseFloat(loanEligibilityData.loanAmount),
        loanType: loanEligibilityData.loanType,
        creditScore: loanEligibilityData.creditScore ? Number.parseFloat(loanEligibilityData.creditScore) : null,
        annualIncome: loanEligibilityData.annualIncome ? Number.parseFloat(loanEligibilityData.annualIncome) : null,
        yearsInOccupation: loanEligibilityData.yearsInOccupation
          ? Number.parseFloat(loanEligibilityData.yearsInOccupation)
          : null,
      })

      console.log("Loan eligibility result:", eligibilityResult)
      setEligibilityResult(eligibilityResult)

      // Format eligibility result for chat
      let eligibilityText = `Based on my analysis of loan data for your ${loanEligibilityData.loanType} request of ${loanService.formatCurrency(Number.parseFloat(loanEligibilityData.loanAmount))}:\n\n`

      if (eligibilityResult.isEligible) {
        eligibilityText += `**You are likely eligible for this loan!**\n\n`
        eligibilityText += `- Acceptance rate for similar loans: ${eligibilityResult.acceptanceRate}\n`
        eligibilityText += `- Average approved amount: ${loanService.formatCurrency(Number.parseFloat(eligibilityResult.avgLoanAmount))}\n\n`

        if (eligibilityResult.recommendations && eligibilityResult.recommendations.length > 0) {
          eligibilityText += `**Recommended banks:**\n`
          eligibilityResult.recommendations.forEach((rec, index) => {
            eligibilityText += `${index + 1}. **${rec.bankName}** - ${rec.interestRate}% interest rate (${rec.loanTenure} years)\n`
          })
        }
      } else {
        eligibilityText += `**You may face challenges getting this loan approved.**\n\n`
        eligibilityText += `**Reasons:**\n`

        eligibilityResult.reasons.forEach((reason, index) => {
          eligibilityText += `${index + 1}. ${reason}\n`
        })

        eligibilityText += `\n- Acceptance rate for similar loans: ${eligibilityResult.acceptanceRate}\n`
        eligibilityText += `- Average approved amount: ${loanService.formatCurrency(Number.parseFloat(eligibilityResult.avgLoanAmount))}\n\n`

        eligibilityText += `**Suggestions to improve eligibility:**\n`
        eligibilityText += `1. Consider applying for a lower loan amount\n`
        eligibilityText += `2. Work on improving your credit score\n`
        eligibilityText += `3. Provide additional collateral if possible\n`
        eligibilityText += `4. Apply with a co-applicant to strengthen the application`
      }

      // Add bot message with eligibility result
      const botMessage = {
        id: Date.now().toString(),
        text: eligibilityText,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setLoanEligibilityDialogOpen(false)
    } catch (error) {
      console.error("Error checking loan eligibility:", error)
      showNotification("Failed to check loan eligibility", "error")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  return (
    <>
      {/* Language Selection Dialog */}
      <Dialog open={languageDialogOpen} onClose={() => setLanguageDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Choose Language
            <IconButton onClick={() => setLanguageDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {languages.map((lang) => (
              <Grid item xs={6} key={lang.code}>
                <Button
                  fullWidth
                  variant={language === lang.code ? "contained" : "outlined"}
                  onClick={() => handleLanguageSelect(lang.code)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    py: 1,
                    mb: 1,
                  }}
                  startIcon={<TranslateIcon />}
                >
                  {lang.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Questionnaire Dialog */}
      <Dialog
        open={showQuestionnaire && !completedQuestionnaire}
        fullWidth
        maxWidth="sm"
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6">Financial Information</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TranslateIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography
                variant="caption"
                sx={{
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setLanguageDialogOpen(true)}
              >
                {getLanguageName(language)}
                <ArrowDropDownIcon fontSize="small" />
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please answer these questions to help me provide personalized loan advice. Your information is secure and
            will only be used to give you better recommendations.
          </Typography>

          <Stepper activeStep={questionnaireStep} alternativeLabel sx={{ mb: 3 }}>
            {questionnaire.map((q, index) => (
              <Step key={q.id} completed={index < questionnaireStep}>
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderQuestion()}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button onClick={skipQuestionnaire} color="inherit" sx={{ textTransform: "none" }}>
              Skip for now
            </Button>

            <Box>
              {questionnaireStep > 0 && (
                <Button onClick={handleQuestionnaireBack} startIcon={<ArrowBackIcon />} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}

              <Button
                variant="contained"
                onClick={handleQuestionnaireNext}
                endIcon={questionnaireStep < questionnaire.length - 1 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
                disabled={loadingQuestionnaire}
              >
                {questionnaireStep < questionnaire.length - 1 ? "Next" : "Finish"}
                {loadingQuestionnaire && <CircularProgress size={24} sx={{ ml: 1 }} />}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Chat Button */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          aria-label="chat"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
          onClick={() => {
            setOpen(true)
            if (!currentUser) {
              navigate("/login")
            }
          }}
        >
          <ChatIcon />
        </Fab>
      </Zoom>

      {/* Chat Interface */}
      <Fade in={open}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3 }}
          elevation={3}
          sx={{
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            width: { xs: "100%", md: "40%" },
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1200, // Increased z-index to appear above navbar
            borderRadius: { xs: 0, md: "12px 0 0 12px" },
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: "white", color: theme.palette.primary.main, mr: 1 }}>FA</Avatar>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h6">FinAssist</Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => setLanguageDialogOpen(true)}
                >
                  <TranslateIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {getLanguageName(language)}
                    <ArrowDropDownIcon fontSize="small" />
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {!inCall && !showQuestionnaire && (
                <IconButton color="inherit" onClick={handleStartCall} aria-label="Start call">
                  <CallIcon />
                </IconButton>
              )}
              {playingMessageId !== null && (
                <IconButton color="inherit" onClick={handleStopAudio} aria-label="Stop audio">
                  <VolumeDownIcon />
                </IconButton>
              )}
              <IconButton color="inherit" onClick={() => setOpen(false)} aria-label="Close chat">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Call Interface */}
          <AnimatePresence>
            {inCall ? (
              <CallInterface
                language={language}
                currentUser={currentUser}
                onEndCall={handleEndCall}
                onNotification={showNotification}
                onSaveTranscript={handleSaveTranscript}
              />
            ) : (
              <>
                {/* Chat Messages */}
                <List
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    p: 2,
                    bgcolor: "background.default",
                  }}
                >
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        flexDirection: message.sender === "user" ? "row-reverse" : "row",
                        alignItems: "flex-start",
                        mb: 1,
                        px: 0,
                      }}
                    >
                      {message.sender !== "system" && (
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor:
                                message.sender === "user" ? theme.palette.secondary.main : theme.palette.primary.main,
                              fontSize: "0.875rem",
                            }}
                          >
                            {message.sender === "user" ? "U" : "FA"}
                          </Avatar>
                        </ListItemAvatar>
                      )}
                      <Box
                        sx={{
                          maxWidth: "75%",
                          bgcolor:
                            message.sender === "system"
                              ? "rgba(0,0,0,0.05)"
                              : message.sender === "user"
                                ? theme.palette.secondary.light
                                : "grey.100",
                          color: message.sender === "user" ? "white" : "text.primary",
                          p: 1.5,
                          borderRadius: 2,
                          position: "relative",
                          ...(message.sender === "system" && {
                            width: "100%",
                            maxWidth: "100%",
                            textAlign: "center",
                          }),
                        }}
                      >
                        {message.sender === "bot" ? (
                          <div
                            className="bot-message"
                            dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                            style={{
                              width: "100%",
                              fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                              fontSize: "0.875rem",
                              lineHeight: "1.43",
                              letterSpacing: "0.01071em",
                            }}
                          />
                        ) : (
                          <Typography variant="body2">{message.text}</Typography>
                        )}
                        {message.sender === "bot" && (
                          <IconButton
                            size="small"
                            onClick={() => handleTextToSpeech(message.text, message.id)}
                            sx={{ ml: 1, opacity: 0.6 }}
                            aria-label="Play message"
                            disabled={playingMessageId !== null}
                          >
                            {playingMessageId === message.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <VolumeUpIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                        {message.hasFile && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1,
                              bgcolor: "rgba(0,0,0,0.05)",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="caption">{message.fileName}</Typography>
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: message.sender === "user" ? "right" : "left",
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                  {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 7, mt: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Typing...
                      </Typography>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </List>

                <Divider />

                {/* File Preview */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderTop: `1px solid ${theme.palette.divider}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <AttachFileIcon sx={{ mr: 1, color: "text.secondary" }} />
                          <Typography variant="body2" noWrap sx={{ maxWidth: "200px" }}>
                            {selectedFile.name}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={handleRemoveFile}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Input */}
                <Box
                  component="form"
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <IconButton
                    color={isRecording ? "secondary" : "default"}
                    onClick={handleVoiceInput}
                    aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    disabled={processingAudio || showQuestionnaire}
                  >
                    {isRecording ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Type your message in ${languages.find((l) => l.code === language)?.name || "English"}...`}
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isRecording || processingAudio || showQuestionnaire}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <IconButton
                    color="default"
                    onClick={handleFileUpload}
                    disabled={loading || isRecording || processingAudio || showQuestionnaire}
                    aria-label="Attach file"
                  >
                    <AttachFileIcon />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <IconButton
                    color="primary"
                    type="submit"
                    disabled={
                      loading || isRecording || (!input.trim() && !selectedFile) || processingAudio || showQuestionnaire
                    }
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            )}
          </AnimatePresence>
        </Paper>
      </Fade>

      {/* Side Drawer for Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "80%", sm: 300 },
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ p: 3, bgcolor: theme.palette.primary.main, color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: "white", color: theme.palette.primary.main, mr: 2 }}>
              {currentUser?.displayName?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="h6">{currentUser?.displayName || "User"}</Typography>
              <Typography variant="body2">{currentUser?.email}</Typography>
            </Box>
          </Box>
        </Box>
        <List>
          <ListItem>
            <Typography variant="subtitle1" fontWeight="bold">
              Chat History
            </Typography>
          </ListItem>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <ListItemButton key={chat._id} onClick={() => loadChatSession(chat._id)}>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Chat on ${new Date(chat.createdAt).toLocaleDateString()}`}
                  secondary={`${chat.messages.length} messages`}
                />
              </ListItemButton>
            ))
          ) : (
            <ListItem>
              <ListItemText secondary="No chat history yet" />
            </ListItem>
          )}
          <Divider sx={{ my: 2 }} />
          <ListItemButton onClick={() => navigate("/profile")}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Add the Loan Guidance Dialog */}
      <Dialog open={loanGuidanceDialogOpen} onClose={() => setLoanGuidanceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Loan Application Guidance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Please provide details about the loan you're interested in to get personalized bank recommendations.
          </Typography>

          <TextField
            fullWidth
            label="Loan Amount (INR)"
            name="loanAmount"
            type="number"
            value={loanGuidanceData.loanAmount}
            onChange={handleLoanGuidanceChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Loan Type</InputLabel>
            <Select
              name="loanType"
              value={loanGuidanceData.loanType}
              onChange={handleLoanGuidanceChange}
              label="Loan Type"
            >
              {loanTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoanGuidanceDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={getLoanRecommendations} disabled={loadingRecommendations}>
            {loadingRecommendations ? <CircularProgress size={24} /> : "Get Recommendations"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loan Eligibility Dialog */}
      <Dialog
        open={loanEligibilityDialogOpen}
        onClose={() => setLoanEligibilityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Loan Eligibility Check</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Please provide details to check your loan eligibility based on our dataset analysis.
          </Typography>

          <TextField
            fullWidth
            label="Loan Amount (INR)"
            name="loanAmount"
            type="number"
            value={loanEligibilityData.loanAmount}
            onChange={handleLoanEligibilityChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Loan Type</InputLabel>
            <Select
              name="loanType"
              value={loanEligibilityData.loanType}
              onChange={handleLoanEligibilityChange}
              label="Loan Type"
            >
              {loanTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Credit Score (optional)"
            name="creditScore"
            type="number"
            value={loanEligibilityData.creditScore}
            onChange={handleLoanEligibilityChange}
            margin="normal"
            helperText="Enter a value between 300-900"
          />

          <TextField
            fullWidth
            label="Annual Income (INR, optional)"
            name="annualIncome"
            type="number"
            value={loanEligibilityData.annualIncome}
            onChange={handleLoanEligibilityChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Years in Current Occupation (optional)"
            name="yearsInOccupation"
            type="number"
            value={loanEligibilityData.yearsInOccupation}
            onChange={handleLoanEligibilityChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoanEligibilityDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={checkLoanEligibility} disabled={loadingRecommendations}>
            {loadingRecommendations ? <CircularProgress size={24} /> : "Check Eligibility"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ChatbotWidget

