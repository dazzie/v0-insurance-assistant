/**
 * Direct State DOI Data Access (No MCP Protocol)
 * Accesses DOI reference data directly for simplicity
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data/ca-doi-reference/index.json');

/**
 * Load DOI reference data
 */
function loadDOIData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { profiles: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading DOI data:', error);
    return { profiles: [] };
  }
}

/**
 * Find matching profile based on customer data
 */
function findMatchingProfile(customerProfile: any, state: string) {
  const data = loadDOIData();
  
  const stateProfiles = data.profiles.filter((p: any) => 
    p.state === state || p.location?.includes(state)
  );
  
  if (stateProfiles.length === 0) {
    return null;
  }
  
  // Try to find exact match
  let bestMatch = stateProfiles.find((p: any) => {
    if (customerProfile.vehicle) {
      const vehicleMatch = p.vehicle?.toLowerCase().includes(
        `${customerProfile.vehicle.year} ${customerProfile.vehicle.make}`.toLowerCase()
      );
      if (vehicleMatch) return true;
    }
    return false;
  });
  
  if (!bestMatch) {
    bestMatch = stateProfiles[0];
  }
  
  return bestMatch;
}

/**
 * Get available states
 */
export function getAvailableStates() {
  const data = loadDOIData();
  const states = new Set<string>();
  
  data.profiles.forEach((p: any) => {
    if (p.state) states.add(p.state);
  });
  
  return Array.from(states).map(state => {
    const count = data.profiles.filter((p: any) => p.state === state).length;
    return { state, profiles: count };
  });
}

/**
 * Get official rates for a customer profile
 */
export function getOfficialRates(state: string, customerProfile: any = {}) {
  const profile = findMatchingProfile(customerProfile, state);
  
  if (!profile) {
    return {
      success: false,
      message: `No official rate data available for state: ${state}`,
      availableStates: getAvailableStates(),
    };
  }
  
  return {
    success: true,
    state,
    source: state === 'CA' 
      ? 'California Department of Insurance'
      : state === 'NY' 
      ? 'New York Department of Financial Services'
      : `${state} Department of Insurance`,
    profile: {
      id: profile.id,
      name: profile.name,
      vehicle: profile.vehicle,
      location: profile.location,
      coverage: profile.coverage,
    },
    rates: profile.rates,
    collectedDate: profile.collectedDate,
    note: 'These are official rates from state insurance department databases',
  };
}

/**
 * List available states
 */
export function listAvailableStates() {
  const states = getAvailableStates();
  
  return {
    success: true,
    totalStates: states.length,
    totalProfiles: states.reduce((sum, s) => sum + s.profiles, 0),
    states,
    details: states.map(s => ({
      state: s.state,
      name: s.state === 'CA' ? 'California' : s.state === 'NY' ? 'New York' : s.state,
      profiles: s.profiles,
      tool: s.state === 'CA' 
        ? 'https://interactive.web.insurance.ca.gov/'
        : s.state === 'NY'
        ? 'https://myportal.dfs.ny.gov/'
        : 'State DOI tool',
    })),
  };
}

/**
 * Get all profiles from the dataset
 */
export function getAllProfiles() {
  const data = loadDOIData();
  
  const summary = {
    total: data.profiles.length,
    byState: {} as Record<string, number>,
    byVehicle: {} as Record<string, number>,
    byCoverage: {} as Record<string, number>,
  };
  
  data.profiles.forEach((p: any) => {
    const state = p.state || 'CA';
    summary.byState[state] = (summary.byState[state] || 0) + 1;
    
    if (p.vehicle) {
      const vehicleType = p.vehicle.split(' ')[2] || 'Unknown'; // Get make
      summary.byVehicle[vehicleType] = (summary.byVehicle[vehicleType] || 0) + 1;
    }
    
    if (p.coverage) {
      summary.byCoverage[p.coverage] = (summary.byCoverage[p.coverage] || 0) + 1;
    }
  });
  
  return {
    success: true,
    source: data.source || 'State Insurance Departments',
    lastUpdated: data.lastUpdated,
    summary,
    profiles: data.profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      state: p.state || 'CA',
      location: p.location,
      vehicle: p.vehicle,
      coverage: p.coverage,
      drivingRecord: p.drivingRecord,
      carriers: Object.keys(p.rates || {}),
      avgMonthly: Object.values(p.rates || {}).reduce((sum: number, r: any) => sum + (r.monthly || 0), 0) / Object.keys(p.rates || {}).length,
    })),
  };
}

/**
 * Compare engine quotes to official rates
 */
export function compareToOfficial(state: string, engineQuotes: any[], customerProfile: any = {}) {
  const profile = findMatchingProfile(customerProfile, state);
  
  if (!profile) {
    return {
      success: false,
      message: `No official data for ${state}`,
    };
  }
  
  const comparison: any[] = [];
  
  Object.entries(profile.rates).forEach(([carrier, rates]: [string, any]) => {
    const engineQuote = engineQuotes.find(q => 
      q.carrierName.toLowerCase().includes(carrier.toLowerCase())
    );
    
    if (engineQuote && rates.monthly) {
      const diff = engineQuote.monthlyPremium - rates.monthly;
      const diffPercent = ((diff / rates.monthly) * 100).toFixed(1);
      
      comparison.push({
        carrier,
        official: rates.monthly,
        engine: engineQuote.monthlyPremium,
        difference: diff,
        differencePercent: parseFloat(diffPercent),
        accurate: Math.abs(parseFloat(diffPercent)) <= 15
      });
    }
  });
  
  const accurateCount = comparison.filter(c => c.accurate).length;
  const accuracy = comparison.length > 0 
    ? ((accurateCount / comparison.length) * 100).toFixed(1)
    : 0;
  
  return {
    success: true,
    state,
    profile: profile.name,
    comparison,
    summary: {
      totalCarriers: comparison.length,
      accurate: accurateCount,
      accuracyRate: `${accuracy}%`,
      targetAccuracy: '±15%',
      status: parseFloat(accuracy as string) >= 70 ? 'Good' : 'Needs Calibration',
    },
  };
}

