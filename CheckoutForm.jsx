import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Stripe orqali to'lovni tasdiqlash
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // To'lov muvaffaqiyatli bo'lsa, foydalanuvchi o'tadigan sahifa:
        return_url: `${window.location.origin}/payment-success`, 
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("To'lov muvaffaqiyatli bajarildi!");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Plastik karta orqali to'lov</h3>
      
      {/* Stripe-ning tayyor xavfsiz karta inputlari shu yerga tushadi */}
      <div className="mb-4">
        <PaymentElement />
      </div>

      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50"
      >
        {isProcessing ? "To'lov qilinmoqda..." : `To'lash ($${amount})`}
      </button>

      {message && <div className="text-red-500 mt-3 text-sm text-center font-medium">{message}</div>}
    </form>
  );
}