"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material"
import { Facebook, Twitter, Instagram, LinkedIn, Send, Phone, Email, LocationOn } from "@mui/icons-material"

const Footer = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        bgcolor: "#1a1a2e",
        color: "white",
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: "bold", mb: 2 }}>
              FinAssist
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "rgba(255,255,255,0.7)" }}>
              Your multilingual financial assistant for loan eligibility, application guidance, and financial literacy.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "#3a86ff" }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: "#3a86ff" }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: "#3a86ff" }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: "#3a86ff" }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: "bold", mb: 3 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Home
              </Link>
              <Link href="#loans" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Loans
              </Link>
              <Link href="#calculator" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Calculator
              </Link>
              <Link href="#features" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Features
              </Link>
              <Link href="#testimonials" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Testimonials
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: "bold", mb: 3 }}>
              Loan Types
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Home Loans
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Personal Loans
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Education Loans
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Business Loans
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Car Loans
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: "bold", mb: 3 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone fontSize="small" sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  +91 1234567890
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email fontSize="small" sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  contact@finassist.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOn fontSize="small" sx={{ color: theme.palette.primary.main, mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  123 Financial District, Hyderabad, Telangana, India
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Subscribe to our newsletter
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Your email"
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    input: { color: "white" },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" sx={{ color: theme.palette.primary.main }}>
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            © {new Date().getFullYear()} FinAssist. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer

