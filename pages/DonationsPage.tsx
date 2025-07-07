import React, { useState } from 'react';

const DonationsPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThankYou(true);
    setAmount('');
  };

  const isValidAmount = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 py-16 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4 text-center">Support Quality Education</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Your donation helps us empower more students and expand access to quality learning resources. Every contribution makes a difference!
        </p>
        <form className="w-full flex flex-col items-center" onSubmit={handleDonate}>
          <input
            type="number"
            min="1"
            placeholder="Enter amount (USD)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:outline-none text-lg text-center"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-red-600 hover:to-red-700 transition-all text-lg mb-2 disabled:opacity-50"
            disabled={!isValidAmount}
          >
            Donate
          </button>
          <span className="text-xs text-gray-400">* Payment integration coming soon</span>
        </form>
        {showThankYou && (
          <div className="mt-6 bg-green-100 border border-green-300 text-green-800 rounded-xl px-6 py-4 text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p>Your generous donation will help us reach more learners and improve education for all.</p>
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              onClick={() => setShowThankYou(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsPage; 