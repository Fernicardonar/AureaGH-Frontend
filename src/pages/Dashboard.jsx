import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getMyFavorites } from '../services/authService'
import ProductCard from '../components/ProductCard'
import axios from 'axios'

const Dashboard = () => {
  const { user, token } = useAuth()
  const [favLoading, setFavLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyFavorites()
        // viene como { favorites: [productos...] }
        setFavorites(data.favorites || [])
      } catch (e) {
        setFavorites([])
      } finally {
        setFavLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setOrders(response.data || [])
      } catch (e) {
        console.error('Error al cargar pedidos:', e)
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    if (token) {
      loadOrders()
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Mi Cuenta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.nombre}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <hr className="mb-4" />
              <nav className="space-y-2">
                <a href="#" className="block py-2 px-4 rounded-md bg-primary text-white">
                  <i className="fas fa-user mr-2"></i>
                  Perfil
                </a>
                <a href="#" className="block py-2 px-4 rounded-md hover:bg-gray-100">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  Mis Pedidos
                </a>
                <a href="#favoritos" className="block py-2 px-4 rounded-md hover:bg-gray-100">
                  <i className="fas fa-heart mr-2"></i>
                  Favoritos
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Información Personal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={user?.nombre || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={user?.telefono || 'No registrado'}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pedidos Recientes</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-shopping-bag text-4xl mb-3"></i>
                  <p>No tienes pedidos registrados aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">ID Orden</th>
                        <th className="px-4 py-3 text-left font-semibold">Productos</th>
                        <th className="px-4 py-3 text-left font-semibold">Total</th>
                        <th className="px-4 py-3 text-left font-semibold">Método</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{order._id.substring(0, 8)}</td>
                          <td className="px-4 py-3 text-xs">
                            <div className="space-y-1">
                              {order.orderItems?.slice(0, 2).map((item, idx) => (
                                <div key={idx}>
                                  {item.name} x{item.quantity}
                                  {item.size && ` (${item.size})`}
                                </div>
                              ))}
                              {order.orderItems?.length > 2 && (
                                <div className="text-gray-500">+{order.orderItems.length - 2} más</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            ${order.totalPrice?.toLocaleString('es-CO')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.paymentMethod === 'whatsapp'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.paymentMethod === 'whatsapp' ? 'WhatsApp' : order.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'pendiente_confirmacion'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'pagado'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'enviado'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'entregado'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'cancelado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'pendiente_confirmacion' ? 'Pendiente' : order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {new Date(order.createdAt).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Favoritos */}
            <div id="favoritos" className="bg-white rounded-lg shadow-md p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tus Favoritos</h2>
              {favLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="far fa-heart text-4xl mb-3"></i>
                  <p>No has agregado productos a favoritos aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
