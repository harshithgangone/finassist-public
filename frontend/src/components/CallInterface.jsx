"use client"

import { useState, useEffect, useRef } from "react"
import { Box, Typography, IconButton, Avatar, CircularProgress, useTheme } from "@mui/material"
import {
  CallEnd as CallEndIcon,
  MicOff as MicOffIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import axios from "axios"
import useSound from "use-sound"
import dingSound from "../assets/ding-sound.mp3"

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

const CallInterface = ({ language, currentUser, onEndCall, onNotification, onSaveTranscript }) => {
  const [callDuration, setCallDuration] = useState(0)
  const [callTimer, setCallTimer] = useState(null)
  const [callMessages, setCallMessages] = useState([])
  const [isUserTurn, setIsUserTurn] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playDing] = useSound(dingSound)
  const [callTranscript, setCallTranscript] = useState([])
  const [processingAudio, setProcessingAudio] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const theme = useTheme()

  // Add a new function to manually end the user's turn
  const handleEndUserTurn = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      onNotification("Processing your response...", "info")
    }
  }

  // Start call timer when component mounts
  useEffect(() => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    setCallTimer(timer)

    // Initial AI greeting
    startCall()

    // Cleanup on unmount
    return () => {
      if (callTimer) {
        clearInterval(callTimer)
      }

      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }

      // Ensure all audio tracks are stopped
      if (window.activeTracks && window.activeTracks.length > 0) {
        window.activeTracks.forEach((track) => track.stop())
        window.activeTracks = []
      }
    }
  }, [])

  const startCall = async () => {
    onNotification("Call started", "info")

    // Initial AI greeting
    const greeting = "Hi, your finance and loan advisor speaking. How can I help you today?"

    // Add greeting to call messages
    const greetingMessage = {
      id: Date.now().toString(),
      text: greeting,
      sender: "bot",
      timestamp: new Date(),
    }

    setCallMessages([greetingMessage])
    setCallTranscript([greetingMessage])

    // Convert greeting to speech
    try {
      setIsAiSpeaking(true)

      const response = await axios.post("/api/text-to-speech", {
        text: greeting,
        language: language,
      })

      if (response.data && response.data.audioUrl) {
        // Create and play audio
        const audio = new Audio(response.data.audioUrl)

        audio.onended = () => {
          setIsAiSpeaking(false)
          // After greeting, it's user's turn
          setTimeout(() => {
            // Play ding sound to indicate user's turn
            playDing()
            setIsUserTurn(true)
            // Start recording
            startCallRecording()
          }, 500)
        }

        audio.onerror = () => {
          setIsAiSpeaking(false)
          // Continue even if audio fails
          setTimeout(() => {
            playDing()
            setIsUserTurn(true)
            startCallRecording()
          }, 500)
        }

        await audio.play()
      } else {
        throw new Error("Invalid response from text-to-speech API")
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error)
      setIsAiSpeaking(false)
      // Continue the conversation even if TTS fails
      setTimeout(() => {
        playDing()
        setIsUserTurn(true)
        startCallRecording()
      }, 500)
    }
  }

  const startCallRecording = async () => {
    try {
      // Reset audio chunks
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Store tracks globally for cleanup
      window.activeTracks = stream.getTracks()

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
          setIsUserTurn(false)
          onNotification("I couldn't hear anything. Please try again.", "warning")
          setTimeout(() => {
            playDing()
            setIsUserTurn(true)
            startCallRecording()
          }, 1000)
          return
        }

        // Process the recorded audio
        await processCallAudio()
      }

      // Start recording
      mediaRecorder.start()

      // Set a timeout to stop recording after 10 seconds of silence
      // In a real app, you'd implement silence detection
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording" && isUserTurn) {
          mediaRecorderRef.current.stop()
        }
      }, 10000)
    } catch (error) {
      console.error("Error starting call recording:", error)
      onNotification(`Could not access microphone: ${error.message}`, "error")
      setIsUserTurn(false)
    }
  }

  const processCallAudio = async () => {
    try {
      setIsUserTurn(false)
      setProcessingAudio(true)
      onNotification("Processing your speech...", "info")

      // Create blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

      // Send to backend for speech-to-text
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.wav")
      formData.append("language", mapToSarvamLanguageCode(language))

      // Send to backend proxy endpoint
      const response = await axios.post("/api/speech-to-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      let userText = ""
      if (response.data && response.data.text) {
        userText = response.data.text
      } else {
        throw new Error("No transcription returned from API")
      }

      if (!userText || userText.trim() === "") {
        onNotification("I couldn't hear anything. Please try again.", "warning")
        setTimeout(() => {
          playDing()
          setIsUserTurn(true)
          startCallRecording()
        }, 1000)
        return
      }

      // Add user message to call transcript
      const userMessage = {
        id: Date.now().toString(),
        text: userText,
        sender: "user",
        timestamp: new Date(),
      }

      setCallMessages((prev) => [...prev, userMessage])
      setCallTranscript((prev) => [...prev, userMessage])

      // Process user message and get AI response
      await processCallMessage(userText)
    } catch (error) {
      console.error("Error processing call audio:", error)
      onNotification("Error processing your speech. Please try again.", "error")

      setTimeout(() => {
        playDing()
        setIsUserTurn(true)
        startCallRecording()
      }, 1000)
    } finally {
      setProcessingAudio(false)
    }
  }

  const processCallMessage = async (userText) => {
    try {
      onNotification("Getting response...", "info")

      // Send message to backend for processing
      const response = await axios.post("/api/chat", {
        userId: currentUser?.uid || "anonymous",
        message: userText,
        language,
      })

      if (!response.data || (!response.data.reply && !response.data.originalReply)) {
        throw new Error("Invalid response from server")
      }

      const aiResponseText = response.data.reply || response.data.originalReply

      // Add AI response to call transcript
      const aiMessage = {
        id: Date.now().toString(),
        text: aiResponseText,
        sender: "bot",
        timestamp: new Date(),
      }

      setCallMessages((prev) => [...prev, aiMessage])
      setCallTranscript((prev) => [...prev, aiMessage])

      // Speak the AI response
      try {
        setIsAiSpeaking(true)

        // Check if the response is too long for text-to-speech (over 500 characters)
        if (aiResponseText.length > 500) {
          onNotification("Response is too long for voice playback. Showing text only.", "warning")
          setIsAiSpeaking(false)

          // After AI speaks, it's user's turn again
          setTimeout(() => {
            playDing()
            setIsUserTurn(true)
            startCallRecording()
          }, 500)
          return
        }

        const ttsResponse = await axios.post("/api/text-to-speech", {
          text: aiResponseText,
          language: language,
        })

        if (ttsResponse.data && ttsResponse.data.audioUrl) {
          // Create and play audio
          const audio = new Audio(ttsResponse.data.audioUrl)

          audio.onended = () => {
            setIsAiSpeaking(false)
            // After AI speaks, it's user's turn again
            setTimeout(() => {
              playDing()
              setIsUserTurn(true)
              startCallRecording()
            }, 500)
          }

          audio.onerror = () => {
            setIsAiSpeaking(false)
            // Continue even if audio fails
            setTimeout(() => {
              playDing()
              setIsUserTurn(true)
              startCallRecording()
            }, 500)
          }

          await audio.play()
        } else {
          throw new Error("Invalid response from text-to-speech API")
        }
      } catch (error) {
        console.error("Error in text-to-speech:", error)
        setIsAiSpeaking(false)
        // Continue the conversation even if TTS fails
        setTimeout(() => {
          playDing()
          setIsUserTurn(true)
          startCallRecording()
        }, 500)
      }
    } catch (error) {
      console.error("Error processing call message:", error)
      onNotification("Error getting response. Please try again.", "error")

      setTimeout(() => {
        playDing()
        setIsUserTurn(true)
        startCallRecording()
      }, 1000)
    }
  }

  const handleEndCall = async () => {
    // End user turn if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    // Ensure all audio tracks are stopped
    if (window.activeTracks && window.activeTracks.length > 0) {
      window.activeTracks.forEach((track) => track.stop())
      window.activeTracks = []
    }

    // Clear call timer
    if (callTimer) {
      clearInterval(callTimer)
      setCallTimer(null)
    }

    // Save transcript to chat history
    if (callTranscript.length > 0) {
      onSaveTranscript(callTranscript, callDuration)
    }

    // Notify parent component that call has ended
    onEndCall(callDuration, callTranscript)
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    onNotification(isMuted ? "Microphone unmuted" : "Microphone muted", "info")
  }

  const formatCallDuration = () => {
    const minutes = Math.floor(callDuration / 60)
    const seconds = callDuration % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: "rgba(0,0,0,0.8)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: { xs: 0, md: "12px 0 0 0" },
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            bgcolor: theme.palette.primary.main,
            fontSize: "2rem",
          }}
        >
          FA
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1 }}>
          FinAssist Support
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {formatCallDuration()}
        </Typography>

        {/* Call status indicator */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isAiSpeaking ? (
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
              <VolumeUpIcon sx={{ mr: 1, animation: "pulse 1.5s infinite" }} />
              AI is speaking...
            </Typography>
          ) : isUserTurn ? (
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
              <MicIcon sx={{ mr: 1, animation: "pulse 1.5s infinite", color: "red" }} />
              Your turn - speak now
            </Typography>
          ) : processingAudio ? (
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
              Processing...
            </Typography>
          ) : (
            <Typography variant="body2">Standby...</Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          {isUserTurn && (
            <IconButton
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              onClick={handleEndUserTurn}
            >
              <Typography variant="button" sx={{ fontSize: "0.7rem", mr: 0.5 }}>
                Done
              </Typography>
              <MicOffIcon />
            </IconButton>
          )}

          <IconButton
            sx={{
              bgcolor: isMuted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
            onClick={handleToggleMute}
            disabled={!isUserTurn}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>

          <IconButton
            sx={{
              bgcolor: "rgba(255,0,0,0.8)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,0,0,1)" },
            }}
            onClick={handleEndCall}
          >
            <CallEndIcon />
          </IconButton>
        </Box>

        {/* Call transcript */}
        <Box
          sx={{
            mt: 3,
            maxHeight: "200px",
            width: "100%",
            overflowY: "auto",
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", mb: 1, display: "block" }}>
            Call Transcript:
          </Typography>
          {callMessages.map((message) => (
            <Box
              key={message.id}
              sx={{
                mb: 1,
                color: message.sender === "user" ? "rgba(255,255,255,0.9)" : theme.palette.primary.light,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {message.sender === "user" ? "You: " : "AI: "}
              </Typography>
              <Typography variant="caption">{message.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </motion.div>
  )
}

export default CallInterface

