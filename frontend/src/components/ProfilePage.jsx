"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material"
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Translate as TranslateIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  Call as CallIcon,
} from "@mui/icons-material"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Configure axios with base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000"

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

const ProfilePage = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingFinancial, setEditingFinancial] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    preferredLanguage: "en",
    phone: "",
  })
  const [financialData, setFinancialData] = useState({
    age: "",
    occupation: "",
    yearsInOccupation: "",
    annualIncome: "",
    homeOwnership: "",
    pastLoans: "",
    creditScore: "",
    activeBankAccounts: "",
    completedQuestionnaire: false,
  })
  const [chatHistory, setChatHistory] = useState([])
  const [callHistory, setCallHistory] = useState([])

  useEffect(() => {
    if (currentUser) {
      fetchUserData()
      fetchFinancialData()
      fetchChatHistory()
      fetchCallHistory()
    }
  }, [currentUser])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/users/${currentUser.uid}`)
      setUserData({
        displayName: response.data.displayName || currentUser.displayName || "",
        email: currentUser.email || "",
        preferredLanguage: response.data.preferredLanguage || "en",
        phone: response.data.phone || "",
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  const fetchFinancialData = async () => {
    try {
      const response = await axios.get(`/api/users/${currentUser.uid}/financial-info`)
      if (response.data && response.data.completedQuestionnaire) {
        setFinancialData({
          age: response.data.age || "",
          occupation: response.data.occupation || "",
          yearsInOccupation: response.data.yearsInOccupation || "",
          annualIncome: response.data.annualIncome || "",
          homeOwnership: response.data.homeOwnership || "",
          pastLoans: response.data.pastLoans || "",
          creditScore: response.data.creditScore || "",
          activeBankAccounts: response.data.activeBankAccounts || "",
          completedQuestionnaire: response.data.completedQuestionnaire || false,
        })
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
    }
  }

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chats/${currentUser.uid}`)
      setChatHistory(response.data.chats || [])
    } catch (error) {
      console.error("Error fetching chat history:", error)
    }
  }

  const fetchCallHistory = async () => {
    try {
      const response = await axios.get(`/api/calls/${currentUser.uid}`)
      setCallHistory(response.data.calls || [])
    } catch (error) {
      console.error("Error fetching call history:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFinancialChange = (e) => {
    const { name, value } = e.target
    setFinancialData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await axios.put(`/api/users/${currentUser.uid}`, {
        displayName: userData.displayName,
        preferredLanguage: userData.preferredLanguage,
        phone: userData.phone,
      })
      setSuccess("Profile updated successfully")
      setEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleFinancialSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await axios.post(`/api/users/${currentUser.uid}/financial-info`, {
        ...financialData,
        completedQuestionnaire: true,
      })
      setSuccess("Financial information updated successfully")
      setEditingFinancial(false)
    } catch (error) {
      console.error("Error updating financial info:", error)
      setError("Failed to update financial information")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        py: 8,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate("/")} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #3a86ff 0%, #5e60ce 100%)",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      bgcolor: "primary.main",
                      fontSize: "2.5rem",
                    }}
                  >
                    {userData.displayName?.[0] || "U"}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {userData.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userData.email}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="displayName"
                    value={userData.displayName}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                  <TextField fullWidth label="Email" value={userData.email} margin="normal" disabled />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Preferred Language"
                    name="preferredLanguage"
                    value={userData.preferredLanguage}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!editing}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {languages.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </TextField>

                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    {editing ? (
                      <>
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setEditing(false)
                            fetchUserData()
                          }}
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                          {saving ? <CircularProgress size={24} /> : "Save"}
                        </Button>
                      </>
                    ) : (
                      <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </motion.div>

            {/* Financial Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card sx={{ borderRadius: 3, mb: 4 }}>
                <CardHeader
                  title="Financial Information"
                  action={
                    editingFinancial ? (
                      <IconButton
                        onClick={() => {
                          setEditingFinancial(false)
                          fetchFinancialData()
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => setEditingFinancial(true)}>
                        <EditIcon />
                      </IconButton>
                    )
                  }
                />
                <CardContent>
                  {financialData.completedQuestionnaire ? (
                    <Box component="form" onSubmit={handleFinancialSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Age"
                            name="age"
                            type="number"
                            value={financialData.age}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Credit Score"
                            name="creditScore"
                            type="number"
                            value={financialData.creditScore}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Occupation"
                            name="occupation"
                            value={financialData.occupation}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Years in Occupation"
                            name="yearsInOccupation"
                            type="number"
                            value={financialData.yearsInOccupation}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Annual Income (INR)"
                            name="annualIncome"
                            type="number"
                            value={financialData.annualIncome}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Home Ownership</InputLabel>
                            <Select
                              name="homeOwnership"
                              value={financialData.homeOwnership}
                              onChange={handleFinancialChange}
                              disabled={!editingFinancial}
                              label="Home Ownership"
                            >
                              <MenuItem value="Own">Own</MenuItem>
                              <MenuItem value="Rent">Rent</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Active Bank Accounts"
                            name="activeBankAccounts"
                            type="number"
                            value={financialData.activeBankAccounts}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Past Loans"
                            name="pastLoans"
                            value={financialData.pastLoans}
                            onChange={handleFinancialChange}
                            disabled={!editingFinancial}
                            multiline
                            rows={2}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>

                      {editingFinancial && (
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                            {saving ? <CircularProgress size={24} /> : "Save"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        You haven't completed the financial questionnaire yet.
                      </Typography>
                      <Button variant="contained" onClick={() => navigate("/")} startIcon={<ChatIcon />} sx={{ mt: 1 }}>
                        Complete in Chat
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <HistoryIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Conversations
                  </Typography>
                </Box>

                {chatHistory.length > 0 ? (
                  <List>
                    {chatHistory.slice(0, 5).map((chat) => (
                      <ListItem key={chat._id} alignItems="flex-start" divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <ChatIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={formatDate(chat.createdAt)}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {chat.messages.length} messages
                              </Typography>
                              {" — "}
                              {chat.messages[chat.messages.length - 1]?.text.substring(0, 60)}
                              {chat.messages[chat.messages.length - 1]?.text.length > 60 ? "..." : ""}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No chat history yet.
                  </Typography>
                )}
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <CallIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Call History
                  </Typography>
                </Box>

                {callHistory.length > 0 ? (
                  <List>
                    {callHistory.map((call) => (
                      <ListItem key={call._id} alignItems="flex-start" divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "secondary.main" }}>
                            <CallIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={formatDate(call.timestamp)}
                          secondary={`Duration: ${formatDuration(call.duration)}`}
                        />
                        <Chip
                          icon={<TranslateIcon />}
                          label={languages.find((l) => l.code === call.language)?.name || "English"}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No call history yet.
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ProfilePage

