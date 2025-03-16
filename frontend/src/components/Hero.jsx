"use client"

import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material"
import { motion } from "framer-motion"
// import heroImage from "../assets/hero-image.png"

const Hero = () => {
  return (
    <Box
      sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  background: "linear-gradient(90deg, #3a86ff 0%, #5e60ce 100%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Smart Financial Solutions at Your Fingertips
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
                Get personalized loan guidance, eligibility checks, and financial literacy tips in multiple languages.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: "1rem",
                  }}
                >
                  Check Eligibility
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: "1rem",
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mt: 5,
                  flexWrap: "wrap",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    10+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Languages
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    5M+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Users
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    98%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Satisfaction
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Box
                component="img"
                src="https://img.freepik.com/free-vector/finance-financial-performance-concept-illustration_53876-40450.jpg"
                alt="Financial assistance illustration"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxWidth: 600,
                  display: "block",
                  mx: "auto",
                  filter: "drop-shadow(0px 10px 20px rgba(0, 0, 0, 0.1))",
                  borderRadius: 4,
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(58, 134, 255, 0.1) 0%, rgba(58, 134, 255, 0) 70%)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0) 70%)",
          zIndex: 0,
        }}
      />
    </Box>
  )
}

export default Hero

