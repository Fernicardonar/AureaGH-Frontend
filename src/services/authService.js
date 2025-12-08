import api from './api'

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData)
  return response.data
}

export const getMyFavorites = async () => {
  const response = await api.get('/auth/favorites')
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPassword = async (resetToken, password) => {
  const response = await api.put(`/auth/reset-password/${resetToken}`, { password })
  return response.data
}
