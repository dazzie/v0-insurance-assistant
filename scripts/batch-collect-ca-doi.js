#!/usr/bin/env node
/**
 * CA DOI Batch Rate Collection - Non-Interactive
 * 
 * Run with pre-filled data: node scripts/batch-collect-ca-doi.js
 * Or specify rates via JSON file: node scripts/batch-collect-ca-doi.js --file rates.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/ca-doi-reference');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

// Pre-defined profiles with example rates (update these with actual CA DOI data)
const sampleProfiles = [
  {
    id: 'sf-tesla-2015-standard-clean',
    name: 'SF Standard Mid-Age Tesla (CURRENT PROFILE)',
    location: 'San Francisco, CA (94122)',
    coverage: 'Standard',
    yearsLicensed: '10+',
    mileage: '10,001-15,000 miles/year',
    drivingRecord: 'Clean (no violations)',
    vehicle: '2015 Tesla Model S',
    priority: 1,
    rates: {
      // TODO: Replace with actual CA DOI rates
      'Progressive': { annual: 1650, monthly: 138 },
      'GEICO': { annual: 1720, monthly: 143 },
      'State Farm': { annual: 1890, monthly: 158 },
      'Allstate': { annual: 2100, monthly: 175 },
      'Liberty Mutual': { annual: 1950, monthly: 163 },
    }
  },
  {
    id: 'la-civic-2018-standard-clean',
    name: 'LA Standard Young Honda',
    location: 'Los Angeles, CA',
    coverage: 'Standard',
    yearsLicensed: '3-5',
    mileage: '10,001-15,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2018 Honda Civic',
    priority: 2,
    rates: {
      'Progressive': { annual: 1580, monthly: 132 },
      'GEICO': { annual: 1650, monthly: 138 },
      'State Farm': { annual: 1820, monthly: 152 },
      'Allstate': { annual: 2020, monthly: 168 },
    }
  },
  {
    id: 'sd-camry-2020-basic-clean',
    name: 'SD Basic Mid-Age Toyota',
    location: 'San Diego, CA',
    coverage: 'Basic',
    yearsLicensed: '10+',
    mileage: '5,001-10,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2020 Toyota Camry',
    priority: 3,
    rates: {
      'Progressive': { annual: 980, monthly: 82 },
      'GEICO': { annual: 1020, monthly: 85 },
      'State Farm': { annual: 1150, monthly: 96 },
      'Allstate': { annual: 1280, monthly: 107 },
    }
  },
  {
    id: 'sac-f150-2019-standard-1violation',
    name: 'SAC Standard Mid-Age Truck (1 Violation)',
    location: 'Sacramento, CA',
    coverage: 'Standard',
    yearsLicensed: '10+',
    mileage: '15,001-20,000 miles/year',
    drivingRecord: '1 violation',
    vehicle: '2019 Ford F-150',
    priority: 4,
    rates: {
      'Progressive': { annual: 2100, monthly: 175 },
      'GEICO': { annual: 2180, monthly: 182 },
      'State Farm': { annual: 2450, monthly: 204 },
      'Allstate': { annual: 2720, monthly: 227 },
    }
  },
  {
    id: 'sf-model3-2021-premium-clean',
    name: 'SF Premium Young Tesla',
    location: 'San Francisco, CA',
    coverage: 'Premium',
    yearsLicensed: '3-5',
    mileage: '5,001-10,000 miles/year',
    drivingRecord: 'Clean',
    vehicle: '2021 Tesla Model 3',
    priority: 5,
    rates: {
      'Progressive': { annual: 2250, monthly: 188 },
      'GEICO': { annual: 2380, monthly: 198 },
      'State Farm': { annual: 2650, monthly: 221 },
      'Allstate': { annual: 2920, monthly: 243 },
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
    source: 'California Department of Insurance',
    sourceUrl: 'https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::',
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
  console.log('\n🎯 CA DOI Batch Rate Collection');
  console.log('='.repeat(80));
  console.log(`\n📊 Collecting ${profiles.length} profiles...\n`);

  const data = loadExistingData();
  let added = 0;
  let updated = 0;
  let skipped = 0;

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
  console.log('🎉 Collection Complete!\n');
  console.log(`   Total profiles: ${data.profiles.length}`);
  console.log(`   Added: ${added}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`\n   Data saved to: ${INDEX_FILE}`);
  console.log('='.repeat(80) + '\n');

  // Show summary table
  console.log('📊 Collected Data Summary:\n');
  data.profiles.forEach((p, i) => {
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
  console.log('   1. Run: node scripts/validate-with-ca-doi.js');
  console.log('   2. Review accuracy results');
  console.log('   3. Update base rates if needed');
  console.log('   4. Re-run validation\n');
}

function showUsage() {
  console.log(`
📖 CA DOI Batch Collection Tool - Usage

1. Use Pre-filled Sample Data (for testing):
   $ node scripts/batch-collect-ca-doi.js

2. Use Custom JSON File:
   $ node scripts/batch-collect-ca-doi.js --file my-rates.json

3. Use Sample Data but Skip Confirmation:
   $ node scripts/batch-collect-ca-doi.js --yes

JSON File Format:
{
  "profiles": [
    {
      "id": "unique-id",
      "name": "Profile Name",
      "location": "City, CA",
      "vehicle": "2015 Tesla Model S",
      "coverage": "Standard",
      "yearsLicensed": "10+",
      "mileage": "10,001-15,000 miles/year",
      "drivingRecord": "Clean",
      "rates": {
        "Progressive": { "annual": 1650, "monthly": 138 },
        "GEICO": { "annual": 1720, "monthly": 143 }
      }
    }
  ]
}

⚠️  Note: Sample data contains EXAMPLE rates. Replace with actual CA DOI data.
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
  console.log('\n⚠️  WARNING: Using SAMPLE/EXAMPLE data!');
  console.log('   These are NOT real CA DOI rates.');
  console.log('   To collect actual rates:');
  console.log('   1. Go to: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::');
  console.log('   2. Get official rates for each profile');
  console.log('   3. Update the rates in this script or use --file option');
  console.log('\n   Run with --yes to skip this warning\n');
}

// Collect profiles
collectProfiles(profiles);

