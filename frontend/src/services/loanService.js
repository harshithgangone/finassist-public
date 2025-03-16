import axios from "axios"

/**
 * Fetches loan data from the backend
 * @returns {Promise<Array>} Array of loan records
 */
export const fetchLoanData = async () => {
  try {
    const response = await axios.get("/api/loan-data")
    return response.data.data
  } catch (error) {
    console.error("Error fetching loan data:", error)
    throw error
  }
}

/**
 * Gets bank recommendations based on loan amount and type
 * @param {number} loanAmount The requested loan amount
 * @param {string} loanType The type of loan
 * @returns {Promise<Array>} Array of bank recommendations
 */
export const getBankRecommendations = async (loanAmount, loanType) => {
  try {
    const response = await axios.post("/api/loan-recommendations", {
      loanAmount,
      loanType,
    })
    return response.data.recommendations
  } catch (error) {
    console.error("Error getting bank recommendations:", error)
    throw error
  }
}

/**
 * Checks loan eligibility based on user data
 * @param {Object} userData User financial data
 * @returns {Promise<Object>} Eligibility result
 */
export const checkLoanEligibility = async (userData) => {
  try {
    const response = await axios.post("/api/loan-eligibility", userData)
    return response.data
  } catch (error) {
    console.error("Error checking loan eligibility:", error)
    throw error
  }
}

/**
 * Formats currency values to Indian Rupee format
 * @param {number} value The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Analyzes loan data to provide insights
 * @param {Array} loanData Array of loan records
 * @returns {Object} Analysis results
 */
export const analyzeLoanData = (loanData) => {
  if (!loanData || loanData.length === 0) {
    return {
      avgInterestRates: {},
      acceptanceRates: {},
      popularLoanTypes: [],
      avgProcessingFees: {},
    }
  }

  // Calculate average interest rates by loan type
  const interestRatesByType = {}
  const countByType = {}

  // Calculate acceptance rates by bank
  const bankStats = {}

  // Count loan types
  const loanTypeCounts = {}

  // Calculate average processing fees by bank
  const processingFeesByBank = {}
  const bankCounts = {}

  loanData.forEach((loan) => {
    const loanType = loan["Loan Type"]
    const bankName = loan["Bank Name"]
    const interestRate = Number.parseFloat(loan["Interest Rate (%)"])
    const processingFee = Number.parseFloat(loan["Processing Fee (INR)"])
    const status = loan["Loan Status"]

    // Interest rates by loan type
    if (!isNaN(interestRate)) {
      if (!interestRatesByType[loanType]) {
        interestRatesByType[loanType] = 0
        countByType[loanType] = 0
      }
      interestRatesByType[loanType] += interestRate
      countByType[loanType]++
    }

    // Bank acceptance rates
    if (!bankStats[bankName]) {
      bankStats[bankName] = { total: 0, accepted: 0 }
    }
    bankStats[bankName].total++
    if (status === "Accepted") {
      bankStats[bankName].accepted++
    }

    // Loan type counts
    if (!loanTypeCounts[loanType]) {
      loanTypeCounts[loanType] = 0
    }
    loanTypeCounts[loanType]++

    // Processing fees by bank
    if (!isNaN(processingFee)) {
      if (!processingFeesByBank[bankName]) {
        processingFeesByBank[bankName] = 0
        bankCounts[bankName] = 0
      }
      processingFeesByBank[bankName] += processingFee
      bankCounts[bankName]++
    }
  })

  // Calculate averages
  const avgInterestRates = {}
  Object.keys(interestRatesByType).forEach((type) => {
    avgInterestRates[type] = (interestRatesByType[type] / countByType[type]).toFixed(2)
  })

  // Calculate acceptance rates
  const acceptanceRates = {}
  Object.keys(bankStats).forEach((bank) => {
    const { total, accepted } = bankStats[bank]
    acceptanceRates[bank] = ((accepted / total) * 100).toFixed(2)
  })

  // Sort loan types by popularity
  const popularLoanTypes = Object.keys(loanTypeCounts)
    .map((type) => ({ type, count: loanTypeCounts[type] }))
    .sort((a, b) => b.count - a.count)

  // Calculate average processing fees
  const avgProcessingFees = {}
  Object.keys(processingFeesByBank).forEach((bank) => {
    avgProcessingFees[bank] = (processingFeesByBank[bank] / bankCounts[bank]).toFixed(2)
  })

  return {
    avgInterestRates,
    acceptanceRates,
    popularLoanTypes,
    avgProcessingFees,
  }
}

