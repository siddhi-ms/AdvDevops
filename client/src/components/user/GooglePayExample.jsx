import React, { useState } from 'react';
import GooglePayButton from '@google-pay/button-react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GooglePayExample() {
  const [paymentData, setPaymentData] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLoadPaymentData = (paymentRequest) => {
    // Extract a small, display-friendly subset instead of storing the full object
    const pm = paymentRequest?.paymentMethodData || {};
    const info = pm.info || {};
    const tokenization = pm.tokenizationData || {};

    const displayData = {
      cardNetwork: info.cardNetwork || null,
      cardDetails: info.cardDetails || null,
      token: tokenization.token || null,
    };

    // Update backend to mark user as premium
    const tokenAuth = localStorage.getItem('token');
    if (tokenAuth) {
      fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
        body: JSON.stringify({ isPremium: true })
      }).then(async (res) => {
        try {
          const json = await res.json();
          if (res.ok && json.success) {
            // Persist locally and notify other components (navbar)
            localStorage.setItem('isPremium', 'true');
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { isPremium: true } }));
          } else {
            console.error('Failed to update premium status', json);
          }
        } catch (e) {
          console.error('Error parsing response when updating premium status', e);
        }
      }).catch((err) => {
        console.error('Network error updating premium status', err);
      });

    }

    setPaymentData(displayData);
    setSuccess(true);
  };

  const order = {
    id: 'ORD-2025-001',
    description: 'Premium subscription (monthly)',
    amount: '100.00',
    currency: 'INR',
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-200 flex items-start justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Order summary */}
          <div className="md:w-1/2 p-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-gray-800">Confirm your purchase</h3>
            <p className="text-sm text-gray-500 mt-2">Secure checkout powered by Google Pay (TEST)</p>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="font-medium text-gray-800">{order.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">{order.currency} {order.amount}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>• Priority booking & top instructors</p>
                <p>• Exclusive workshops</p>
                <p>• Advanced recommendations</p>
              </div>
            </div>
          </div>

          {/* Payment panel */}
          <div className="md:w-1/2 p-8 flex flex-col items-center justify-center">
            {!success ? (
              <div className="w-full">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Pay with Google Pay</h4>

                <div className="flex items-center justify-center">
                  <GooglePayButton
                    environment="TEST"
                    paymentRequest={{
                      apiVersion: 2,
                      apiVersionMinor: 0,
                      allowedPaymentMethods: [
                        {
                          type: 'CARD',
                          parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                          },
                          tokenizationSpecification: {
                            type: 'PAYMENT_GATEWAY',
                            parameters: {
                              gateway: 'example',
                              gatewayMerchantId: 'exampleGatewayMerchantId',
                            },
                          },
                        },
                      ],
                      merchantInfo: {
                        merchantId: '12345678901234567890',
                        merchantName: 'CollabLearn',
                      },
                      transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPriceLabel: 'Total',
                        totalPrice: order.amount,
                        currencyCode: order.currency,
                        countryCode: 'IN',
                      },
                    }}
                    onLoadPaymentData={handleLoadPaymentData}
                  />
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Test mode — use the Google Pay test card to simulate a transaction.</p>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full p-3">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Payment successful</h3>
                <p className="text-gray-600">Thank you! Your payment was processed through our payment gateway.</p>

                <div className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-500">Payment method</p>
                  <p className="font-medium text-gray-800">
                    {paymentData?.cardNetwork
                      ? `${paymentData.cardNetwork} •••• ${paymentData.cardDetails || ''}`
                      : 'Google Pay'}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm text-gray-700">{order.id}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer">Go to Dashboard</button>
                  {/* <button onClick={() => { setSuccess(false); setPaymentData(null); }} className="px-4 py-2 border rounded-md">Make another payment</button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
