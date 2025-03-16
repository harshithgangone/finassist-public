"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Slider,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  Paper,
} from "@mui/material"
import { motion } from "framer-motion"
import { PieChart } from "recharts"
import { Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const LoanCalculator = () => {
  const theme = useTheme()
  const [loanAmount, setLoanAmount] = useState(500000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTerm, setLoanTerm] = useState(20)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  useEffect(() => {
    calculateLoan()
  }, [loanAmount, interestRate, loanTerm])

  const calculateLoan = () => {
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12
    // Convert years to months
    const termMonths = loanTerm * 12

    if (monthlyRate === 0) {
      setMonthlyPayment(loanAmount / termMonths)
    } else {
      // Calculate monthly payment using the loan formula
      const x = Math.pow(1 + monthlyRate, termMonths)
      const monthly = (loanAmount * x * monthlyRate) / (x - 1)
      setMonthlyPayment(monthly)
    }

    // Calculate total payment and interest
    const totalPay = monthlyPayment * termMonths
    setTotalPayment(totalPay)
    setTotalInterest(totalPay - loanAmount)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const pieData = [
    { name: "Principal", value: loanAmount, color: theme.palette.primary.main },
    { name: "Interest", value: totalInterest, color: theme.palette.secondary.main },
  ]

  return (
    <Box
      id="calculator"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.paper",
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
              Loan Calculator
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
              Plan your finances with our interactive loan calculator
            </Typography>
          </motion.div>
        </Box>

        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          elevation={3}
          sx={{ borderRadius: 4, overflow: "hidden" }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom variant="h6">
                    Loan Amount: {formatCurrency(loanAmount)}
                  </Typography>
                  <Slider
                    value={loanAmount}
                    onChange={(_, newValue) => setLoanAmount(newValue)}
                    min={100000}
                    max={10000000}
                    step={50000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatCurrency(value)}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <TextField
                    value={loanAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (!isNaN(value)) setLoanAmount(value)
                    }}
                    type="number"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom variant="h6">
                    Interest Rate: {interestRate}%
                  </Typography>
                  <Slider
                    value={interestRate}
                    onChange={(_, newValue) => setInterestRate(newValue)}
                    min={4}
                    max={20}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <TextField
                    value={interestRate}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (!isNaN(value)) setInterestRate(value)
                    }}
                    type="number"
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography gutterBottom variant="h6">
                    Loan Term: {loanTerm} years
                  </Typography>
                  <Slider
                    value={loanTerm}
                    onChange={(_, newValue) => setLoanTerm(newValue)}
                    min={1}
                    max={30}
                    step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} years`}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <TextField
                    value={loanTerm}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (!isNaN(value)) setLoanTerm(value)
                    }}
                    type="number"
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">years</InputAdornment>,
                    }}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Button variant="contained" color="primary" size="large" onClick={calculateLoan} sx={{ mt: 2 }}>
                  Calculate
                </Button>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="h5" gutterBottom color="primary">
                    Loan Summary
                  </Typography>

                  <Box sx={{ mb: 3, mt: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Monthly Payment
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formatCurrency(monthlyPayment)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Principal
                      </Typography>
                      <Typography variant="h6">{formatCurrency(loanAmount)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Interest
                      </Typography>
                      <Typography variant="h6" color="secondary.main">
                        {formatCurrency(totalInterest)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Payment
                    </Typography>
                    <Typography variant="h6">{formatCurrency(totalPayment)}</Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default LoanCalculator

