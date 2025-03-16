"use client"

import { useState } from "react"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material"
import { motion } from "framer-motion"
import {
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  School as EducationIcon,
  Business as BusinessIcon,
  CreditCard as PersonalIcon,
  Agriculture as FarmIcon,
} from "@mui/icons-material"

const loanTypes = [
  {
    id: "home",
    title: "Home Loans",
    description:
      "Realize your dream of owning a home with our competitive interest rates and flexible repayment options.",
    icon: <HomeIcon fontSize="large" />,
    color: "#3a86ff",
    features: [
      "Interest rates from 6.7%",
      "Loan tenure up to 30 years",
      "Up to 90% financing",
      "Quick approval process",
    ],
    image: "https://img.freepik.com/free-vector/house-concept-illustration_114360-4289.jpg",
  },
  {
    id: "personal",
    title: "Personal Loans",
    description: "Get quick access to funds for your personal needs with minimal documentation and fast approval.",
    icon: <PersonalIcon fontSize="large" />,
    color: "#ff6b6b",
    features: ["Interest rates from 10.5%", "Loan tenure up to 5 years", "No collateral required", "Flexible usage"],
    image: "https://img.freepik.com/free-vector/personal-finance-concept-illustration_114360-4483.jpg",
  },
  {
    id: "education",
    title: "Education Loans",
    description: "Invest in your future with our education loans designed to cover tuition fees and living expenses.",
    icon: <EducationIcon fontSize="large" />,
    color: "#4ecdc4",
    features: ["Interest rates from 8.5%", "Loan tenure up to 15 years", "Moratorium period", "Tax benefits available"],
    image: "https://img.freepik.com/free-vector/education-concept-illustration_114360-7891.jpg",
  },
  {
    id: "business",
    title: "Business Loans",
    description: "Fuel your business growth with our tailored financing solutions for small and medium enterprises.",
    icon: <BusinessIcon fontSize="large" />,
    color: "#f9c74f",
    features: ["Interest rates from 11%", "Loan tenure up to 7 years", "Minimal documentation", "Quick disbursement"],
    image: "https://img.freepik.com/free-vector/business-investment-concept-illustration_114360-7620.jpg",
  },
  {
    id: "car",
    title: "Car Loans",
    description: "Drive home your dream car with our affordable car loans offering competitive interest rates.",
    icon: <CarIcon fontSize="large" />,
    color: "#90be6d",
    features: [
      "Interest rates from 7.5%",
      "Loan tenure up to 7 years",
      "Up to 100% financing",
      "No foreclosure charges",
    ],
    image: "https://img.freepik.com/free-vector/car-buying-concept-illustration_114360-7652.jpg",
  },
  {
    id: "agriculture",
    title: "Agriculture Loans",
    description: "Support your farming activities with our specialized agricultural financing options.",
    icon: <FarmIcon fontSize="large" />,
    color: "#43aa8b",
    features: [
      "Interest rates from 7%",
      "Seasonal repayment options",
      "Subsidies available",
      "Flexible collateral requirements",
    ],
    image: "https://img.freepik.com/free-vector/agriculture-concept-illustration_114360-8498.jpg",
  },
]

const LoanServices = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const theme = useTheme()

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  return (
    <Box
      id="loans"
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
              Loan Services
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
              Explore our range of loan options tailored to meet your specific financial needs
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 1.5,
              },
              mb: 4,
            }}
            centered
          >
            {loanTypes.map((loan, index) => (
              <Tab
                key={loan.id}
                label={loan.title}
                icon={loan.icon}
                iconPosition="start"
                sx={{
                  minHeight: 60,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: selectedTab === index ? loan.color : "text.primary",
                  "&.Mui-selected": {
                    color: loan.color,
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={loanTypes[selectedTab].image}
                  alt={loanTypes[selectedTab].title}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h4" component="h3" gutterBottom sx={{ color: loanTypes[selectedTab].color }}>
                    {loanTypes[selectedTab].title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {loanTypes[selectedTab].description}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 2,
                      bgcolor: loanTypes[selectedTab].color,
                      "&:hover": {
                        bgcolor: theme.palette.augmentColor({
                          color: { main: loanTypes[selectedTab].color },
                        }).dark,
                      },
                    }}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Key Features
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {loanTypes[selectedTab].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: loanTypes[selectedTab].color,
                            mr: 2,
                          }}
                        />
                        <Typography variant="body1">{feature}</Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
                <Box sx={{ mt: "auto", pt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      color: loanTypes[selectedTab].color,
                      borderColor: loanTypes[selectedTab].color,
                      "&:hover": {
                        borderColor: theme.palette.augmentColor({
                          color: { main: loanTypes[selectedTab].color },
                        }).dark,
                        bgcolor: `${loanTypes[selectedTab].color}10`,
                      },
                    }}
                  >
                    Check Eligibility
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  )
}

export default LoanServices

