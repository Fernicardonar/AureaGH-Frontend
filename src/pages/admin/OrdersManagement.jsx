import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import axios from 'axios'

const OrdersManagement = () => {
  const { user, token, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pendiente_confirmacion')

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders()
    }
  }, [isAuthenticated, user, filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Filtrar órdenes por status
      const filtered = response.data.filter(order => 
        filterStatus === 'todos' ? true : order.status === filterStatus
      )
      setOrders(filtered)
    } catch (err) {
      error('Error al cargar órdenes: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      success(`Orden actualizada a ${newStatus}`)
      
      // Si marca como entregado, eliminar de la lista (pero permanece en DB)
      if (newStatus === 'entregado') {
        setOrders(orders.filter(o => o._id !== orderId))
      } else {
        // Actualizar orden en la lista
        setOrders(orders.map(o => o._id === orderId ? response.data : o))
      }
    } catch (err) {
      error('Error al actualizar orden: ' + (err.response?.data?.message || err.message))
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso denegado</h2>
          <p className="text-gray-600">Solo administradores pueden acceder a esta sección</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Órdenes</h1>

        {/* Filtros */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setFilterStatus('pendiente_confirmacion')}
            className={`px-4 py-2 rounded ${
              filterStatus === 'pendiente_confirmacion'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Pendientes de Confirmación
          </button>
          <button
            onClick={() => setFilterStatus('pagado')}
            className={`px-4 py-2 rounded ${
              filterStatus === 'pagado'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Pagadas
          </button>
          <button
            onClick={() => setFilterStatus('enviado')}
            className={`px-4 py-2 rounded ${
              filterStatus === 'enviado'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Enviadas
          </button>
          <button
            onClick={() => setFilterStatus('cancelado')}
            className={`px-4 py-2 rounded ${
              filterStatus === 'cancelado'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Canceladas
          </button>
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-4 py-2 rounded ${
              filterStatus === 'todos'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todas
          </button>
        </div>

        {/* Tabla de órdenes */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            No hay órdenes con este estado
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">ID Orden</th>
                  <th className="px-6 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-3 text-left font-semibold">Productos</th>
                  <th className="px-6 py-3 text-left font-semibold">Total</th>
                  <th className="px-6 py-3 text-left font-semibold">Método</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">{order._id.substring(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.user?.nombre || 'Sin nombre'}</p>
                        <p className="text-gray-600 text-xs">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x{item.quantity}
                            {item.size && ` (${item.size})`}
                            {item.color && ` - ${item.color}`}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${order.totalPrice?.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        order.paymentMethod === 'whatsapp'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.paymentMethod === 'whatsapp' ? 'WhatsApp' : order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        order.status === 'pendiente_confirmacion'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'enviado'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'cancelado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pendiente_confirmacion' ? 'Pendiente' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {order.status === 'pendiente_confirmacion' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'pagado')}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Confirmar Pago
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelado')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {order.status === 'pagado' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'enviado')}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Marcar Enviado
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelado')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {order.status === 'enviado' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'entregado')}
                              className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600"
                            >
                              Marcar Entregado
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelado')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersManagement
