"use client"

import { Box, Container, Typography, Grid, Card, CardContent, Avatar, useTheme } from "@mui/material"
import { motion } from "framer-motion"
import {
  Translate as TranslateIcon,
  Headset as HeadsetIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  DocumentScanner as DocumentScannerIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material"

const features = [
  {
    title: "Multilingual Support",
    description: "Communicate in your preferred language with support for over 10 languages.",
    icon: <TranslateIcon fontSize="large" />,
    color: "#3a86ff",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "24/7 AI Assistant",
    description: "Get instant answers to your loan queries anytime, anywhere.",
    icon: <HeadsetIcon fontSize="large" />,
    color: "#ff6b6b",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Quick Eligibility Check",
    description: "Know your loan eligibility in minutes with our advanced assessment system.",
    icon: <SpeedIcon fontSize="large" />,
    color: "#4ecdc4",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Secure Document Processing",
    description: "Upload and process your documents with bank-grade security.",
    icon: <SecurityIcon fontSize="large" />,
    color: "#f9c74f",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Document Scanner",
    description: "Scan physical documents directly from your device for quick processing.",
    icon: <DocumentScannerIcon fontSize="large" />,
    color: "#90be6d",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Financial Insights",
    description: "Get personalized financial insights and recommendations.",
    icon: <AnalyticsIcon fontSize="large" />,
    color: "#43aa8b",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Data-Driven Bank Recommendations",
    description: "Receive bank recommendations based on analysis of real loan data.",
    icon: <TrendingUpIcon fontSize="large" />,
    color: "#577590",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const FeatureShowcase = () => {
  const theme = useTheme()

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(90deg, #3a86ff 0%, #5e60ce 100%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Key Features
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
              Discover the innovative features that make our financial assistant stand out
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                    },
                    overflow: "hidden",
                    borderRadius: 4,
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: feature.color,
                    }}
                  />
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}20`,
                          color: feature.color,
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default FeatureShowcase

