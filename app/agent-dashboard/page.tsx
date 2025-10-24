'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User,
  Eye, 
  Trash2, 
  Calendar, 
  Mail, 
  Car, 
  Home, 
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';

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

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLogin?: string;
  profile: any;
  quotes: any[];
  profileExists: boolean;
  quotesExists: boolean;
  profileUpdatedAt?: string;
  quotesUpdatedAt?: string;
}

export default function AgentDashboard() {
  // DOI Data states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  
  // Admin states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    usersWithProfiles: 0,
    usersWithQuotes: 0
  });
  
  // MCP Testing states
  const [mcpResults, setMcpResults] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [lastMcpTest, setLastMcpTest] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
    loadAdminData();
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

  const loadAdminData = async () => {
    try {
      setAdminLoading(true);
      setAdminError(null);
      
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setAdminUsers(data.users);
        setAdminStats({
          totalUsers: data.totalUsers,
          usersWithProfiles: data.usersWithProfiles,
          usersWithQuotes: data.usersWithQuotes
        });
      } else {
        setAdminError('Failed to load admin data');
      }
    } catch (err) {
      setAdminError('Failed to load admin data');
      console.error('Admin error:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user and all their data?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setAdminUsers(adminUsers.filter(u => u.id !== userId));
        setSelectedUser(null);
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfileSummary = (profile: any) => {
    if (!profile) return 'No profile data';
    
    const items = [];
    if (profile.name) items.push(`Name: ${profile.name}`);
    if (profile.vehicles?.length) items.push(`${profile.vehicles.length} vehicle(s)`);
    if (profile.riskAssessment) items.push('Risk assessed');
    if (profile.policyAnalysis) items.push('Policy analyzed');
    
    return items.length > 0 ? items.join(', ') : 'Basic profile';
  };

  const testMcpServers = async (useCustomerData = false) => {
    setMcpLoading(true);
    setMcpError(null);
    
    try {
      let testData = {};
      
      // Use selected customer data if available and requested
      if (useCustomerData && selectedUser?.profile) {
        const profile = selectedUser.profile;
        testData = {
          // Vehicle data
          vin: profile.vehicles?.[0]?.vin,
          // Address data
          address: profile.address || `${profile.city || ''} ${profile.state || ''} ${profile.zipCode || ''}`.trim(),
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          // Coordinates if available
          latitude: profile.addressEnrichment?.latitude || profile.latitude,
          longitude: profile.addressEnrichment?.longitude || profile.longitude
        };
        console.log('[MCP Test] Using customer data for testing:', testData);
      }
      
      const response = await fetch('/api/test-enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMcpResults({
          ...data.results,
          testedWith: useCustomerData ? 'customer' : 'default',
          customerName: useCustomerData ? selectedUser?.name || selectedUser?.email : null
        });
        setLastMcpTest(new Date());
      } else {
        setMcpError('Failed to test MCP servers');
      }
    } catch (error) {
      setMcpError('Error testing MCP servers');
      console.error('MCP test error:', error);
    } finally {
      setMcpLoading(false);
    }
  };

  const getMcpServerStatus = (serverData: any) => {
    if (!serverData) return { status: 'unknown', color: 'gray' };
    if (serverData.success) return { status: 'working', color: 'green' };
    return { status: 'error', color: 'red' };
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
              <p className="text-gray-600 mt-1">DOI Reference Data, Market Intelligence & User Management</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {loadData(); loadAdminData();}} className="bg-green-600">
                🔄 Refresh All Data
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="doi-data" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="doi-data" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              DOI Reference Data
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="mcp-testing" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              MCP Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doi-data" className="space-y-6">
            {/* DOI Data Tab Content */}
            <div className="space-y-6">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setCompareMode(!compareMode)}
                  className={compareMode ? 'bg-blue-600' : 'bg-gray-600'}
                >
                  {compareMode ? '📊 Compare Mode: ON' : '📊 Compare Mode'}
                </Button>
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
                        ${Math.round(profile.avgMonthly)}/mo
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
                  <span className="text-2xl font-bold text-gray-900">${Math.round(profile.avgMonthly)}</span>
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
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            {/* Admin Tab Content */}
            {adminError && (
              <Card className="border-destructive">
                <div className="p-6">
                  <p className="text-destructive">{adminError}</p>
                </div>
              </Card>
            )}

            {/* Admin Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-600 font-semibold mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-blue-900">{adminStats.totalUsers}</div>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-600 font-semibold mb-1">With Profiles</div>
                    <div className="text-3xl font-bold text-green-900">{adminStats.usersWithProfiles}</div>
                    <div className="text-xs text-green-600 mt-1">
                      {adminStats.totalUsers > 0 ? Math.round((adminStats.usersWithProfiles / adminStats.totalUsers) * 100) : 0}% of users
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-600 font-semibold mb-1">With Quotes</div>
                    <div className="text-3xl font-bold text-purple-900">{adminStats.usersWithQuotes}</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {adminStats.totalUsers > 0 ? Math.round((adminStats.usersWithQuotes / adminStats.totalUsers) * 100) : 0}% of users
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="lg:col-span-1">
                <Card>
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      All Users ({adminUsers.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Click on a user to view their details
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {adminLoading ? (
                      <div className="p-6 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading users...</p>
                      </div>
                    ) : adminUsers.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        No users found
                      </div>
                    ) : (
                      adminUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedUser?.id === user.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {user.name || 'Unnamed User'}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Joined {formatDate(user.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {user.profileExists && (
                                <Badge variant="secondary" className="text-xs">
                                  Profile
                                </Badge>
                              )}
                              {user.quotesExists && (
                                <Badge variant="outline" className="text-xs">
                                  Quotes
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* User Details */}
              <div className="lg:col-span-2">
                {selectedUser ? (
                  <Card>
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            {selectedUser.name || 'User Details'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.email} • ID: {selectedUser.id}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(selectedUser.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="quotes">Quotes</TabsTrigger>
                          <TabsTrigger value="raw">Raw Data</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Account Info</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Email:</span>
                                  <span className="font-mono">{selectedUser.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Name:</span>
                                  <span>{selectedUser.name || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Created:</span>
                                  <span>{formatDate(selectedUser.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Last Login:</span>
                                  <span>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Data Summary</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {selectedUser.profileExists ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  <span className="text-sm">
                                    Profile: {selectedUser.profileExists ? 'Complete' : 'None'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedUser.quotesExists ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  <span className="text-sm">
                                    Quotes: {selectedUser.quotesExists ? `${selectedUser.quotes.length} saved` : 'None'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {selectedUser.profile && (
                            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">Profile Summary</h4>
                              <p className="text-sm text-muted-foreground">
                                {getProfileSummary(selectedUser.profile)}
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="profile" className="space-y-4 mt-4">
                          {selectedUser.profileExists ? (
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div>
                                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Personal Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2">{selectedUser.profile.name || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Age:</span>
                                    <span className="ml-2">{selectedUser.profile.age || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="ml-2">{selectedUser.profile.email || 'Not provided'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="ml-2">{selectedUser.profile.phone || 'Not provided'}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Address:</span>
                                    <span className="ml-2">
                                      {selectedUser.profile.address || 
                                       `${selectedUser.profile.city || ''} ${selectedUser.profile.state || ''} ${selectedUser.profile.zipCode || ''}`.trim() || 
                                       'Not provided'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Vehicles */}
                              {selectedUser.profile.vehicles && selectedUser.profile.vehicles.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    Vehicles ({selectedUser.profile.vehicles.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedUser.profile.vehicles.map((vehicle: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-medium">
                                              {vehicle.year} {vehicle.make} {vehicle.model}
                                            </p>
                                            {vehicle.vin && (
                                              <p className="text-xs text-muted-foreground">VIN: {vehicle.vin}</p>
                                            )}
                                          </div>
                                          {vehicle.enriched && (
                                            <Badge variant="secondary" className="text-xs">
                                              NHTSA Enriched
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Risk Assessments */}
                              {selectedUser.profile.riskAssessment && (
                                <div>
                                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Risk Assessments
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    {selectedUser.profile.riskAssessment.floodRisk && (
                                      <div className="p-2 bg-blue-50 rounded">
                                        <span className="font-medium">Flood Risk:</span>
                                        <span className="ml-2">{selectedUser.profile.riskAssessment.floodRisk.floodFactor || 'N/A'}</span>
                                      </div>
                                    )}
                                    {selectedUser.profile.riskAssessment.crimeRisk && (
                                      <div className="p-2 bg-red-50 rounded">
                                        <span className="font-medium">Crime Risk:</span>
                                        <span className="ml-2">{selectedUser.profile.riskAssessment.crimeRisk.crimeIndex || 'N/A'}</span>
                                      </div>
                                    )}
                                    {selectedUser.profile.riskAssessment.earthquakeRisk && (
                                      <div className="p-2 bg-yellow-50 rounded">
                                        <span className="font-medium">Earthquake Risk:</span>
                                        <span className="ml-2">{selectedUser.profile.riskAssessment.earthquakeRisk.earthquakeRisk || 'N/A'}</span>
                                      </div>
                                    )}
                                    {selectedUser.profile.riskAssessment.wildfireRisk && (
                                      <div className="p-2 bg-orange-50 rounded">
                                        <span className="font-medium">Wildfire Risk:</span>
                                        <span className="ml-2">{selectedUser.profile.riskAssessment.wildfireRisk.wildfireRisk || 'N/A'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No profile data available</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="quotes" className="space-y-4 mt-4">
                          {selectedUser.quotesExists && selectedUser.quotes.length > 0 ? (
                            <div className="space-y-4">
                              {selectedUser.quotes.map((quoteSession: any, sessionIdx: number) => (
                                <div key={sessionIdx} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">
                                      Quote Session {sessionIdx + 1}
                                    </h4>
                                    <Badge variant="outline">
                                      {quoteSession.quotes?.length || 0} quotes
                                    </Badge>
                                  </div>
                                  
                                  {quoteSession.quotes && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {quoteSession.quotes.map((quote: any, quoteIdx: number) => (
                                        <div key={quoteIdx} className="p-3 bg-muted/30 rounded">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{quote.carrierName}</p>
                                              <p className="text-sm text-muted-foreground">
                                                ${quote.monthlyPremium}/mo
                                              </p>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                              {quote.rating}★
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No quotes available</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="raw" className="space-y-4 mt-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">User Account</h4>
                              <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify({
                                  id: selectedUser.id,
                                  email: selectedUser.email,
                                  name: selectedUser.name,
                                  createdAt: selectedUser.createdAt,
                                  lastLogin: selectedUser.lastLogin
                                }, null, 2)}
                              </pre>
                            </div>

                            {selectedUser.profile && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Profile Data</h4>
                                <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-64">
                                  {JSON.stringify(selectedUser.profile, null, 2)}
                                </pre>
                              </div>
                            )}

                            {selectedUser.quotes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Quotes Data</h4>
                                <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-64">
                                  {JSON.stringify(selectedUser.quotes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Select a user to view their details</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mcp-testing" className="space-y-6">
            {/* MCP Testing Tab Content */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">MCP Server Testing</h3>
                <p className="text-sm text-muted-foreground">
                  Test and monitor all MCP registry servers
                  {selectedUser && ` • Selected: ${selectedUser.name || selectedUser.email}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => testMcpServers(false)}
                  disabled={mcpLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {mcpLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Test with Default Data
                </Button>
                {selectedUser?.profile && (
                  <Button
                    onClick={() => testMcpServers(true)}
                    disabled={mcpLoading}
                    className="flex items-center gap-2"
                  >
                    {mcpLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    Test with {selectedUser.name || 'Customer'} Data
                  </Button>
                )}
              </div>
            </div>

            {mcpError && (
              <Card className="border-destructive">
                <div className="p-6">
                  <p className="text-destructive">{mcpError}</p>
                </div>
              </Card>
            )}

            {lastMcpTest && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Last tested: {formatDate(lastMcpTest.toISOString())}</span>
                {mcpResults?.testedWith && (
                  <Badge variant="outline" className="text-xs">
                    {mcpResults.testedWith === 'customer' 
                      ? `Tested with: ${mcpResults.customerName}` 
                      : 'Tested with: Default data'
                    }
                  </Badge>
                )}
              </div>
            )}

            {mcpResults && (
              <div className="space-y-6">
                {/* MCP Server Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Vehicle Enrichment</h4>
                        <p className="text-sm text-muted-foreground">NHTSA VIN Decoder</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full bg-${getMcpServerStatus(mcpResults.vehicles?.[0]).color}-500`}></div>
                    </div>
                    {mcpResults.vehicles?.[0] && (
                      <div className="mt-3 text-sm">
                        <p className="font-medium">{mcpResults.vehicles[0].year} {mcpResults.vehicles[0].make} {mcpResults.vehicles[0].model}</p>
                        <p className="text-muted-foreground">Source: {mcpResults.vehicles[0].enrichmentSource}</p>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Crime Risk</h4>
                        <p className="text-sm text-muted-foreground">FBI Crime Data</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full bg-${getMcpServerStatus(mcpResults.crimeRisk).color}-500`}></div>
                    </div>
                    {mcpResults.crimeRisk && (
                      <div className="mt-3 text-sm">
                        <p className="font-medium">Risk Level: {mcpResults.crimeRisk.riskLevel}</p>
                        <p className="text-muted-foreground">Crime Index: {mcpResults.crimeRisk.crimeIndex}</p>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Flood Risk</h4>
                        <p className="text-sm text-muted-foreground">FEMA/First Street</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full bg-${getMcpServerStatus(mcpResults.floodRisk).color}-500`}></div>
                    </div>
                    {mcpResults.floodRisk && (
                      <div className="mt-3 text-sm">
                        <p className="font-medium">Risk Level: {mcpResults.floodRisk.riskLevel}</p>
                        <p className="text-muted-foreground">Flood Factor: {mcpResults.floodRisk.floodFactor}</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Detailed Results */}
                <Card>
                  <div className="p-6">
                    <h4 className="font-medium mb-4">Detailed Test Results</h4>
                    <div className="space-y-4">
                      {/* Vehicle Enrichment Details */}
                      {mcpResults.vehicles?.[0] && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Car className="h-5 w-5 text-blue-600" />
                            <h5 className="font-medium">NHTSA VIN Decoder</h5>
                            <Badge variant={mcpResults.vehicles[0].success ? "default" : "destructive"}>
                              {mcpResults.vehicles[0].success ? 'Working' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">VIN:</span>
                              <p className="font-mono">{mcpResults.vehicles[0].vin}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Vehicle:</span>
                              <p>{mcpResults.vehicles[0].year} {mcpResults.vehicles[0].make} {mcpResults.vehicles[0].model}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Body Class:</span>
                              <p>{mcpResults.vehicles[0].bodyClass}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fuel Type:</span>
                              <p>{mcpResults.vehicles[0].fuelType}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crime Risk Details */}
                      {mcpResults.crimeRisk && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-5 w-5 text-red-600" />
                            <h5 className="font-medium">FBI Crime Risk Assessment</h5>
                            <Badge variant={mcpResults.crimeRisk.success ? "default" : "destructive"}>
                              {mcpResults.crimeRisk.success ? 'Working' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Crime Index:</span>
                              <p className="font-medium">{mcpResults.crimeRisk.crimeIndex}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Level:</span>
                              <p>{mcpResults.crimeRisk.riskLevel}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Violent Crime:</span>
                              <p>{mcpResults.crimeRisk.violentCrime}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Property Crime:</span>
                              <p>{mcpResults.crimeRisk.propertyCrime}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flood Risk Details */}
                      {mcpResults.floodRisk && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Home className="h-5 w-5 text-blue-600" />
                            <h5 className="font-medium">FEMA/First Street Flood Risk</h5>
                            <Badge variant={mcpResults.floodRisk.success ? "default" : "destructive"}>
                              {mcpResults.floodRisk.success ? 'Working' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Flood Factor:</span>
                              <p className="font-medium">{mcpResults.floodRisk.floodFactor}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Level:</span>
                              <p>{mcpResults.floodRisk.riskLevel}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Climate Change:</span>
                              <p>{mcpResults.floodRisk.climateChange30Year}</p>
                            </div>
                          </div>
                          {mcpResults.floodRisk.message && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                              <p className="text-yellow-800">{mcpResults.floodRisk.message}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Raw Results */}
                <Card>
                  <div className="p-6">
                    <h4 className="font-medium mb-4">Raw Test Results</h4>
                    <pre className="p-4 bg-muted rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(mcpResults, null, 2)}
                    </pre>
                  </div>
                </Card>
              </div>
            )}

            {!mcpResults && !mcpLoading && (
              <Card>
                <div className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Test MCP Servers</h3>
                  <p className="text-muted-foreground mb-4">
                    Click the button above to test all MCP registry servers and view their status.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

