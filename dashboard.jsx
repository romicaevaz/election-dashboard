import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { RefreshCw, Pause, Play } from 'lucide-react';

const ElectionDashboard = () => {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const REFRESH_INTERVAL = 30000; // 30 seconds

  const battlegroundStates = [
    'AZ', 'GA', 'MI', 'NV', 'NC', 'PA', 'WI', 'TX', 'IA', 'FL'
  ];

  const fetchData = async () => {
    try {
      const response = await window.fs.readFile('results-president.json');
      const content = new TextDecoder().decode(response);
      const parsedData = JSON.parse(content);
      setData(parsedData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, REFRESH_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStateResult = (stateAbbr) => {
    if (!data || !data.races) return null;
    return data.races.find(race => race.reporting_units[0].state_postal === stateAbbr);
  };

  const formatMargin = (margin) => {
    if (!margin) return '-';
    const sign = margin > 0 ? 'D+' : 'R+';
    return `${sign}${Math.abs(margin).toFixed(1)}`;
  };

  const getLeadingCandidate = (race) => {
    if (!race || !race.reporting_units[0].candidates) return null;
    const candidates = race.reporting_units[0].candidates;
    const maxVotes = Math.max(...candidates.map(c => c.votes.total));
    return candidates.find(c => c.votes.total === maxVotes);
  };

  const getReportingPercentage = (race) => {
    if (!race || !race.reporting_units[0]) return 0;
    const unit = race.reporting_units[0];
    return ((unit.precincts_reporting / unit.precincts_total) * 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">2024 Election Night Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button 
            onClick={fetchData}
            className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Battleground States */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Battleground States</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">State</th>
                <th className="pb-2">Leader</th>
                <th className="pb-2">2024 Margin</th>
                <th className="pb-2">2020 Margin</th>
                <th className="pb-2">Swing</th>
                <th className="pb-2">Reporting</th>
              </tr>
            </thead>
            <tbody>
              {battlegroundStates.map(stateAbbr => {
                const stateResult = getStateResult(stateAbbr);
                const historical = stateResult?.reporting_units[0]?.historical_2020_pres;
                
                return (
                  <tr key={stateAbbr} className="border-b">
                    <td className="py-2 font-medium">{stateAbbr}</td>
                    <td className="py-2">
                      {getLeadingCandidate(stateResult)?.nyt_id === 'harris-k' ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">Harris</span>
                      ) : getLeadingCandidate(stateResult)?.nyt_id === 'trump-d' ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Trump</span>
                      ) : '-'}
                    </td>
                    <td className="py-2">{formatMargin(0)}</td>
                    <td className="py-2">{formatMargin(historical?.margin)}</td>
                    <td className="py-2">-</td>
                    <td className="py-2">{getReportingPercentage(stateResult)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* County Shifts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Largest County Shifts from 2020</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">County</th>
                <th className="pb-2">State</th>
                <th className="pb-2">2024 Margin</th>
                <th className="pb-2">2020 Margin</th>
                <th className="pb-2">Shift</th>
                <th className="pb-2">Reporting</th>
              </tr>
            </thead>
            <tbody>
              {/* Add county shift data here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ElectionDashboard;
