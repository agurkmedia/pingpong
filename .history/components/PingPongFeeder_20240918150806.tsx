'use client';

import { useState, useEffect } from 'react';

export default function PingPongFeeder() {
  const [status, setStatus] = useState('Loading...');
  const [ballsRemaining, setBallsRemaining] = useState(0);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const res = await fetch('/api/feeder-status');
    const data = await res.json();
    setStatus(data.status);
    setBallsRemaining(data.balls_remaining);
  };

  const feedBall = async () => {
    const res = await fetch('/api/feed-ball', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setBallsRemaining(prev => prev - 1);
    }
  };

  return (
    <div className="bg-green-100 p-8 rounded-lg shadow-lg">
      <div className="mb-4">
        <span className="font-bold">Status:</span> {status}
      </div>
      <div className="mb-4">
        <span className="font-bold">Balls Remaining:</span> {ballsRemaining}
      </div>
      <div className="relative w-64 h-64 bg-gray-300 rounded-full overflow-hidden mb-4">
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 transition-all duration-300" style={{height: `${(ballsRemaining / 50) * 100}%`}}></div>
      </div>
      <button
        onClick={feedBall}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Feed Ball
      </button>
    </div>
  );
}