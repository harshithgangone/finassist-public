import axios from "axios"

// Set default base URL for all axios requests
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
console.log("API URL:", API_URL)
axios.defaults.baseURL = API_URL

// Enable credentials for cross-origin requests
axios.defaults.withCredentials = false

// Add request interceptor for handling errors globally
axios.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase() || "GET"} request to: ${config.baseURL}${config.url}`)

    // You can add auth tokens here if needed
    return config
  },
  (error) => {
    console.error("Axios request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for handling errors globally
axios.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error data:", error.response.data)
      console.error("Response error status:", error.response.status)
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message)
    }
    return Promise.reject(error)
  },
)

export default axios

