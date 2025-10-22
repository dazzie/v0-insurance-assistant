'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  name: string;
  state: string;
  location: string;
  vehicle: string;
  coverage: string;
  drivingRecord: string;
  carriers: string[];
  avgMonthly: number;
}

interface DatasetSummary {
  total: number;
  byState: Record<string, number>;
  byVehicle: Record<string, number>;
  byCoverage: Record<string, number>;
}

export default function AgentDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use the new DOI data API endpoint
      const response = await fetch('/api/doi-data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch DOI data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Invalid data format');
      }
      
      // Profiles are already processed by the API
      setProfiles(data.profiles);

      // Use summary from API
      setSummary(data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (selectedState !== 'all' && p.state !== selectedState) return false;
    if (selectedCoverage !== 'all' && p.coverage !== selectedCoverage) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleProfileSelection = (id: string) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(selectedProfiles.filter(pid => pid !== id));
    } else {
      setSelectedProfiles([...selectedProfiles, id]);
    }
  };

  const getComparisonData = () => {
    return profiles.filter(p => selectedProfiles.includes(p.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DOI Reference Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">Official DOI Reference Data & Market Intelligence</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCompareMode(!compareMode)}
                className={compareMode ? 'bg-blue-600' : 'bg-gray-600'}
              >
                {compareMode ? '📊 Compare Mode: ON' : '📊 Compare Mode'}
              </Button>
              <Button onClick={loadData} className="bg-green-600">
                🔄 Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-sm text-blue-600 font-semibold mb-1">Total Profiles</div>
              <div className="text-3xl font-bold text-blue-900">{summary.total}</div>
              <div className="text-xs text-blue-600 mt-2">Official DOI Data</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-sm text-green-600 font-semibold mb-1">States Covered</div>
              <div className="text-3xl font-bold text-green-900">
                {Object.keys(summary.byState).length}
              </div>
              <div className="text-xs text-green-600 mt-2">
                {Object.entries(summary.byState).map(([s, c]) => `${s}(${c})`).join(', ')}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-sm text-purple-600 font-semibold mb-1">Coverage Types</div>
              <div className="text-3xl font-bold text-purple-900">
                {Object.keys(summary.byCoverage).length}
              </div>
              <div className="text-xs text-purple-600 mt-2">
                {Object.keys(summary.byCoverage).join(', ')}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="text-sm text-orange-600 font-semibold mb-1">Vehicle Types</div>
              <div className="text-3xl font-bold text-orange-900">
                {Object.keys(summary.byVehicle).length}
              </div>
              <div className="text-xs text-orange-600 mt-2">
                {Object.keys(summary.byVehicle).join(', ')}
              </div>
            </Card>
          </div>
        )}

        {/* Filters & Search */}
        <Card className="p-6 mb-6 bg-white shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Profiles
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, vehicle, or location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All States</option>
                {summary && Object.keys(summary.byState).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Coverage
              </label>
              <select
                value={selectedCoverage}
                onChange={(e) => setSelectedCoverage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Coverage</option>
                {summary && Object.keys(summary.byCoverage).map(coverage => (
                  <option key={coverage} value={coverage}>{coverage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <strong>{filteredProfiles.length}</strong> of <strong>{profiles.length}</strong> profiles
            </div>
            {compareMode && selectedProfiles.length > 0 && (
              <div className="text-blue-600 font-semibold">
                {selectedProfiles.length} profiles selected for comparison
              </div>
            )}
          </div>
        </Card>

        {/* Comparison View */}
        {compareMode && selectedProfiles.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Side-by-Side Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Profile</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Vehicle</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Coverage</th>
                    <th className="text-right py-2 px-4 font-semibold text-gray-700">Avg Monthly</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Carriers</th>
                  </tr>
                </thead>
                <tbody>
                  {getComparisonData().map(profile => (
                    <tr key={profile.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{profile.name}</div>
                        <div className="text-xs text-gray-500">{profile.location}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{profile.vehicle}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {profile.coverage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ${profile.avgMonthly}/mo
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {profile.carriers.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile: any) => (
            <Card
              key={profile.id}
              className={`p-6 bg-white hover:shadow-xl transition-all cursor-pointer ${
                compareMode && selectedProfiles.includes(profile.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : ''
              }`}
              onClick={() => compareMode && toggleProfileSelection(profile.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{profile.name}</h3>
                  <p className="text-sm text-gray-600">📍 {profile.location}</p>
                </div>
                {compareMode && (
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedProfiles.includes(profile.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedProfiles.includes(profile.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">🚗</span>
                  <span className="ml-2 text-gray-700">{profile.vehicle}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">📋</span>
                  <span className="ml-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {profile.coverage}
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">✓</span>
                  <span className="ml-2 text-gray-700">{profile.drivingRecord}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Avg Monthly Premium</span>
                  <span className="text-2xl font-bold text-gray-900">${profile.avgMonthly}</span>
                </div>

                <div className="text-xs text-gray-600 mb-2">
                  <strong>{profile.carriers.length}</strong> carriers available:
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.carriers.map((carrier: string) => (
                    <span
                      key={carrier}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {carrier}
                    </span>
                  ))}
                </div>
              </div>

              {!compareMode && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`View detailed rates for ${profile.name}`);
                  }}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  View Details
                </Button>
              )}
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No profiles found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </Card>
        )}
      </div>
    </div>
  );
}

