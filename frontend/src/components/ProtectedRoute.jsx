import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }){
  const { token } = useContext(AuthContext)
  const loc = useLocation()
  if(!token) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}
