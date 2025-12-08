import React from 'react'
import { useToast } from '../context/ToastContext'

export default function Toast() {
  const { toasts, removeToast } = useToast()

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColor[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in max-w-sm`}
        >
          <span className="text-lg font-bold">{icon[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
