import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import { API_BASE_URL } from '../config/api';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [placing, setPlacing] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const saveOrder = async (paymentId) => {
    const saveOrderRes = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        products: cartItems,
        totalAmount: totalPrice,
        address,
        paymentId
      })
    });

    if (saveOrderRes.ok) {
  dispatch(clearCart());
  navigate('/ordersuccess', { state: { method: paymentMethod } });
    } else {
      alert('Order saving failed');
    }
    setPlacing(false);
  };

  const handleRazorpayPayment = async () => {
    try {
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert('Could not initialize payment. Please try Cash on Delivery instead.');
        setPlacing(false);
        return;
      }

      const options = {
        key: orderData.key, // real key from backend, not hardcoded
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });

          if (verifyRes.ok) {
            await saveOrder(response.razorpay_payment_id);
          } else {
            alert('Payment verification failed');
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false); // user closed the popup without paying
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      setPlacing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate('/login');
      return;
    }
    setPlacing(true);
    if (paymentMethod === 'cod') {
      saveOrder('COD');
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />

          <h3 style={{ marginTop: '20px' }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay Online (Razorpay)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
          </div>

          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={placing}>
              {placing ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;