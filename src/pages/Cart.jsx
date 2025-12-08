import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TermsAndConditions from '../components/TermsAndConditions'
import axios from 'axios'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const { isAuthenticated, token } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)

  const handleWhatsAppOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      error('El carrito está vacío')
      return
    }

    try {
      // Preparar items de la orden igual que ProductCard
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Sin especificar',
        selectedColor: item.selectedColor || 'Sin especificar'
      }))

      const total = getCartTotal()

      // Registrar orden en backend
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

        // Construir mensaje WhatsApp con detalles de la orden
        const telefono = "+573054412261"
        const orderId = response.data.orderId
        let mensaje = `Hola, estoy en Áurea Virtual Shop y quiero confirmar mi compra 🛍️\n\n*Número de Orden:* #${orderId}\n\n*Productos:*\n`
        
        cartItems.forEach((item, index) => {
          mensaje += `${index + 1}. *${item.name}* x${item.quantity} = $${(item.price * item.quantity).toLocaleString('es-CO')}\n`
          if (item.selectedSize) mensaje += `   📏 Talla: ${item.selectedSize}\n`
          if (item.selectedColor) mensaje += `   🎨 Color: ${item.selectedColor}\n`
        })

        mensaje += `\n*Total:* $${total.toLocaleString('es-CO')}\n\nPor favor, indícame cómo proceder con el pago.`

        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
        window.open(url, "_blank")

        // Limpiar carrito después de abrir WhatsApp
        clearCart()
      }
    } catch (err) {
      error(`Error al registrar orden: ${err.response?.data?.error || err.response?.data?.message || err.message}`)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container-custom text-center">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">Agrega productos para comenzar tu compra</p>
          <Link to="/" className="btn btn-primary">
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center border-b last:border-b-0 p-6">
                  <img 
                    src={item.image || '/images/placeholder.jpg'} 
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-grow ml-6">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    {item.selectedSize && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Talla:</span> {item.selectedSize}
                      </p>
                    )}
                    {item.selectedColor && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Color:</span> {item.selectedColor}
                      </p>
                    )}
                    <p className="text-primary font-bold mt-1">
                      ${item.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={clearCart}
              className="mt-4 text-red-500 hover:text-red-700 font-medium"
            >
              <i className="fas fa-trash mr-2"></i>
              Vaciar carrito
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Calculado al finalizar</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>${getCartTotal().toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full btn bg-green-500 text-white hover:bg-green-600 mb-3"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Ordenar por WhatsApp
              </button>

              <Link to="/" className="block text-center text-primary hover:underline mb-4">
                Continuar comprando
              </Link>

              {/* Términos y Condiciones */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTerms(true)}
                  className="w-full text-sm text-gray-600 hover:text-primary transition flex items-center justify-center"
                >
                  <i className="fas fa-file-contract mr-2"></i>
                  Ver Términos y Condiciones
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Al realizar el pedido, aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  )
}

export default Cart
