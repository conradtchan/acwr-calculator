import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { LineChart as Running, Plus, Info, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyData {
  mileage: number;
  acwr?: number;
}

const STORAGE_KEY = 'weekly-distance-data';

function App() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [{ mileage: 0 }];
  });

  const calculateACWR = (data: WeeklyData[]): number[] => {
    return data.slice(3).map((_, index) => {
      const acuteLoad = data.slice(index + 3, index + 4).reduce((sum, week) => sum + week.mileage, 0);
      const chronicLoad = data.slice(index, index + 4).reduce((sum, week) => sum + week.mileage, 0) / 4;
      return chronicLoad === 0 ? 0 : Number((acuteLoad / chronicLoad).toFixed(2));
    });
  };

  useEffect(() => {
    const acwrValues = calculateACWR(weeklyData);
    const updatedData = weeklyData.map((week, index) => ({
      ...week,
      acwr: index >= 3 ? acwrValues[index - 3] : undefined
    }));
    setWeeklyData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  }, [weeklyData.map(w => w.mileage).join(',')]);

  const handleMileageChange = (index: number, value: string) => {
    const newValue = Math.max(0, Number(value));
    setWeeklyData(prev => 
      prev.map((week, i) => i === index ? { ...week, mileage: newValue } : week)
    );

    // Add new week if we're at the last input and value is not empty
    if (index === weeklyData.length - 1 && newValue > 0) {
      setWeeklyData(prev => [...prev, { mileage: 0 }]);
    }
  };

  const chartData = {
    labels: weeklyData.map((_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: 'Weekly Distance (km)',
        data: weeklyData.map(week => week.mileage),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'ACWR',
        data: weeklyData.map(week => week.acwr),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const getRiskLevel = (acwr: number | undefined) => {
    if (!acwr) return { text: 'N/A', color: 'text-gray-500' };
    if (acwr < 0.8) return { text: 'Low Load', color: 'text-blue-500' };
    if (acwr <= 1.3) return { text: 'Optimal', color: 'text-green-500' };
    if (acwr <= 1.5) return { text: 'High Risk', color: 'text-orange-500' };
    return { text: 'Very High Risk', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Running className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Acute:Chronic Workload Calculator</h1>
          <p className="text-lg text-gray-600">Track your training load and monitor injury risk</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex items-start space-x-2 mb-6">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
            <div className="text-gray-600">
              <h3 className="font-semibold text-gray-900 mb-2">About the Acute:Chronic Workload Ratio (ACWR)</h3>
              <p className="mb-4">
                The ACWR is a scientifically validated method for monitoring training load and injury risk in athletes. It compares your recent training load (acute load, last week) to your longer-term training load (chronic load, 4-week average). This tool helps you maintain a safe and effective training progression.
              </p>
              <p className="mb-2">
                From <a href="https://doi.org/10.1136/bjsports-2015-095445" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  research by Blanch & Gabbett (2016)
                </a> these risk zones are commonly used:
              </p>
              <ul className="mb-4 list-disc list-inside">
                <li className="text-blue-500">Below 0.8: Undertraining risk</li>
                <li className="text-green-500">0.8 to 1.3: Optimal training zone</li>
                <li className="text-orange-500">1.3 to 1.5: High risk zone</li>
                <li className="text-red-500">Above 1.5: Very high risk zone</li>
              </ul>
              <h4 className="font-semibold text-gray-900 mb-2">How to Use This Tool:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your weekly running distance starting from 4 weeks ago</li>
                <li>A new input field will appear automatically as you enter data</li>
                <li>The ACWR will be calculated after you've entered at least 4 weeks of data</li>
                <li>Monitor the colour-coded risk levels and graph to guide your training</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Weekly Distance Input</h2>
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: Math.ceil(weeklyData.length / 4) }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {weeklyData.slice(rowIndex * 4, (rowIndex + 1) * 4).map((week, index) => {
                  const weekNumber = rowIndex * 4 + index;
                  return (
                    <div key={weekNumber} className="flex items-center space-x-4 p-3 border rounded-lg bg-gray-50">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Week {weekNumber + 1}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={week.mileage}
                            onChange={(e) => handleMileageChange(weekNumber, e.target.value)}
                            className="w-24 p-2 border rounded-md"
                            min="0"
                            placeholder="km"
                          />
                          {week.acwr !== undefined && (
                            <div className="flex-grow">
                              <div className="text-sm">
                                <span className="font-medium">ACWR: {week.acwr}</span>
                                <p className={`text-xs ${getRiskLevel(week.acwr).color}`}>
                                  {getRiskLevel(week.acwr).text}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Training Load Analysis</h2>
          <div className="h-96">
            <Line 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Weekly Distance (km)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'ACWR'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  }
                },
                plugins: {
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Weekly Distance and ACWR Trend'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mt-8">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Caveats</h3>
              <div className="text-gray-600 space-y-4">
                <h4 className="font-semibold">Tool-Specific Limitation</h4>
                <p>This calculator uses distance as a first-order approximation of workload, assuming constant effort per kilometre. This is a significant simplification, as faster workouts (such as interval training or tempo runs) typically incur a greater physiological cost per kilometre than easy runs. For more accurate workload monitoring, consider tracking additional metrics such as duration, intensity, or perceived exertion.</p>

                <p>
                  <a href="https://doi.org/10.48550/arXiv.1907.05326" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Wang et al. (2019)</a> identify several critical limitations of the acute:chronic workload ratio (ACWR) that affect its validity and practical application:
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">1. Mathematical Coupling</h4>
                    <p>The ACWR is a proportion rather than a true measure of change. Including acute load in the chronic load calculation creates artificial limitations and spurious correlations.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">2. Unweighted Averages</h4>
                    <p>The conventional ACWR treats all four weeks of chronic load equally, despite more recent workload having a greater impact on injury risk.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">3. Arbitrary Categorisation</h4>
                    <p>The practice of categorising ACWR into arbitrary "safe" and "high-risk" zones can lead to information loss and bias in injury risk models.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">4. Low ACWR Risk Interpretation</h4>
                    <p>The correlation between low ACWR values and higher injury risk may be due to early-week injuries creating artificially low ACWR values, rather than a true causal relationship.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">5. External Factors</h4>
                    <p>Many external factors (recovery status, fatigue, etc.) influence injury risk but aren't accounted for in ACWR models, potentially leading to misinterpretation.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">6. Recurrent Injuries</h4>
                    <p>The ACWR doesn't account for prior injuries, which influence an athlete's load tolerance. Modified models are needed for tracking workload in athletes recovering from injuries.</p>
                  </div>
                </div>
                
                <p className="mt-4 text-sm italic">
                  Given these limitations, this tool should be used as one of many indicators in your training management strategy, not as a sole determinant of training decisions. Consider working with a qualified coach who can provide comprehensive guidance based on multiple factors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;