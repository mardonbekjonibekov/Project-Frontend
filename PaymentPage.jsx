import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm'; 

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const paymentAmount = 25; // To'lov summasi (Masalan: 25 dollar)

  useEffect(() => {
    // Django backendimizga to'lov niyatini yaratish uchun so'rov yuboramiz
    fetch('http://127.0.0.1:8000/api/gift-certificates/create-payment-intent/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: paymentAmount }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Serverda xatolik yuz berdi");
        }
        return res.json();
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Backenddan clientSecret kelmadi:", data);
        }
      })
      .catch((err) => console.error("Xatolik:", err));
  }, []);

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' }, 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm amount={paymentAmount} />
          </Elements>
        ) : (
          <div className="text-center text-gray-600 font-medium animate-pulse">
            Stripe tizimi yuklanmoqda... Django server bilan aloqa o'rnatilmoqda...
          </div>
        )}
      </div>
    </div>
  );
}
