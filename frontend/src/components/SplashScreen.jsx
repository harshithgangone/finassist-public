"use client"

import { Box, Typography } from "@mui/material"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import financeLottie from "../assets/finance-animation.json"

const SplashScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        bgcolor: "#f8f9fa",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ width: "300px", height: "300px" }}>
          <Lottie animationData={financeLottie} loop={true} />
        </Box>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Typography variant="h3" sx={{ mt: 4, fontWeight: "bold", color: "#3a86ff" }}>
          FinAssist
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mt: 1 }}>
          Your Financial Companion
        </Typography>
      </motion.div>
    </Box>
  )
}

export default SplashScreen

