import React, { useState } from 'react';
import { Calculator, DollarSign, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function Calculators() {
  const [activeCal, setActiveCal] = useState<'affordability' | 'mortgage'>('affordability');

  // Affordability States
  const [monthlyIncome, setMonthlyIncome] = useState('600000');
  const [cautionDeposit, setCautionDeposit] = useState('150000');
  const [affordResult, setAffordResult] = useState<any>(null);

  // Mortgage States
  const [propertyPrice, setPropertyPrice] = useState('45000000');
  const [downPayment, setDownPayment] = useState('9000000'); // 20%
  const [interestRate, setInterestRate] = useState('18'); // Standard Nigerian rate
  const [loanTerm, setLoanTerm] = useState('15');
  const [mortgageResult, setMortgageResult] = useState<any>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCalculateAffordability = (e: React.FormEvent) => {
    e.preventDefault();
    const income = Number(monthlyIncome) || 0;
    const caution = Number(cautionDeposit) || 0;

    const annualIncome = income * 12;
    // Standard rule: Rent should not exceed 33% of income
    const maxComfortableRent = annualIncome * 0.33;
    
    // Extra fees in Nigeria: 10% Agency, 10% Legal Agreement
    const agencyFee = maxComfortableRent * 0.10;
    const agreementFee = maxComfortableRent * 0.10;
    const totalOutofPocket = maxComfortableRent + agencyFee + agreementFee + caution;

    setAffordResult({
      annualIncome,
      maxComfortableRent,
      agencyFee,
      agreementFee,
      caution,
      totalOutofPocket
    });
  };

  const handleCalculateMortgage = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(propertyPrice) || 0;
    const down = Number(downPayment) || 0;
    const rate = Number(interestRate) || 0;
    const term = Number(loanTerm) || 15;

    const loanAmount = price - down;
    const monthlyRate = (rate / 100) / 12;
    const totalPayments = term * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                       (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }

    const totalRepayments = monthlyPayment * totalPayments;
    const totalInterest = totalRepayments - loanAmount;

    setMortgageResult({
      loanAmount,
      monthlyPayment,
      totalRepayments,
      totalInterest
    });
  };

  return (
    <div id="calculators-root" className="max-w-4xl mx-auto px-4 py-8 pb-24">
      
      {/* Header Panel */}
      <div className="text-center space-y-2 mb-8">
        <h1 id="calculators-heading" className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight flex items-center justify-center space-x-2">
          <Calculator className="h-6 w-6 text-emerald-600" />
          <span>RentNaija Financial Calculators</span>
        </h1>
        <p className="text-slate-500 text-sm font-light max-w-xl mx-auto">
          Calibrated specifically to Nigerian banking interest rates and local leasing fees (Agency, Caution, Legal Agreements).
        </p>
      </div>

      {/* Tabs selectors */}
      <div id="calculator-tabs" className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto mb-8">
        <button
          onClick={() => setActiveCal('affordability')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeCal === 'affordability'
              ? 'bg-white text-slate-800 shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Rent Affordability
        </button>
        <button
          onClick={() => setActiveCal('mortgage')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeCal === 'mortgage'
              ? 'bg-white text-slate-800 shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Mortgage & Land Loans
        </button>
      </div>

      {/* SUB MODULE 1: RENT AFFORDABILITY */}
      {activeCal === 'affordability' && (
        <div id="affordability-panel" className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          {/* Inputs Column */}
          <form onSubmit={handleCalculateAffordability} className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 mb-1">Enter Income Stats</h3>
              <p className="text-[10px] text-slate-400 font-light">Determine budget using standard 30% out-of-pocket ratios.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Average Monthly Income (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">₦</span>
                <input
                  required
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 h-11 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Expected Caution Deposit (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">₦</span>
                <input
                  type="number"
                  value={cautionDeposit}
                  onChange={(e) => setCautionDeposit(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 h-11 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/15 transition-all cursor-pointer"
            >
              Analyze Rent Budget
            </button>
          </form>

          {/* Results Column */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
            {affordResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recommended Annual Rent</h4>
                  <p className="text-2xl font-bold text-slate-900 font-display mt-0.5">{formatPrice(affordResult.maxComfortableRent)}</p>
                  <p className="text-[10px] text-slate-400 font-light">Safe, comfortable and won&apos;t trigger financial strain.</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs font-medium space-y-2">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Naija Agency Fee (10%):</span>
                    <span className="text-slate-700">{formatPrice(affordResult.agencyFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Legal Agreement Fee (10%):</span>
                    <span className="text-slate-700">{formatPrice(affordResult.agreementFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Caution Deposit:</span>
                    <span className="text-slate-700">{formatPrice(affordResult.caution)}</span>
                  </div>
                  <div className="flex justify-between pt-3 font-bold text-slate-900 border-t border-slate-200">
                    <span>Total Out-of-pocket Cash Needed:</span>
                    <span className="text-emerald-700">{formatPrice(affordResult.totalOutofPocket)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-150 rounded-xl text-[10px] text-slate-500 font-light flex gap-2">
                  <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Before signing any tenancy agreement, ask agents to verify if there are separate water charges or estate security service fees!</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-8">
                <Calculator className="h-10 w-10 text-slate-200" />
                <p className="text-xs font-light">Click calculate to generate custom Nigerian out-of-pocket leasing reports.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB MODULE 2: MORTGAGE CALCULATOR */}
      {activeCal === 'mortgage' && (
        <div id="mortgage-panel" className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          {/* Inputs Column */}
          <form onSubmit={handleCalculateMortgage} className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 mb-1">Down Payment & Interest Rate</h3>
              <p className="text-[10px] text-slate-400 font-light">Commercial land loan or home mortgage amortizations.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Property Purchase Price (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">₦</span>
                <input
                  required
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 h-11 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Down Payment (₦)</label>
                <input
                  required
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Interest Rate (%)</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Loan Term (Years)</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800"
              >
                <option value="5">5 Years</option>
                <option value="10">10 Years</option>
                <option value="15">15 Years</option>
                <option value="20">20 Years</option>
                <option value="25">25 Years</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Analyze Mortgage
            </button>
          </form>

          {/* Results Column */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
            {mortgageResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Amortization</h4>
                  <p className="text-2xl font-bold text-emerald-700 font-display mt-0.5">{formatPrice(mortgageResult.monthlyPayment)}</p>
                  <p className="text-[10px] text-slate-400 font-light">Expected monthly banking billing.</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs font-medium space-y-2">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Loan Principal Amount:</span>
                    <span className="text-slate-700">{formatPrice(mortgageResult.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Total Accumulative Interest:</span>
                    <span className="text-red-600">{formatPrice(mortgageResult.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-3 font-bold text-slate-900 border-t border-slate-200">
                    <span>Total Cumulative Payments:</span>
                    <span>{formatPrice(mortgageResult.totalRepayments)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-150 rounded-xl text-[10px] text-slate-500 font-light flex gap-2">
                  <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mortgage interest rates in Nigeria fluctuate depending on Central Bank policy. Consult with FMBN (Federal Mortgage Bank) for National Housing Fund subsidies!</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-8">
                <Calculator className="h-10 w-10 text-slate-200" />
                <p className="text-xs font-light">Click calculate to generate monthly bank payment statistics.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
