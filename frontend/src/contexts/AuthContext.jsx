"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { app } from "../firebase/config"
import axios from "axios"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)

  async function signup(email, password, name) {
    try {
      console.log("Signing up user:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
      })

      // Remove Firestore document creation
      // Instead, just rely on the backend API call

      // Create user in backend
      console.log("Creating user in backend:", user.uid)
      try {
        const response = await axios.post("/api/users", {
          uid: user.uid,
          email: user.email,
          displayName: name,
        })
        console.log("User created in backend successfully:", response.data)
      } catch (error) {
        console.error("Error creating user in backend:", error)
        // Continue even if backend creation fails
      }

      return user
    } catch (error) {
      console.error("Error in signup:", error)
      throw error
    }
  }

  function login(email, password) {
    console.log("Logging in user:", email)
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function googleSignIn() {
    try {
      console.log("Starting Google sign in")
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("Google sign in successful:", user.uid)

      // Remove Firestore document creation
      // Instead, just rely on the backend API call

      // Create or update user in backend
      console.log("Creating/updating user in backend:", user.uid)
      try {
        const response = await axios.post("/api/users", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
        console.log("User created/updated in backend successfully:", response.data)
      } catch (error) {
        console.error("Error creating/updating user in backend:", error)
        // Continue even if backend creation fails
      }

      return user
    } catch (error) {
      console.error("Error in Google sign in:", error)
      throw error
    }
  }

  function logout() {
    console.log("Logging out user")
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.uid : "No user")

      if (user) {
        // Create or update user in backend when auth state changes
        try {
          console.log("Creating/updating user in backend on auth state change:", user.uid)
          const response = await axios.post("/api/users", {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
          console.log("User created/updated in backend successfully on auth state change:", response.data)
        } catch (error) {
          console.error("Error creating/updating user in backend on auth state change:", error)
          // Continue even if backend creation fails
        }
      }

      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [auth])

  const value = {
    currentUser,
    signup,
    login,
    logout,
    googleSignIn,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

