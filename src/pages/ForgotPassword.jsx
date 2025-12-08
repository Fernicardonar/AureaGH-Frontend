import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el email de recuperación')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4">
            <div className="mx-auto h-16 w-16 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Enviado</h2>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Revisa tu bandeja de entrada y sigue las instrucciones. El enlace expirará en 10 minutos.
          </p>
          <Link
            to="/login"
            className="block w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Recuperar Contraseña</h2>
            <p className="text-gray-600 mt-2">Ingresa tu email para recibir el enlace de recuperación</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-black"
            >
              ← Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
