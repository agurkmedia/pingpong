'use client';

import React, { useState, useEffect } from 'react';

export default function PingPongFeeder() {
  const [status, setStatus] = useState('Stopped');
  const [speedPercentage, setSpeedPercentage] = useState(50);
  const [minAngle, setMinAngle] = useState(-45);
  const [maxAngle, setMaxAngle] = useState(45);
  const [fixedAngle, setFixedAngle] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'sweep' | 'fixed'>('sweep');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/servo_status');
      const data = await res.json();
      setStatus(data.start ? 'Running' : 'Stopped');
      setSpeedPercentage(data.speed_percentage);
      setMinAngle(data.min_angle);
      setMaxAngle(data.max_angle);
      setFixedAngle(data.fixed_angle);
      setIsRunning(data.start);
      setMode(data.fixed_angle !== null ? 'fixed' : 'sweep');
    } catch (error) {
      console.error('Error fetching servo status:', error);
    }
  };

  const updateServo = async () => {
    try {
      const res = await fetch('/api/control_servo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: isRunning,
          speed_percentage: speedPercentage,
          min_angle: minAngle,
          max_angle: maxAngle,
          fixed_angle: mode === 'fixed' ? fixedAngle : null,
        }),
      });
      const data = await res.json();
      console.log(data.message);
      fetchStatus();
    } catch (error) {
      console.error('Error updating servo:', error);
    }
  };

  const toggleServo = () => {
    setIsRunning(!isRunning);
    updateServo();
  };

  return (
    <div className="bg-green-100 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Ping Pong Ball Feeder Control</h2>
      <div className="mb-4">
        <span className="font-bold">Status:</span> {status}
      </div>
      <div className="mb-4">
        <label className="block mb-2">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'sweep' | 'fixed')}
          className="w-full p-2 border rounded"
        >
          <option value="sweep">Sweep</option>
          <option value="fixed">Fixed Angle</option>
        </select>
      </div>
      {mode === 'sweep' ? (
        <>
          <div className="mb-4">
            <label className="block mb-2">Speed Percentage:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={speedPercentage}
              onChange={(e) => setSpeedPercentage(Number(e.target.value))}
              className="w-full"
            />
            <span>{speedPercentage}%</span>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Min Angle:</label>
            <input
              type="number"
              value={minAngle}
              onChange={(e) => setMinAngle(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Max Angle:</label>
            <input
              type="number"
              value={maxAngle}
              onChange={(e) => setMaxAngle(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block mb-2">Fixed Angle:</label>
          <input
            type="number"
            value={fixedAngle ?? ''}
            onChange={(e) => setFixedAngle(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
      <button
        onClick={toggleServo}
        className={`${
          isRunning ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
        } text-white font-bold py-2 px-4 rounded`}
      >
        {isRunning ? 'Stop' : 'Start'} Servo
      </button>
      <button
        onClick={updateServo}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
      >
        Update Settings
      </button>
    </div>
  );
}