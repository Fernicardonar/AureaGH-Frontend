import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import axios from 'axios'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { isAuthenticated, token } = useAuth()
  const { isFavorite, toggleFavorite, loaded } = useFavorites()
  const { success, info, error } = useToast()
  const navigate = useNavigate()

  const handleAddToCart = () => {
    addToCart(product)
    success(`${product.name} agregado al carrito ✓`)
  }

  const handleWhatsApp = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      console.log('[ProductCard WhatsApp] Token:', token ? token.substring(0, 20) + '...' : 'NO DISPONIBLE')
      console.log('[ProductCard WhatsApp] isAuthenticated:', isAuthenticated)

      // Crear orden solo con el producto actual (sin carrito)
      const orderItems = [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        selectedSize: 'Sin especificar',
        selectedColor: 'Sin especificar'
      }]

      const total = product.price

      // Register order in backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/whatsapp/create`,
        {
          cartItems: orderItems,
          total: total,
          shippingAddress: 'A definir en WhatsApp'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        success(`Orden ${response.data.orderId} registrada ✓. Por favor, envía tu comprobante de pago en WhatsApp.`)

        // Build WhatsApp message with order details
        const telefono = "+573054412261"
        const orderId = response.data.orderId
        const cartSummary = orderItems
          .map(item => `• ${item.name} x${item.quantity} = $${(item.price * item.quantity).toLocaleString('es-CO')}`)
          .join('\n')

        const mensaje = `Hola, estoy en Áurea Virtual Shop y quiero confirmar mi compra 🛍️

*Número de Orden:* #${orderId}

*Productos:*
${cartSummary}

*Total:* $${total.toLocaleString('es-CO')}

Por favor, indícame cómo proceder con el pago.`

        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
        window.open(url, "_blank")
      }
    } catch (err) {
      console.error('[ProductCard WhatsApp] Error completo:', err)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message
      error(`Error al registrar orden: ${errorMsg}`)
    }
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const isFav = isFavorite(product._id)
    await toggleFavorite(product._id)
    if (isFav) {
      info(`${product.name} eliminado de favoritos`)
    } else {
      success(`${product.name} agregado a favoritos ♥`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
  <Link to={`/producto/${product._id}`} className="block relative group">
        <img 
          src={product.image || '/images/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.badge}
          </span>
        )}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleFavorite}
            title={isAuthenticated ? (isFavorite(product._id) ? 'Quitar de favoritos' : 'Agregar a favoritos') : 'Inicia sesión para guardar favoritos'}
            className={`bg-white p-2 rounded-full shadow-md hover:bg-gray-100 mb-2 ${isFavorite(product._id) ? 'text-red-500' : 'text-gray-700'}`}
          >
            <i className={`${isFavorite(product._id) ? 'fas' : 'far'} fa-heart`}></i>
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/producto/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        
        <div className="mb-2">
          {Number(product.originalPrice) > 0 && (
            <span className="text-gray-400 line-through mr-2">
              ${Number(product.originalPrice).toLocaleString('es-CO')}
            </span>
          )}
          <span className="text-xl font-bold text-primary">
            ${product.price.toLocaleString('es-CO')}
          </span>
        </div>

        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, index) => (
            <i 
              key={index}
              className={`fas fa-star text-sm ${
                index < Math.floor(product.rating || 4) 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            ></i>
          ))}
          <span className="text-gray-600 text-sm ml-2">({product.rating || 4.0})</span>
        </div>

        <div className="flex flex-col space-y-2">
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary w-full text-sm"
          >
            <i className="fas fa-shopping-cart mr-2"></i>
            Agregar al Carrito
          </button>
          <button 
            onClick={handleWhatsApp}
            className="btn bg-green-500 text-white hover:bg-green-600 w-full text-sm"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Comprar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
