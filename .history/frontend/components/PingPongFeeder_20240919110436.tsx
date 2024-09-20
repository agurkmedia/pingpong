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
    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-white">Control Panel</h2>
      
      {/* Camera Feed */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-white">Camera Feed</h3>
        <img src="/api/video_feed" alt="Camera Feed" className="w-full rounded-lg" />
      </div>
      
      <div className="mb-6">
        <span className="font-bold text-white">Status:</span>{' '}
        <span className={`${isRunning ? 'text-green-400' : 'text-red-400'} font-semibold`}>
          {status}
        </span>
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-white">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'sweep' | 'fixed')}
          className="w-full p-2 border rounded bg-white text-black"
        >
          <option value="sweep" className="text-black bg-white">Sweep</option>
          <option value="fixed" className="text-black bg-white">Fixed Angle</option>
        </select>
      </div>
      {mode === 'sweep' ? (
        <>
          <div className="mb-6">
            <label className="block mb-2 text-white">Speed Percentage:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={speedPercentage}
              onChange={(e) => setSpeedPercentage(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-white">{speedPercentage}%</span>
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-white">Min Angle:</label>
            <input
              type="number"
              value={minAngle}
              onChange={(e) => setMinAngle(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white text-black"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-white">Max Angle:</label>
            <input
              type="number"
              value={maxAngle}
              onChange={(e) => setMaxAngle(Number(e.target.value))}
              className="w-full p-2 border rounded bg-white text-black"
            />
          </div>
        </>
      ) : (
        <div className="mb-6">
          <label className="block mb-2 text-white">Fixed Angle:</label>
          <input
            type="number"
            value={fixedAngle ?? ''}
            onChange={(e) => setFixedAngle(Number(e.target.value))}
            className="w-full p-2 border rounded bg-white text-black"
          />
        </div>
      )}
      <div className="flex justify-between">
        <button
          onClick={toggleServo}
          className={`${
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105`}
        >
          {isRunning ? 'Stop' : 'Start'} Servo
        </button>
        <button
          onClick={updateServo}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          Update Settings
        </button>
      </div>
    </div>
  );
}