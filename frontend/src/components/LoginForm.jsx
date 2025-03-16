"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material"
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const { login, signup, googleSignIn } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggleView = () => {
    setIsLogin(!isLogin)
    setError("")
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signup(formData.email, formData.password, formData.name)
      }
      navigate("/")
    } catch (error) {
      console.error("Authentication error:", error)
      setError(
        error.code === "auth/user-not-found"
          ? "User not found. Please check your email or sign up."
          : error.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : error.code === "auth/email-already-in-use"
              ? "Email already in use. Please use a different email or login."
              : error.code === "auth/weak-password"
                ? "Password is too weak. Please use a stronger password."
                : "An error occurred. Please try again later.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await googleSignIn()
      navigate("/")
    } catch (error) {
      console.error("Google sign in error:", error)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            fontWeight: 700,
            textAlign: "center",
            background: "linear-gradient(90deg, #3a86ff 0%, #5e60ce 100%)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
          {isLogin ? "Sign in to access your financial assistant" : "Join us to get personalized financial guidance"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {isLogin && (
            <Box sx={{ textAlign: "right", mb: 2 }}>
              <Link href="#" variant="body2" underline="hover">
                Forgot password?
              </Link>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              position: "relative",
            }}
          >
            {loading ? <CircularProgress size={24} /> : isLogin ? "Sign In" : "Sign Up"}
          </Button>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              mb: 3,
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" display="inline">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Typography>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={handleToggleView}
              underline="hover"
              fontWeight="medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginForm

