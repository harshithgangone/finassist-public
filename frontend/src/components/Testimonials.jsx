"use client"

import { useState } from "react"
import { Box, Container, Typography, Card, CardContent, Avatar, Rating, IconButton, useTheme } from "@mui/material"
import { motion } from "framer-motion"
import { ArrowBack, ArrowForward, FormatQuote } from "@mui/icons-material"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Home Loan Customer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "The multilingual support was a game-changer for me. I could understand all the loan terms in Hindi, which made me feel confident about my decision.",
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Business Owner",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "The AI assistant helped me understand exactly what documents I needed for my business loan. The process was smooth and much faster than I expected.",
  },
  {
    id: 3,
    name: "Ananya Patel",
    role: "Education Loan Applicant",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
    text: "As a student, I was confused about loan options. The financial literacy tips helped me make an informed decision about my education loan.",
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Personal Loan Customer",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 5,
    text: "The eligibility check feature saved me a lot of time. I knew exactly what I qualified for before even starting the application process.",
  },
  {
    id: 5,
    name: "Meera Reddy",
    role: "First-time Home Buyer",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    rating: 5,
    text: "The loan calculator helped me plan my finances better. I could see exactly how different down payments would affect my monthly installments.",
  },
]

const Testimonials = () => {
  const theme = useTheme()
  const [sliderRef, setSliderRef] = useState(null)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <Box
      id="testimonials"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.paper",
        position: "relative",
        overflow: "hidden",
      }}
    >
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

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
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
              Customer Stories
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
              Hear from our customers about how our financial assistant helped them
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ position: "relative", px: { xs: 0, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Slider ref={(slider) => setSliderRef(slider)} {...settings}>
              {testimonials.map((testimonial) => (
                <Box key={testimonial.id} sx={{ p: 2 }}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                      position: "relative",
                      overflow: "visible",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -20,
                        left: 20,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                      },
                    }}
                  >
                    <FormatQuote
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: 28,
                        color: "white",
                        fontSize: 24,
                        zIndex: 2,
                      }}
                    />
                    <CardContent sx={{ p: 4, flexGrow: 1 }}>
                      <Typography variant="body1" paragraph sx={{ fontStyle: "italic", mb: 3 }}>
                        "{testimonial.text}"
                      </Typography>
                      <Box sx={{ mt: "auto" }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <Avatar
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            sx={{ width: 56, height: 56, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="h6" component="h3">
                              {testimonial.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={testimonial.rating} readOnly />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </motion.div>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              gap: 2,
            }}
          >
            <IconButton
              onClick={() => sliderRef?.slickPrev()}
              sx={{
                bgcolor: "background.default",
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={() => sliderRef?.slickNext()}
              sx={{
                bgcolor: "background.default",
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Testimonials

