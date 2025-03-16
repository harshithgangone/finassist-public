const csv = require("csv-parser")
const https = require("https")

// URL of the CSV file
const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bank_loan_status-KnWrWJZnELagdKyOCHVYuElLqzgHS3.csv"

/**
 * Fetches loan data from the CSV file
 * @returns {Promise<Array>} Array of loan records
 */
async function fetchLoanData() {
  return new Promise((resolve, reject) => {
    const results = []

    https
      .get(CSV_URL, (response) => {
        response
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => {
            console.log(`Loaded ${results.length} loan records`)
            resolve(results)
          })
          .on("error", (error) => {
            console.error("Error parsing CSV:", error)
            reject(error)
          })
      })
      .on("error", (error) => {
        console.error("Error fetching CSV:", error)
        reject(error)
      })
  })
}

/**
 * Gets a random sample of records from an array
 * @param {Array} array The array to sample from
 * @param {number} sampleSize The number of records to sample
 * @returns {Array} The sampled records
 */
function getRandomSample(array, sampleSize) {
  if (array.length <= sampleSize) {
    return array
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, sampleSize)
}

/**
 * Gets bank recommendations based on loan amount and type
 * @param {number} loanAmount The requested loan amount
 * @param {string} loanType The type of loan
 * @returns {Promise<Array>} Array of bank recommendations
 */
async function getBankRecommendations(loanAmount, loanType) {
  try {
    const allData = await fetchLoanData()
    const sampleData = getRandomSample(allData, 100)

    // Filter by loan type and amount range (±20%)
    const minAmount = loanAmount * 0.8
    const maxAmount = loanAmount * 1.2

    const filteredData = sampleData.filter((record) => {
      const recordLoanType = record["Loan Type"]
      const recordLoanAmount = Number.parseFloat(record["Loan Amount (INR)"])

      return recordLoanType === loanType && recordLoanAmount >= minAmount && recordLoanAmount <= maxAmount
    })

    // Sort by interest rate (ascending)
    const sortedData = filteredData.sort((a, b) => {
      return Number.parseFloat(a["Interest Rate (%)"]) - Number.parseFloat(b["Interest Rate (%)"])
    })

    // Group by bank and calculate acceptance rate
    const bankStats = {}

    sampleData.forEach((record) => {
      const bank = record["Bank Name"]
      if (!bankStats[bank]) {
        bankStats[bank] = { total: 0, accepted: 0 }
      }

      bankStats[bank].total += 1
      if (record["Loan Status"] === "Accepted") {
        bankStats[bank].accepted += 1
      }
    })

    // Calculate acceptance rates
    Object.keys(bankStats).forEach((bank) => {
      const stats = bankStats[bank]
      stats.acceptanceRate = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0
    })

    // Get top 5 recommendations
    const recommendations = sortedData
      .filter((record, index, self) => index === self.findIndex((r) => r["Bank Name"] === record["Bank Name"]))
      .slice(0, 5)
      .map((record) => ({
        bankName: record["Bank Name"],
        interestRate: record["Interest Rate (%)"],
        processingFee: record["Processing Fee (INR)"],
        emi: record["EMI (INR)"],
        acceptanceRate: bankStats[record["Bank Name"]].acceptanceRate.toFixed(2) + "%",
        loanTenure: record["Loan Tenure (years)"],
      }))

    return recommendations
  } catch (error) {
    console.error("Error getting bank recommendations:", error)
    throw error
  }
}

/**
 * Checks loan eligibility based on user data and loan dataset
 * @param {Object} userData User financial data
 * @returns {Promise<Object>} Eligibility result
 */
async function checkLoanEligibility(userData) {
  try {
    const { loanAmount, loanType, creditScore, annualIncome, yearsInOccupation } = userData

    const allData = await fetchLoanData()
    const sampleData = getRandomSample(allData, 100)

    // Filter by loan type
    const relevantLoans = sampleData.filter((record) => record["Loan Type"] === loanType)

    // Calculate statistics
    const loanAmounts = relevantLoans.map((r) => Number.parseFloat(r["Loan Amount (INR)"]))
    const maxLoanAmount = Math.max(...loanAmounts)
    const avgLoanAmount = loanAmounts.reduce((sum, val) => sum + val, 0) / loanAmounts.length

    // Calculate acceptance rate for similar loans
    const similarLoans = relevantLoans.filter((record) => {
      const recordAmount = Number.parseFloat(record["Loan Amount (INR)"])
      return recordAmount >= loanAmount * 0.8 && recordAmount <= loanAmount * 1.2
    })

    const acceptedCount = similarLoans.filter((r) => r["Loan Status"] === "Accepted").length
    const acceptanceRate = similarLoans.length > 0 ? (acceptedCount / similarLoans.length) * 100 : 0

    // Determine eligibility based on multiple factors
    let isEligible = true
    const reasons = []

    // Check if loan amount is reasonable compared to dataset
    if (loanAmount > maxLoanAmount * 1.5) {
      isEligible = false
      reasons.push("Requested loan amount is significantly higher than typical approved amounts")
    }

    // Check credit score (if provided)
    if (creditScore && creditScore < 650) {
      isEligible = false
      reasons.push("Credit score is below the recommended threshold of 650")
    }

    // Check income to loan ratio (if provided)
    if (annualIncome && loanAmount > annualIncome * 5) {
      isEligible = false
      reasons.push("Loan amount exceeds 5 times your annual income")
    }

    // Check employment stability (if provided)
    if (yearsInOccupation && yearsInOccupation < 2) {
      isEligible = false
      reasons.push("Less than 2 years in current occupation may affect eligibility")
    }

    // Check acceptance rate in dataset
    if (acceptanceRate < 30) {
      isEligible = false
      reasons.push(`Low approval rate (${acceptanceRate.toFixed(2)}%) for similar loans in our dataset`)
    }

    // Get bank recommendations if eligible
    let recommendations = []
    if (isEligible) {
      recommendations = relevantLoans
        .filter((record) => record["Loan Status"] === "Accepted")
        .sort((a, b) => Number.parseFloat(a["Interest Rate (%)"]) - Number.parseFloat(b["Interest Rate (%)"]))
        .filter((record, index, self) => index === self.findIndex((r) => r["Bank Name"] === record["Bank Name"]))
        .slice(0, 3)
        .map((record) => ({
          bankName: record["Bank Name"],
          interestRate: record["Interest Rate (%)"],
          loanTenure: record["Loan Tenure (years)"],
        }))
    }

    return {
      isEligible,
      reasons,
      acceptanceRate: acceptanceRate.toFixed(2) + "%",
      avgLoanAmount: avgLoanAmount.toFixed(2),
      recommendations,
    }
  } catch (error) {
    console.error("Error checking loan eligibility:", error)
    throw error
  }
}

module.exports = {
  fetchLoanData,
  getRandomSample,
  getBankRecommendations,
  checkLoanEligibility,
}

