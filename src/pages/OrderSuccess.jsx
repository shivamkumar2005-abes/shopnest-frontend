import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const method = location.state?.method || 'razorpay';
  const isCod = method === 'cod';

  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#10b981' }}>
        {isCod ? 'Order Placed!' : 'Payment Successful!'}
      </h2>
      <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '40px' }}>
        {isCod
          ? 'Thank you for your order. Please keep the exact amount ready — you will pay in cash upon delivery.'
          : 'Thank you for your order. We have securely received your payment and will process your shipment shortly.'}
      </p>
      <Link to="/shop" className="btn">Continue Shopping</Link>
    </div>
  );
};

export default OrderSuccess;