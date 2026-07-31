import React, { useState } from 'react';
import { CreditCard, ShieldCheck, HelpCircle, Loader2, DollarSign, X } from 'lucide-react';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: 'premium' | 'featured';
  propertyId?: string;
  userId?: string;
  amount?: number;
  onPaymentSuccess: (data: any) => void;
}

export default function PaymentsModal({
  isOpen,
  onClose,
  purpose,
  propertyId,
  userId,
  amount = 5000,
  onPaymentSuccess
}: PaymentsModalProps) {
  const [gateway, setGateway] = useState<'paystack' | 'flutterwave'>('paystack');
  const [cardNumber, setCardNumber] = useState('5399 2144 8700 1254');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('119');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!isOpen) return null;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const apiEndpoint = gateway === 'paystack' ? '/api/payments/paystack' : '/api/payments/flutterwave';

    setTimeout(async () => {
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            propertyId,
            userId,
            amount,
            purpose
          })
        });

        const data = await res.json();
        setIsProcessing(false);
        setSuccess(true);
        
        setTimeout(() => {
          setSuccess(false);
          onPaymentSuccess(data);
          onClose();
        }, 1800);

      } catch (err) {
        console.error('Payment error:', err);
        setIsProcessing(false);
        alert('Transaction failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <div id="payments-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 space-y-1">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">SECURED BILLING PORTAL</span>
          <h3 className="font-display font-bold text-lg text-white">
            {purpose === 'featured' ? 'Boost Property Listing' : 'Upgrade to Premium Subscription'}
          </h3>
          <p className="text-xs text-slate-400 font-light">Simulated Paystack &amp; Flutterwave checkout.</p>
        </div>

        {/* Billing content */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Amount details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">Total Invoice Amount:</span>
              <span className="text-lg font-bold text-slate-900 font-display font-mono">{formatPrice(amount)}</span>
            </div>

            {/* Gateway selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Nigerian Gateway</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGateway('paystack')}
                  className={`py-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    gateway === 'paystack'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Paystack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('flutterwave')}
                  className={`py-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    gateway === 'flutterwave'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Flutterwave</span>
                </button>
              </div>
            </div>

            {/* Simulated Card Fields form */}
            <form onSubmit={handlePaySubmit} className="space-y-3.5">
              
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Debit Card Number</label>
                <input
                  required
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="5399 2200 1144 8700"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Expiry Date</label>
                  <input
                    required
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs font-mono font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">CVV Security Code</label>
                  <input
                    required
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="***"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs font-mono font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Action Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isProcessing || success}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Gateway Pin...</span>
                    </>
                  ) : (
                    <span>Proceed &amp; Pay {formatPrice(amount)}</span>
                  )}
                </button>
              </div>

            </form>

          </div>

          {/* Checkout footer badges */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>PCI-DSS Secured Connection</span>
            </div>
            
            {success && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold animate-pulse text-center">
                🎉 Payment received successfully! Gateways verified.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
