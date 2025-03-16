"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import * as loanService from "../services/loanService"

const LoanInsightsWidget = () => {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const data = await loanService.fetchLoanData()

        // Generate insights from the data
        const analysisResults = loanService.analyzeLoanData(data)
        const generatedInsights = generateInsights(data, analysisResults)

        setInsights(generatedInsights)
      } catch (error) {
        console.error("Error fetching loan insights:", error)
        setError("Failed to load loan insights. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const generateInsights = (data, analysis) => {
    const insights = []

    // Best interest rates
    const interestRates = Object.entries(analysis.avgInterestRates)
    if (interestRates.length > 0) {
      const lowestRate = interestRates.reduce((prev, curr) =>
        Number.parseFloat(prev[1]) < Number.parseFloat(curr[1]) ? prev : curr,
      )

      insights.push({
        type: "positive",
        title: "Best Loan Type for Low Interest",
        text: `${lowestRate[0]} loans currently have the lowest average interest rate at ${lowestRate[1]}%`,
        icon: <TrendingDownIcon />,
      })
    }

    // Highest acceptance rate
    const acceptanceRates = Object.entries(analysis.acceptanceRates)
    if (acceptanceRates.length > 0) {
      const highestAcceptance = acceptanceRates
        .filter(([bank, rate]) => bank.trim() !== "")
        .sort((a, b) => Number.parseFloat(b[1]) - Number.parseFloat(a[1]))[0]

      insights.push({
        type: "positive",
        title: "Bank with Highest Approval Rate",
        text: `${highestAcceptance[0]} has the highest loan approval rate at ${highestAcceptance[1]}%`,
        icon: <CheckCircleIcon />,
      })
    }

    // Most popular loan type
    if (analysis.popularLoanTypes.length > 0) {
      const mostPopular = analysis.popularLoanTypes[0]

      insights.push({
        type: "info",
        title: "Most Popular Loan Type",
        text: `${mostPopular.type} is the most commonly requested loan type in our dataset`,
        icon: <InfoIcon />,
      })
    }

    // Loan amount insights
    const loanAmounts = data.map((loan) => Number.parseFloat(loan["Loan Amount (INR)"]))
    if (loanAmounts.length > 0) {
      const avgAmount = loanAmounts.reduce((sum, val) => sum + val, 0) / loanAmounts.length

      insights.push({
        type: "info",
        title: "Average Loan Amount",
        text: `The average loan amount in our dataset is ${loanService.formatCurrency(avgAmount)}`,
        icon: <InfoIcon />,
      })
    }

    // Rejection insights
    const rejectionReasons = []
    data.forEach((loan) => {
      if (loan["Loan Status"] === "Rejected") {
        // In a real system, you'd have rejection reasons in the data
        // Here we're simulating based on other factors
        const amount = Number.parseFloat(loan["Loan Amount (INR)"])
        const interestRate = Number.parseFloat(loan["Interest Rate (%)"])

        if (amount > 1000000) {
          rejectionReasons.push("High loan amount")
        }
        if (interestRate > 12) {
          rejectionReasons.push("High interest rate")
        }
      }
    })

    if (rejectionReasons.length > 0) {
      // Count occurrences of each reason
      const reasonCounts = {}
      rejectionReasons.forEach((reason) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
      })

      // Find most common reason
      const mostCommonReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]

      insights.push({
        type: "negative",
        title: "Common Rejection Factor",
        text: `"${mostCommonReason[0]}" is a common factor in rejected loan applications`,
        icon: <CancelIcon />,
      })
    }

    return insights
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Loan Market Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {insights.map((insight, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemIcon
                sx={{
                  color:
                    insight.type === "positive"
                      ? "success.main"
                      : insight.type === "negative"
                        ? "error.main"
                        : "info.main",
                }}
              >
                {insight.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1" component="span">
                      {insight.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      color={insight.type === "positive" ? "success" : insight.type === "negative" ? "error" : "info"}
                      sx={{ ml: 1, height: 20 }}
                    />
                  </Box>
                }
                secondary={insight.text}
              />
            </ListItem>
          ))}

          {insights.length === 0 && (
            <ListItem>
              <ListItemText primary="No insights available at this time." />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  )
}

export default LoanInsightsWidget

