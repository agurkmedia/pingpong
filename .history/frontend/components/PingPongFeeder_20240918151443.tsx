'use client';

import { useState, useEffect } from 'react';

export default function PingPongFeeder() {
  const [status, setStatus] = useState('Loading...');
  const [ballsRemaining, setBallsRemaining] = useState(0);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const res = await fetch('/api/proxy/feeder-status');
    const data = await res.json();
    setStatus(data.status);
    setBallsRemaining(data.balls_remaining);
  };

  const feedBall = async () => {
    const res = await fetch('/api/proxy/feed-ball', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setBallsRemaining(prev => prev - 1);
    }
  };

  // ... (rest of the component remains unchanged)
}