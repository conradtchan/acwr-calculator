import React from 'react';
import { NotebookText, LineChart, Timer, ArrowRight, Route } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <NotebookText className="h-16 w-16 mx-auto text-blue-600 mb-6" />
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            runners, FYI:
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Evidence-based tools for strategic training
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <a 
            href="/acwr"
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden no-underline"
          >
            <div className="p-8 flex items-start space-x-6">
              <div className="flex-shrink-0">
                <LineChart className="h-12 w-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                  ACWR Calculator
                  <ArrowRight className="h-5 w-5 ml-2 text-blue-600" />
                </h2>
                <p className="text-gray-600">
                  Calculate your Acute:Chronic Workload Ratio (ACWR) to optimize training load and minimize injury risk. Track your weekly mileage and monitor your training progression with evidence-based metrics.
                </p>
              </div>
            </div>
          </a>

          <a 
            href="/pace-predictor"
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden no-underline"
          >
            <div className="p-8 flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Timer className="h-12 w-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                  Race Time Predictor
                  <ArrowRight className="h-5 w-5 ml-2 text-blue-600" />
                </h2>
                <p className="text-gray-600">
                  Predict your race times for any distance using proven mathematical models. Enter a recent race result to get accurate predictions for your target distance.
                </p>
              </div>
            </div>
          </a>

          <a 
            href="/race-planner"
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden no-underline"
          >
            <div className="p-8 flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Route className="h-12 w-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                  Race Planner
                  <ArrowRight className="h-5 w-5 ml-2 text-blue-600" />
                </h2>
                <p className="text-gray-600">
                  Plan your race strategy with detailed splits and breaks. Account for factors like water stops, crowds, and terrain to create a realistic race plan with estimated finish time.
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} runners.fyi - Tools for smarter running
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;