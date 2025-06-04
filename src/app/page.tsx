'use client';

import { useState, useEffect } from 'react';
import { PaymentService, PAYMENT_PLANS } from '@/lib/paymentService';
import type { User } from '@/lib/types';

export default function HomePage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    index: number;
    title: string;
    price: string;
    type: 'single' | 'daily' | 'weekly' | 'monthly';
  } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const user = await PaymentService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const openPaymentModal = () => {
    setShowPaymentModal(true);
    setSelectedPayment(null);
    setError('');
    setSuccess('');
  };

  const openCodeModal = () => {
    setShowCodeModal(true);
    setShowPaymentModal(false);
    setError('');
    setSuccess('');
  };

  const selectPaymentPlan = (index: number, type: 'single' | 'daily' | 'weekly' | 'monthly') => {
    const plan = PAYMENT_PLANS[index];
    setSelectedPayment({
      index,
      title: `Ishyura ${plan.price} RWF ${plan.description}`,
      price: `${plan.price} RWF`,
      type,
    });
  };

  const confirmPayment = async () => {
    if (!phoneNumber || !selectedPayment) {
      setError('Nyabuneka andika nimero yawe ya terefone');
      return;
    }

    setIsProcessing(true);
    setError('');
    setPaymentStatus('Gutangiza kwishyura...');

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          planType: selectedPayment.type,
          paymentMethod: phoneNumber.startsWith('078') || phoneNumber.startsWith('079') ? 'MTN' : 'AIRTEL',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setPaymentId(data.payment.id);
      setPaymentStatus('Kwishyura byatangiye. Reba message kuri terefone yawe...');

      // Poll for payment status
      pollPaymentStatus(data.payment.id);

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Habayeho ikosa mu kwishyura');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentId }),
        });

        const data = await response.json();

        if (response.ok && data.payment) {
          const payment = data.payment;

          if (payment.status === 'completed') {
            setPaymentStatus(`Kwishyura byakunze! Code yawe ni: ${payment.accessCode}`);
            setSuccess(`Kwishyura byakunze! Code yawe ni: ${payment.accessCode}`);
            setIsProcessing(false);

            // Auto-login the user
            setTimeout(() => {
              setShowPaymentModal(false);
              setPhoneNumber('');
              setSelectedPayment(null);
              setCode(payment.accessCode || '');
              openCodeModal();
            }, 3000);

            return;
          }
          if (payment.status === 'failed') {
            setError('Kwishyura ntibwatanze. Nyabuneka ugerageze ukundi.');
            setIsProcessing(false);
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setError('Igihe cyarenze. Nyabuneka ugerageze ukundi.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setError('Habayeho ikosa mu gukurikirana kwishyura.');
          setIsProcessing(false);
        }
      }
    };

    poll();
  };

  const codeLogin = async () => {
    if (!code) {
      setError('Nyabuneka andika code yawe');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/auth/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setCurrentUser(data.user);
      setSuccess('Mwariho mwiza! Mushobora gutangira ikizamini.');
      setShowCodeModal(false);
      setCode('');

    } catch (error) {
      console.error('Code login error:', error);
      setError(error instanceof Error ? error.message : 'Code ntiyemewe cyangwa yarangiye.');
    } finally {
      setIsProcessing(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await PaymentService.logout();
      setCurrentUser(null);
      setSuccess('');
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModals = () => {
    setShowPaymentModal(false);
    setShowCodeModal(false);
    setSelectedPayment(null);
    setIsProcessing(false);
    setError('');
    setSuccess('');
    setPaymentStatus('');
  };

  const startTest = () => {
    // Redirect to test page (to be implemented)
    alert('Ikizamini kizatangura vuba! (Test functionality to be implemented)');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Gutegereza...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    const hasValidAccess = PaymentService.checkUserAccess(currentUser);

    return (
      <div className="min-h-screen">
        {/* Traffic Signs Banner */}
        <div className="w-full h-20 bg-green-500 flex items-center justify-center overflow-hidden">
          <img
            src="https://ext.same-assets.com/4025680469/2437364055.jpeg"
            alt="Traffic Signs Banner"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* User Dashboard */}
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            backgroundImage: 'url("https://ext.same-assets.com/4025680469/2635618551.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <img
                src="/mwalimu-clement-logo.svg"
                alt="MWALIMU Clement Logo"
                className="w-32 h-32 mx-auto mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/200x200?text=LOGO';
                }}
              />
              <h1 className="text-2xl font-bold text-blue-800">MWALIMU Clement</h1>
              <p className="text-gray-600">Online Driving Test Platform</p>
            </div>

            <div className="border-t border-b py-4 my-4">
              <div className="mb-2">
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{currentUser.phone}</span>
              </div>
              {currentUser.subscriptionType && (
                <>
                  <div className="mb-2">
                    <span className="text-gray-600">Subscription:</span>
                    <span className="ml-2 font-medium capitalize">{currentUser.subscriptionType}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-600">Expires:</span>
                    <span className="ml-2 font-medium">
                      {currentUser.subscriptionExpiry
                        ? new Date(currentUser.subscriptionExpiry).toLocaleString('en-GB')
                        : 'N/A'}
                    </span>
                  </div>
                </>
              )}
              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    hasValidAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {hasValidAccess ? 'Bishyurwa' : 'Ntibishyurwa'}
                </span>
              </div>
            </div>

            {hasValidAccess ? (
              <button
                onClick={startTest}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
              >
                Tangira Ikizamini
              </button>
            ) : (
              <button
                onClick={openPaymentModal}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4"
              >
                Ishyura kongere
              </button>
            )}

            <button
              onClick={logout}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Sohoka
            </button>

            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
            {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Traffic Signs Banner */}
      <div className="w-full h-20 bg-green-500 flex items-center justify-center overflow-hidden">
        <img
          src="https://ext.same-assets.com/4025680469/2437364055.jpeg"
          alt="Traffic Signs Banner"
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Main Content */}
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url("https://ext.same-assets.com/4025680469/2635618551.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <img
              src="/mwalimu-clement-logo.svg"
              alt="MWALIMU Clement Logo"
              className="w-32 h-32 mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/200x200?text=LOGO';
              }}
            />
            <h1 className="text-2xl font-bold text-blue-800">MWALIMU Clement</h1>
            <p className="text-gray-600">Online Driving Test Platform</p>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-2 gap-4">
            {PAYMENT_PLANS.map((plan, index) => (
              <div
                key={plan.type}
                className="border rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() => selectPaymentPlan(index, plan.type)}
              >
                <div className="text-2xl font-bold text-blue-800">{plan.price} RWF</div>
                <div className="text-gray-600">{plan.description}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={openPaymentModal}
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ishyura utangire
            </button>
            <button
              onClick={openCodeModal}
              className="border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Koresha code
            </button>
          </div>

          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mt-4 text-green-600 text-center">{success}</div>}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help? Call +250787179869</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} MWALIMU Clement</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ishyura</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <div className="mb-4">
              <p className="mb-2">Hitamo uburyo bwo kwishyura:</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_PLANS.map((plan, index) => (
                  <div
                    key={plan.type}
                    className={`border rounded p-2 text-center cursor-pointer ${
                      selectedPayment?.index === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => selectPaymentPlan(index, plan.type)}
                  >
                    <div className="font-bold">{plan.price} RWF</div>
                    <div className="text-sm text-gray-600">{plan.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPayment && (
              <>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                    Nimero ya telefone:
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="078XXXXXXX"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Uzohererezwa ubutumwa kuri iyi numero
                  </p>
                </div>

                <div className="mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">Uburyo bwo Kwishyura:</div>
                    <div className="text-sm">
                      {phoneNumber.startsWith('078') || phoneNumber.startsWith('079')
                        ? 'MTN Mobile Money'
                        : phoneNumber.startsWith('073') || phoneNumber.startsWith('072')
                        ? 'Airtel Money'
                        : 'Mobile Money'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-medium text-white ${
                    isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? 'Gutegereza...' : selectedPayment.title}
                </button>
              </>
            )}

            {paymentStatus && <div className="mt-4 text-center text-blue-600">{paymentStatus}</div>}
            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
            {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          </div>
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Koresha Code</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Andika code yawe:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <button
              onClick={codeLogin}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg font-medium text-white ${
                isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Gutegereza...' : 'Emeza Code'}
            </button>

            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
            {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
