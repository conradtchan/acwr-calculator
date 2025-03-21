import React, { useState, useCallback } from 'react';
import { Timer, Info, AlertTriangle } from 'lucide-react';

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

interface Distance {
  value: number;
  unit: 'km' | 'mi';
}

const STORAGE_KEY = 'pace-predictor-data';

function PacePredictor() {
  const [knownDistance, setKnownDistance] = useState<Distance>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData).knownDistance : { value: 5, unit: 'km' };
  });

  const [knownTime, setKnownTime] = useState<Time>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData).knownTime : { hours: 0, minutes: 25, seconds: 0 };
  });

  const [targetDistance, setTargetDistance] = useState<Distance>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData).targetDistance : { value: 10, unit: 'km' };
  });

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      knownDistance,
      knownTime,
      targetDistance
    }));
  }, [knownDistance, knownTime, targetDistance]);

  const calculatePredictedTime = useCallback(() => {
    // Convert everything to kilometers for calculation
    const knownDistanceKm = knownDistance.unit === 'km' 
      ? knownDistance.value 
      : knownDistance.value * 1.60934;
    
    const targetDistanceKm = targetDistance.unit === 'km'
      ? targetDistance.value
      : targetDistance.value * 1.60934;

    // Convert known time to seconds
    const knownTimeSeconds = 
      (knownTime.hours * 3600) + 
      (knownTime.minutes * 60) + 
      knownTime.seconds;

    // Riegel's formula: T2 = T1 * (D2/D1)^1.06
    const predictedSeconds = knownTimeSeconds * Math.pow(targetDistanceKm / knownDistanceKm, 1.06);

    // Convert back to hours, minutes, seconds
    const hours = Math.floor(predictedSeconds / 3600);
    const minutes = Math.floor((predictedSeconds % 3600) / 60);
    const seconds = Math.floor(predictedSeconds % 60);

    return { hours, minutes, seconds };
  }, [knownDistance, knownTime, targetDistance]);

  const predictedTime = calculatePredictedTime();

  const formatTime = (time: Time) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${time.hours > 0 ? `${time.hours}:` : ''}${pad(time.minutes)}:${pad(time.seconds)}`;
  };

  const commonRaces = [
    { name: '5K', distance: 5, unit: 'km' },
    { name: '10K', distance: 10, unit: 'km' },
    { name: 'Half Marathon', distance: 21.1, unit: 'km' },
    { name: 'Marathon', distance: 42.2, unit: 'km' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Timer className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Race Time Predictor</h1>
          <p className="text-lg text-gray-600">Predict your race times using proven mathematical models</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex items-start space-x-2 mb-6">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
            <div className="text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">About Race Time Prediction</h3>
              <p>
                This calculator uses <a href="https://en.wikipedia.org/wiki/Peter_Riegel" target="_blank" rel="noopener noreferrer" className="text-blue-600">Riegel's formula</a>, a well-established method for predicting race times across different distances. The formula accounts for the fact that pace typically slows as distance increases, providing realistic predictions for your target race distance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Known Performance</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Common Race Distances</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonRaces.map((race) => (
                    <button
                      key={race.name}
                      onClick={() => setKnownDistance({ value: race.distance, unit: race.unit as 'km' | 'mi' })}
                      className={`p-2 text-center border rounded-lg transition-colors ${
                        knownDistance.value === race.distance && knownDistance.unit === race.unit
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{race.name}</div>
                      <div className="text-sm text-gray-500">{race.distance} km</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Distance</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={knownDistance.value}
                    onChange={(e) => setKnownDistance(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    step="0.1"
                  />
                  <select
                    value={knownDistance.unit}
                    onChange={(e) => setKnownDistance(prev => ({ ...prev, unit: e.target.value as 'km' | 'mi' }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hours</label>
                    <input
                      type="number"
                      value={knownTime.hours}
                      onChange={(e) => setKnownTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      aria-label="Hours"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      value={knownTime.minutes}
                      onChange={(e) => setKnownTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      max="59"
                      aria-label="Minutes"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Seconds</label>
                    <input
                      type="number"
                      value={knownTime.seconds}
                      onChange={(e) => setKnownTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      max="59"
                      aria-label="Seconds"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Target Race</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Common Race Distances</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonRaces.map((race) => (
                    <button
                      key={race.name}
                      onClick={() => setTargetDistance({ value: race.distance, unit: race.unit as 'km' | 'mi' })}
                      className={`p-2 text-center border rounded-lg transition-colors ${
                        targetDistance.value === race.distance && targetDistance.unit === race.unit
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{race.name}</div>
                      <div className="text-sm text-gray-500">{race.distance} km</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Distance</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={targetDistance.value}
                    onChange={(e) => setTargetDistance(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    step="0.1"
                    placeholder="Enter distance"
                  />
                  <select
                    value={targetDistance.unit}
                    onChange={(e) => setTargetDistance(prev => ({ ...prev, unit: e.target.value as 'km' | 'mi' }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Predicted Time</h3>
                <div className="text-4xl font-bold text-blue-600">
                  {formatTime(predictedTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitations of Race Time Prediction</h3>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h4 className="font-semibold">1. Individual Variability</h4>
                  <p>The formula uses a standard exponent (1.06) that may not accurately reflect your personal running characteristics. Some runners may perform better or worse than predicted, especially at longer distances.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">2. Training Status</h4>
                  <p>Predictions assume you're equally trained for both distances. The formula may overestimate performance if you haven't specifically trained for the target distance, particularly for longer races.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">3. Distance Scaling</h4>
                  <p>Predictions are most accurate when the target distance is within 1-2 times the known distance. Extrapolating from very short to very long distances (e.g., 5K to marathon) may be less reliable.</p>
                </div>
                
                <p className="mt-4 text-sm italic">
                  Use these predictions as general guidance rather than absolute targets. Consider factors like specific training, race conditions, and personal experience when setting race goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PacePredictor;