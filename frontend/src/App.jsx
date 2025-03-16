"use client"

import { useState, useEffect } from "react"
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material"
import { motion } from "framer-motion"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import LoanServices from "./components/LoanServices"
import LoanCalculator from "./components/LoanCalculator"
import FeatureShowcase from "./components/FeatureShowcase"
import Testimonials from "./components/Testimonials"
import Footer from "./components/Footer"
import ChatbotWidget from "./components/ChatbotWidget"
import SplashScreen from "./components/SplashScreen"
import LoginForm from "./components/LoginForm"
import ProfilePage from "./components/ProfilePage"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import "./utils/axiosConfig"

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3a86ff",
      light: "#6ea8fe",
      dark: "#1a56cc",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff6b6b",
      light: "#ff9e9e",
      dark: "#c53030",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          padding: "10px 20px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          borderRadius: 16,
        },
      },
    },
  },
})

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return children
}

function AppContent() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for splash screen
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SplashScreen />
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <LoanServices />
              <LoanCalculator />
              <FeatureShowcase />
              <Testimonials />
              <Footer />
              <ChatbotWidget />
            </>
          }
        />
      </Routes>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App

