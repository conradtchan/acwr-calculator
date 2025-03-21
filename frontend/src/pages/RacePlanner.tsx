import React, { useState, useCallback } from 'react';
import { Timer, Info, AlertTriangle, Plus, Minus, Mountain } from 'lucide-react';

interface Split {
  id: string;
  distance: number;
  paceAdjustment: number; // Now in seconds, positive means slower, negative means faster
  isHilly: boolean;
  description: string;
}

interface Break {
  id: string;
  type: 'drink' | 'toilet' | 'crowd';
  duration: number; // seconds
  distance: number;
  description: string;
}

interface RaceDistance {
  name: string;
  distance: number;
  defaultSplits: number;
}

type DistanceUnit = 'km' | 'mi';

const KM_TO_MI = 0.621371;
const MI_TO_KM = 1.60934;

const commonRaces: RaceDistance[] = [
  { name: '5K', distance: 5, defaultSplits: 2 },
  { name: '10K', distance: 10, defaultSplits: 2 },
  { name: 'Half Marathon', distance: 21.1, defaultSplits: 3 },
  { name: 'Marathon', distance: 42.2, defaultSplits: 4 },
  { name: '50K', distance: 50, defaultSplits: 5 },
];

function RacePlanner() {
  const [unit, setUnit] = useState<DistanceUnit>('km');
  const [targetDistance, setTargetDistance] = useState<number>(42.2);
  const [basePace, setBasePace] = useState<{ minutes: number; seconds: number }>({ minutes: 5, seconds: 30 });
  const [splits, setSplits] = useState<Split[]>([
    { id: '1', distance: 21.1, paceAdjustment: 0, isHilly: false, description: 'First half' },
    { id: '2', distance: 21.1, paceAdjustment: 30, isHilly: false, description: 'Second half' } // 30s slower per km/mi
  ]);
  const [breaks, setBreaks] = useState<Break[]>([
    { id: '1', type: 'crowd', duration: 30, distance: 0, description: 'Start line crowding' },
    { id: '2', type: 'drink', duration: 15, distance: 5, description: 'First water station' },
    { id: '3', type: 'drink', duration: 15, distance: 10, description: 'Second water station' },
    { id: '4', type: 'toilet', duration: 120, distance: 15, description: 'Toilet break' }
  ]);

  const convertDistance = (distance: number, from: DistanceUnit, to: DistanceUnit): number => {
    if (from === to) return distance;
    return from === 'km' ? distance * KM_TO_MI : distance * MI_TO_KM;
  };

  const convertPace = (pace: { minutes: number; seconds: number }, from: DistanceUnit, to: DistanceUnit): { minutes: number; seconds: number } => {
    if (from === to) return pace;
    const totalSeconds = (pace.minutes * 60) + pace.seconds;
    const convertedSeconds = from === 'km' 
      ? totalSeconds / KM_TO_MI  // km/min to mi/min
      : totalSeconds / MI_TO_KM; // mi/min to km/min
    return {
      minutes: Math.floor(convertedSeconds / 60),
      seconds: Math.floor(convertedSeconds % 60)
    };
  };

  const handleUnitChange = (newUnit: DistanceUnit) => {
    if (newUnit === unit) return;

    // Convert target distance
    const newTargetDistance = convertDistance(targetDistance, unit, newUnit);
    setTargetDistance(Number(newTargetDistance.toFixed(2)));

    // Convert splits distances
    const newSplits = splits.map(split => ({
      ...split,
      distance: Number(convertDistance(split.distance, unit, newUnit).toFixed(2))
    }));
    setSplits(newSplits);

    // Convert break distances
    const newBreaks = breaks.map(brk => ({
      ...brk,
      distance: Number(convertDistance(brk.distance, unit, newUnit).toFixed(2))
    }));
    setBreaks(newBreaks);

    // Convert pace
    setBasePace(convertPace(basePace, unit, newUnit));

    setUnit(newUnit);
  };

  const totalSplitDistance = splits.reduce((sum, split) => sum + split.distance, 0);
  const distanceDifference = targetDistance - totalSplitDistance;

  const setRaceDistance = (race: RaceDistance) => {
    const convertedDistance = unit === 'km' ? race.distance : race.distance * KM_TO_MI;
    setTargetDistance(Number(convertedDistance.toFixed(2)));
    
    // Create new splits based on the race distance
    const splitDistance = convertedDistance / race.defaultSplits;
    const newSplits: Split[] = Array.from({ length: race.defaultSplits }, (_, index) => ({
      id: Date.now().toString() + index,
      distance: Number(splitDistance.toFixed(2)),
      paceAdjustment: index === race.defaultSplits - 1 ? 30 : 0, // 30s slower for last segment
      isHilly: false,
      description: `Split ${index + 1}`
    }));
    
    setSplits(newSplits);
  };

  const addSplit = () => {
    const remainingDistance = Math.max(0, distanceDifference);
    const newSplit: Split = {
      id: Date.now().toString(),
      distance: remainingDistance || (unit === 'km' ? 5 : 3.1),
      paceAdjustment: 0,
      isHilly: false,
      description: `Split ${splits.length + 1}`
    };
    setSplits([...splits, newSplit]);
  };

  const removeSplit = (id: string) => {
    setSplits(splits.filter(split => split.id !== id));
  };

  const addBreak = (type: Break['type']) => {
    const newBreak: Break = {
      id: Date.now().toString(),
      type,
      duration: type === 'drink' ? 15 : type === 'toilet' ? 120 : 30,
      distance: 0,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} break`
    };
    setBreaks([...breaks, newBreak]);
  };

  const removeBreak = (id: string) => {
    setBreaks(breaks.filter(brk => brk.id !== id));
  };

  const calculateTotalTime = useCallback(() => {
    const basePaceSeconds = (basePace.minutes * 60) + basePace.seconds;
    let totalSeconds = 0;

    // Calculate time for each split
    splits.forEach(split => {
      const adjustedPace = basePaceSeconds + split.paceAdjustment; // Simply add the adjustment seconds
      const splitSeconds = (split.distance * 1000 / 1000) * adjustedPace;
      totalSeconds += splitSeconds;
    });

    // Add break times
    breaks.forEach(brk => {
      totalSeconds += brk.duration;
    });

    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: Math.floor(totalSeconds % 60)
    };
  }, [splits, breaks, basePace]);

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${time.hours}:${pad(time.minutes)}:${pad(time.seconds)}`;
  };

  const calculateAdjustedPace = (adjustment: number) => {
    const basePaceSeconds = (basePace.minutes * 60) + basePace.seconds;
    const adjustedSeconds = basePaceSeconds + adjustment; // Simply add the adjustment seconds
    return {
      minutes: Math.floor(adjustedSeconds / 60),
      seconds: Math.floor(adjustedSeconds % 60)
    };
  };

  const formatPace = (pace: { minutes: number; seconds: number }) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pace.minutes}:${pad(pace.seconds)}/${unit}`;
  };

  const formatAdjustment = (seconds: number): string => {
    if (seconds === 0) return '±0s';
    return `${seconds > 0 ? '+' : '-'}${Math.abs(seconds)}s`;
  };

  const totalTime = calculateTotalTime();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Timer className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Race Planner</h1>
          <p className="text-lg text-gray-600">Plan your race strategy with detailed splits and breaks</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex items-start space-x-2 mb-6">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
            <div className="text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">About Race Planning</h3>
              <p>
                Plan your race strategy by breaking it into segments and accounting for various factors that might affect your pace. Add splits for different sections, plan your breaks, and account for hills and crowds to get a realistic finish time estimate.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Base Settings</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUnitChange('km')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      unit === 'km'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Kilometers
                  </button>
                  <button
                    onClick={() => handleUnitChange('mi')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      unit === 'mi'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Miles
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Common Race Distances</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {commonRaces.map((race) => {
                      const distance = unit === 'km' ? race.distance : Number((race.distance * KM_TO_MI).toFixed(2));
                      return (
                        <button
                          key={race.name}
                          onClick={() => setRaceDistance(race)}
                          className={`p-2 text-center border rounded-lg transition-colors ${
                            Math.abs(targetDistance - distance) < 0.01
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{race.name}</div>
                          <div className="text-sm text-gray-500">{distance} {unit}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Distance ({unit})
                    </label>
                    <input
                      type="number"
                      value={targetDistance}
                      onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Pace (min/{unit})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                      <input
                        type="number"
                        value={basePace.minutes}
                        onChange={(e) => setBasePace(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Seconds</label>
                      <input
                        type="number"
                        value={basePace.seconds}
                        onChange={(e) => setBasePace(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min="0"
                        max="59"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Race Splits</h2>
                  <div className={`text-sm mt-1 ${Math.abs(distanceDifference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: {totalSplitDistance.toFixed(1)} {unit}
                    {Math.abs(distanceDifference) >= 0.01 && (
                      <span>
                        {' '}
                        ({distanceDifference > 0 ? '+' : ''}{distanceDifference.toFixed(1)} {unit} from target)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={addSplit}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Split
                </button>
              </div>
              <div className="space-y-4">
                {splits.map((split, index) => (
                  <div key={split.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">Split {index + 1}</h3>
                      <button
                        onClick={() => removeSplit(split.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distance ({unit})</label>
                        <input
                          type="number"
                          value={split.distance}
                          onChange={(e) => {
                            const newSplits = [...splits];
                            newSplits[index].distance = parseFloat(e.target.value) || 0;
                            setSplits(newSplits);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pace Adjustment
                          <span className="text-xs text-gray-500 ml-1">(seconds per {unit})</span>
                        </label>
                        <div className="space-y-1">
                          <input
                            type="number"
                            value={split.paceAdjustment}
                            onChange={(e) => {
                              const newSplits = [...splits];
                              newSplits[index].paceAdjustment = parseInt(e.target.value) || 0;
                              setSplits(newSplits);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <div className="text-sm text-gray-600">
                            {formatAdjustment(split.paceAdjustment)} = {formatPace(calculateAdjustedPace(split.paceAdjustment))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Description & Terrain</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={split.description}
                          onChange={(e) => {
                            const newSplits = [...splits];
                            newSplits[index].description = e.target.value;
                            setSplits(newSplits);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          <span className="text-sm text-gray-500">Hilly terrain</span>
                          <button
                            onClick={() => {
                              const newSplits = [...splits];
                              newSplits[index].isHilly = !newSplits[index].isHilly;
                              setSplits(newSplits);
                            }}
                            className={`p-2 rounded-md flex items-center transition-colors ${
                              split.isHilly 
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title={split.isHilly ? 'Click to mark as flat terrain' : 'Click to mark as hilly terrain'}
                          >
                            <Mountain className="h-4 w-4" />
                            <span className="ml-1 text-xs">
                              {split.isHilly ? 'Hilly' : 'Flat'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {split.isHilly 
                          ? 'This section contains hills - consider adjusting the pace accordingly'
                          : 'Mark this section as hilly if it contains significant elevation changes'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Breaks & Adjustments</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addBreak('drink')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Drink Stop
                  </button>
                  <button
                    onClick={() => addBreak('toilet')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Toilet Break
                  </button>
                  <button
                    onClick={() => addBreak('crowd')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Crowding
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {breaks.map((brk, index) => (
                  <div key={brk.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium">{brk.type.charAt(0).toUpperCase() + brk.type.slice(1)} Break</h3>
                      <button
                        onClick={() => removeBreak(brk.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">At Distance ({unit})</label>
                        <input
                          type="number"
                          value={brk.distance}
                          onChange={(e) => {
                            const newBreaks = [...breaks];
                            newBreaks[index].distance = parseFloat(e.target.value) || 0;
                            setBreaks(newBreaks);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                        <input
                          type="number"
                          value={brk.duration}
                          onChange={(e) => {
                            const newBreaks = [...breaks];
                            newBreaks[index].duration = parseInt(e.target.value) || 0;
                            setBreaks(newBreaks);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={brk.description}
                        onChange={(e) => {
                          const newBreaks = [...breaks];
                          newBreaks[index].description = e.target.value;
                          setBreaks(newBreaks);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Estimated Finish Time</h2>
              <div className="text-5xl font-bold text-blue-600 mb-4">
                {formatTime(totalTime)}
              </div>
              <p className="text-sm text-gray-500">
                This estimate includes your base pace, split adjustments, and all planned breaks.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notes</h3>
              <div className="text-gray-600 space-y-4">
                <p>
                  This planner helps you create a structured race strategy, but remember:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Weather conditions may require adjusting your planned pace</li>
                  <li>Course elevation changes can significantly impact your splits</li>
                  <li>Be flexible with your plan and listen to your body during the race</li>
                  <li>Practice your hydration and nutrition strategy during training</li>
                  <li>Consider adding buffer time for unexpected situations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RacePlanner;