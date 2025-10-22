#!/usr/bin/env node
/**
 * NY DFS Rate Collection - Non-Interactive Batch Tool
 * 
 * Run: node scripts/batch-collect-ny-doi.js --yes
 * Or with custom file: node scripts/batch-collect-ny-doi.js --file my-ny-rates.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/ca-doi-reference'); // Shared data directory
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

// Pre-filled NY profiles with sample rates (replace with actual NY DFS data)
const sampleProfiles = [
  {
    id: 'ny-tesla-2015-standard-clean',
    name: 'NYC Standard Mid-Age Tesla',
    location: 'New York, NY',
    state: 'NY',
    coverage: 'Standard',
    yearsLicensed: '10+',
    mileage: '10,001-15,000 miles/year',
    drivingRecord: 'Clean (no violations)',
    vehicle: '2015 Tesla Model S',
    priority: 1,
    rates: {
      // TODO: Replace with actual NY DFS rates
      'Progressive': { annual: 1850, monthly: 154 },
      'GEICO': { annual: 1920, monthly: 160 },
      'State Farm': { annual: 2100, monthly: 175 },
      'Allstate': { annual: 2350, monthly: 196 },
      'Liberty Mutual': { annual: 2180, monthly: 182 },
    }
  },
  {
    id: 'ny-civic-2018-standard-clean',
    name: 'NYC Standard Young Honda',
    location: 'New York, NY',
    state: 'NY',
    coverage: 'Standard',
    yearsLicensed: '3-5',
    mileage: '10,001-15,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2018 Honda Civic',
    priority: 2,
    rates: {
      'Progressive': { annual: 2200, monthly: 183 },
      'GEICO': { annual: 2280, monthly: 190 },
      'State Farm': { annual: 2450, monthly: 204 },
      'Allstate': { annual: 2680, monthly: 223 },
    }
  },
  {
    id: 'ny-camry-2020-basic-clean',
    name: 'Buffalo Basic Mid-Age Toyota',
    location: 'Buffalo, NY',
    state: 'NY',
    coverage: 'Basic',
    yearsLicensed: '10+',
    mileage: '5,001-10,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2020 Toyota Camry',
    priority: 3,
    rates: {
      'Progressive': { annual: 980, monthly: 82 },
      'GEICO': { annual: 1050, monthly: 88 },
      'State Farm': { annual: 1180, monthly: 98 },
    }
  },
  {
    id: 'ny-f150-2019-standard-1violation',
    name: 'Albany Standard Mid-Age Truck (1 Violation)',
    location: 'Albany, NY',
    state: 'NY',
    coverage: 'Standard',
    yearsLicensed: '10+',
    mileage: '15,001-20,000 miles/year',
    drivingRecord: '1 violation',
    vehicle: '2019 Ford F-150',
    priority: 4,
    rates: {
      'Progressive': { annual: 2450, monthly: 204 },
      'GEICO': { annual: 2520, monthly: 210 },
      'State Farm': { annual: 2800, monthly: 233 },
    }
  },
  {
    id: 'ny-model3-2021-premium-clean',
    name: 'NYC Premium Young Tesla',
    location: 'New York, NY',
    state: 'NY',
    coverage: 'Premium',
    yearsLicensed: '3-5',
    mileage: '5,001-10,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2021 Tesla Model 3',
    priority: 5,
    rates: {
      'Progressive': { annual: 2850, monthly: 238 },
      'GEICO': { annual: 2980, monthly: 248 },
      'State Farm': { annual: 3250, monthly: 271 },
    }
  }
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadExistingData() {
  if (fs.existsSync(INDEX_FILE)) {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  }
  return {
    source: 'State Insurance Departments (Multi-State)',
    states: {},
    lastUpdated: new Date().toISOString(),
    profiles: []
  };
}

function saveData(data) {
  ensureDataDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
}

function loadFromFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Error loading file ${filePath}:`, err.message);
    process.exit(1);
  }
}

function collectProfiles(profiles) {
  console.log('\n🗽 NY DFS Rate Collection');
  console.log('='.repeat(80));
  console.log(`\n📊 Collecting ${profiles.length} New York profiles...\n`);

  const data = loadExistingData();
  let added = 0;
  let updated = 0;

  profiles.forEach((profile, index) => {
    console.log(`\n[${index + 1}/${profiles.length}] ${profile.name}`);
    console.log('─'.repeat(80));
    
    // Check if profile exists
    const existingIndex = data.profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      // Update existing
      data.profiles[existingIndex] = {
        ...profile,
        collectedDate: new Date().toISOString()
      };
      updated++;
      console.log('✅ Updated existing profile');
    } else {
      // Add new
      data.profiles.push({
        ...profile,
        collectedDate: new Date().toISOString()
      });
      added++;
      console.log('✅ Added new profile');
    }

    // Show rates
    const carrierCount = Object.keys(profile.rates).length;
    console.log(`   Location: ${profile.location}`);
    console.log(`   Carriers: ${carrierCount}`);
    
    if (carrierCount > 0) {
      const avgAnnual = Math.round(
        Object.values(profile.rates).reduce((sum, r) => sum + r.annual, 0) / carrierCount
      );
      console.log(`   Avg Premium: $${avgAnnual}/year ($${Math.round(avgAnnual/12)}/mo)`);
      
      // Show each carrier
      Object.entries(profile.rates).forEach(([carrier, rates]) => {
        console.log(`      ${carrier.padEnd(20)} $${rates.annual}/year ($${rates.monthly}/mo)`);
      });
    }
  });

  // Update timestamp
  data.lastUpdated = new Date().toISOString();
  
  // Save
  saveData(data);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('🎉 NY Collection Complete!\n');
  console.log(`   Total profiles: ${data.profiles.length}`);
  console.log(`   NY profiles added: ${added}`);
  console.log(`   NY profiles updated: ${updated}`);
  console.log(`\n   Data saved to: ${INDEX_FILE}`);
  console.log('='.repeat(80) + '\n');

  // Show NY-specific summary
  const nyProfiles = data.profiles.filter(p => p.state === 'NY');
  console.log(`📊 New York Profiles Summary (${nyProfiles.length} total):\n`);
  nyProfiles.forEach((p, i) => {
    const carrierCount = Object.keys(p.rates).length;
    const avgAnnual = carrierCount > 0 
      ? Math.round(Object.values(p.rates).reduce((sum, r) => sum + r.annual, 0) / carrierCount)
      : 0;
    
    console.log(`   ${(i + 1).toString().padStart(2)}. ${p.name}`);
    console.log(`       Location: ${p.location}`);
    console.log(`       Vehicle:  ${p.vehicle}`);
    console.log(`       Coverage: ${p.coverage}`);
    console.log(`       Carriers: ${carrierCount}`);
    if (carrierCount > 0) {
      console.log(`       Avg Rate: $${avgAnnual}/year ($${Math.round(avgAnnual/12)}/mo)`);
    }
    console.log('');
  });

  console.log('📚 Next Steps:');
  console.log('   1. Run: node scripts/validate-with-ca-doi.js (validates all states)');
  console.log('   2. Review accuracy results');
  console.log('   3. Update NY base rates if needed\n');
}

function showUsage() {
  console.log(`
📖 NY DFS Rate Collection Tool - Usage

NY DFS Auto Insurance Tool:
🔗 https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison

1. Use Pre-filled Sample Data (for testing):
   $ node scripts/batch-collect-ny-doi.js --yes

2. Use Custom JSON File:
   $ node scripts/batch-collect-ny-doi.js --file my-ny-rates.json

3. Use Template (fill with real NY DFS data):
   $ cp scripts/ny-doi-rates-template.json scripts/my-ny-rates.json
   # Fill in with actual rates from NY DFS
   $ node scripts/batch-collect-ny-doi.js --file scripts/my-ny-rates.json

⚠️  Note: Sample data contains EXAMPLE rates. Replace with actual NY DFS data.
  `);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

let profiles = sampleProfiles;
let useCustomFile = false;

// Check for custom file
const fileIndex = args.indexOf('--file');
if (fileIndex >= 0 && args[fileIndex + 1]) {
  const customFile = args[fileIndex + 1];
  const data = loadFromFile(customFile);
  profiles = data.profiles || data;
  useCustomFile = true;
  console.log(`\n✅ Loaded ${profiles.length} profiles from: ${customFile}\n`);
}

// Show warning for sample data
if (!useCustomFile && !args.includes('--yes') && !args.includes('-y')) {
  console.log('\n⚠️  WARNING: Using SAMPLE/EXAMPLE data for New York!');
  console.log('   These are NOT real NY DFS rates.');
  console.log('   To collect actual rates:');
  console.log('   1. Go to: https://myportal.dfs.ny.gov/web/guest-applications/auto-insurance-rate-comparison');
  console.log('   2. Get official rates for each profile');
  console.log('   3. Update the rates in this script or use --file option');
  console.log('\n   Run with --yes to skip this warning\n');
}

// Collect profiles
collectProfiles(profiles);

