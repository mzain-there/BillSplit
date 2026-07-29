import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axios'

// ── Create Context ────────────────────────────────────
const AuthContext = createContext()

// ── Provider ──────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me')
        setUser(res.data.data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  // Register
  const register = async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData)
    setUser(res.data.data)
    return res.data
  }

  // Login
  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    setUser(res.data.data)
    return res.data
  }

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom Hook ───────────────────────────────────────
export const useAuth = () => useContext(AuthContext)

export default AuthContext