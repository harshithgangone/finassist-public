"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from "@mui/material"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import * as loanService from "../services/loanService"

const COLORS = ["#3a86ff", "#ff6b6b", "#4ecdc4", "#f9c74f", "#90be6d", "#43aa8b", "#577590"]

const LoanDataAnalytics = () => {
  const [loanData, setLoanData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState({
    avgInterestRates: {},
    acceptanceRates: {},
    popularLoanTypes: [],
    avgProcessingFees: {},
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await loanService.fetchLoanData()
        setLoanData(data)

        // Analyze the data
        const analysisResults = loanService.analyzeLoanData(data)
        setAnalytics(analysisResults)
      } catch (error) {
        console.error("Error fetching loan data:", error)
        setError("Failed to load loan data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const prepareInterestRateData = () => {
    return Object.entries(analytics.avgInterestRates).map(([type, rate]) => ({
      name: type,
      value: Number.parseFloat(rate),
    }))
  }

  const prepareAcceptanceRateData = () => {
    return Object.entries(analytics.acceptanceRates)
      .map(([bank, rate]) => ({
        name: bank,
        value: Number.parseFloat(rate),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 banks
  }

  const prepareLoanTypeData = () => {
    return analytics.popularLoanTypes.map((item) => ({
      name: item.type,
      value: item.count,
    }))
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Loan Data Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Analysis based on a sample of {loanData.length} loan records from our dataset.
      </Typography>

      <Grid container spacing={4}>
        {/* Interest Rates by Loan Type */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Interest Rates by Loan Type
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareInterestRateData()} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis label={{ value: "Interest Rate (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Interest Rate"]} />
                    <Legend />
                    <Bar dataKey="value" name="Interest Rate (%)" fill="#3a86ff">
                      {prepareInterestRateData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loan Type Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareLoanTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareLoanTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Acceptance Rates */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 10 Banks by Loan Acceptance Rate
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareAcceptanceRateData()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value}%`, "Acceptance Rate"]} />
                    <Legend />
                    <Bar dataKey="value" name="Acceptance Rate (%)" fill="#ff6b6b">
                      {prepareAcceptanceRateData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Loan Data Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Loan Data Sample
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader aria-label="loan data table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bank Name</TableCell>
                      <TableCell>Loan Type</TableCell>
                      <TableCell align="right">Loan Amount</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell align="right">Tenure (years)</TableCell>
                      <TableCell align="right">EMI</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loanData.slice(0, 10).map((loan, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{loan["Bank Name"]}</TableCell>
                        <TableCell>{loan["Loan Type"]}</TableCell>
                        <TableCell align="right">
                          {loanService.formatCurrency(Number.parseFloat(loan["Loan Amount (INR)"]))}
                        </TableCell>
                        <TableCell align="right">{loan["Interest Rate (%)"]}%</TableCell>
                        <TableCell align="right">{loan["Loan Tenure (years)"]}</TableCell>
                        <TableCell align="right">
                          {loanService.formatCurrency(Number.parseFloat(loan["EMI (INR)"]))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={loan["Loan Status"]}
                            color={loan["Loan Status"] === "Accepted" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                Showing 10 of {loanData.length} records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default LoanDataAnalytics

