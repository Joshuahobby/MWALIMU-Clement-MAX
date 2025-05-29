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

  useEffect(() => {
    // Check if user is already logged in
    const user = PaymentService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
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
      setPaymentStatus('Kwishyura kuzatangura. Reba message kuri terefone yawe...');

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

  const logout = () => {
    PaymentService.logout();
    setCurrentUser(null);
    setSuccess('');
    setError('');
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
              />
              <h5 className="text-lg font-semibold mb-2 text-green-600">
                Mwiriwe mwiza! Muri mwariho.
              </h5>
              <div className="text-gray-600 space-y-1">
                <p><strong>Terefone:</strong> {currentUser.phone}</p>
                <p><strong>Subscription:</strong> {currentUser.subscriptionType}</p>
                {currentUser.subscriptionExpiry && (
                  <p><strong>Expires:</strong> {new Date(currentUser.subscriptionExpiry).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {hasValidAccess ? (
              <div className="space-y-4">
                <button
                  onClick={startTest}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-medium"
                >
                  Tangira Ikizamini
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium"
                >
                  Gusohoka
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 text-center">Subscription yawe yarangiye. Nyabuneka wishyure ukongere.</p>
                <button
                  onClick={() => { logout(); openPaymentModal(); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
                >
                  Wishyure Ukongere
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium"
                >
                  Gusohoka
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 py-4">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <span>© 2025. <span className="text-blue-600">Online test</span> by <span className="text-blue-600">MWALIMU Clement</span></span>
            <span className="ml-8">Support ☎ +250787179869</span>
          </div>
        </footer>
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
          <p className="text-blue-600 text-center mb-4">
            Support ☎ +250787179869
          </p>

          <div className="text-center mb-6">
            <img
              src="/mwalimu-clement-logo.svg"
              alt="MWALIMU Clement Logo"
              className="w-32 h-32 mx-auto mb-4"
            />
            <h5 className="text-lg font-semibold mb-2">
              Imenyereze gukora ikizamini cya provisoire mu buryo bwa Online.
            </h5>
            <div className="text-gray-600 space-y-1">
              <p>Kwimenyereza byoroshye !.</p>
              <p><strong><i>Ikizamini kimwe ni 100 RWF gusa.</i></strong></p>
              <p><strong><i>Umunsi wose ni 1,000 RWF gusa.</i></strong></p>
              <p><strong><i>Icyumweru cyose ni 4,000 RWF gusa.</i></strong></p>
              <p><strong><i>Ukwezi kwose ni 10,000 RWF gusa.</i></strong></p>
              <p>Urashobora gukora ikizamini mururimi ushaka (Kinyarwanda, Icyongereza cyangwa Igifaransa)</p>
              <p>Wakwishyura ukoresheje MTN mobile money cyangwa Airtel Money</p>
            </div>
          </div>

          {/* Display success/error messages */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={openPaymentModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex-1"
            >
              Ishyura utangire
            </button>
            <button
              onClick={openCodeModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex-1"
            >
              Koresha code
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            {!selectedPayment && !isProcessing && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Hitamo uburyo bwo kwishyura</h3>
                  <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
                </div>

                <button
                  onClick={openCodeModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
                >
                  Koresha code
                </button>

                <div className="space-y-3">
                  {PAYMENT_PLANS.map((plan, index) => (
                    <button
                      key={`plan-${plan.type}-${index}`}
                      onClick={() => selectPaymentPlan(index, plan.type)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-left"
                    >
                      Ishyura {plan.price} RWF {plan.description}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPayment && !isProcessing && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Emeza kwishyura</h3>
                  <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
                </div>

                <h4 className="text-center mb-4">{selectedPayment.title}</h4>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Andika nimero yawe ya terefone hano ... (078xxxxxxx)"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="[0-9]{10}"
                  minLength={10}
                />

                <div className="flex gap-3">
                  <button
                    onClick={confirmPayment}
                    disabled={!phoneNumber}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded"
                  >
                    Emeza
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                  >
                    Subira inyuma
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center p-4">
                <div className="mb-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
                <p className="text-blue-600 mb-2">{paymentStatus}</p>
                {paymentStatus.includes('Reba message') && (
                  <p className="text-sm text-gray-600">
                    Kanda *182*7*1# wishyure (MTN) cyangwa *500# (Airtel)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Koresha code</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>

            <h4 className="text-center mb-4">Andika numero yo kwiyandikisha (code)</h4>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Andika code yawe hano..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={codeLogin}
              disabled={!code || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded"
            >
              {isProcessing ? 'Kwinjira...' : 'Injira →'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <span>© 2025. <span className="text-blue-600">Online test</span> by <span className="text-blue-600">MWALIMU Clement</span></span>
          <span className="ml-8">Support ☎ +250787179869</span>
        </div>
      </footer>
    </div>
  );
}
