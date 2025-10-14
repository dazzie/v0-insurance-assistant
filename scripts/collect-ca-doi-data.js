#!/usr/bin/env node
/**
 * CA DOI Rate Collection Tool - Interactive Manual Collection
 * 
 * This tool helps you systematically collect rate data from the CA DOI website
 * and build a reference dataset for validation.
 * 
 * Run: node scripts/collect-ca-doi-data.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Critical profiles to collect
const criticalProfiles = [
  {
    id: 'sf-tesla-2015-standard-clean',
    name: 'SF Standard Mid-Age Tesla (CURRENT PROFILE)',
    location: 'San Francisco, CA (94122)',
    coverage: 'Standard',
    yearsLicensed: '10+',
    mileage: '10,001-15,000 miles/year',
    drivingRecord: 'Clean (no violations)',
    vehicle: '2015 Tesla Model S',
    priority: 1
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
    priority: 2
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
    priority: 3
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
    priority: 4
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
    priority: 5
  }
];

const carriers = [
  'Progressive',
  'GEICO', 
  'State Farm',
  'Allstate',
  'Liberty Mutual',
  'Farmers',
  'Nationwide',
  'Travelers'
];

// Data storage
const DATA_DIR = path.join(__dirname, '../data/ca-doi-reference');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

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
  console.log(`\n✅ Data saved to: ${INDEX_FILE}\n`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function collectProfile(profile) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 Profile ${profile.priority}: ${profile.name}`);
  console.log('='.repeat(80));
  console.log('\n🔗 CA DOI Tool: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::\n');
  
  console.log('📝 Enter these details in the CA DOI tool:\n');
  console.log(`   Coverage Type:    ${profile.coverage}`);
  console.log(`   Location:         ${profile.location}`);
  console.log(`   Years Licensed:   ${profile.yearsLicensed}`);
  console.log(`   Mileage:          ${profile.mileage}`);
  console.log(`   Driving Record:   ${profile.drivingRecord}`);
  console.log(`   Vehicle:          ${profile.vehicle}`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('📊 Enter the ANNUAL premiums shown (or press Enter to skip carrier):');
  console.log('-'.repeat(80) + '\n');
  
  const rates = {};
  
  for (const carrier of carriers) {
    const annual = await question(`   ${carrier.padEnd(20)} $`);
    
    if (annual && annual.trim() && !isNaN(annual.trim())) {
      const annualPremium = parseInt(annual.trim());
      rates[carrier] = {
        annual: annualPremium,
        monthly: Math.round(annualPremium / 12)
      };
      console.log(`      ✅ Recorded: $${annualPremium}/year ($${rates[carrier].monthly}/mo)`);
    } else {
      console.log(`      ⏭️  Skipped`);
    }
  }
  
  if (Object.keys(rates).length === 0) {
    console.log('\n⚠️  No rates entered, skipping profile...');
    return null;
  }
  
  return {
    ...profile,
    rates,
    collectedDate: new Date().toISOString()
  };
}

async function main() {
  console.clear();
  console.log('\n🎯 CA DOI Rate Collection Tool');
  console.log('=' .repeat(80));
  console.log('\nThis tool helps you collect official insurance rates from CA DOI');
  console.log('to build a reference dataset for quote validation.\n');
  
  const data = loadExistingData();
  
  console.log(`📊 Current Status:`);
  console.log(`   Profiles collected: ${data.profiles.length}`);
  console.log(`   Profiles remaining: ${criticalProfiles.length - data.profiles.length}`);
  
  const continueCollect = await question('\n▶️  Start collecting? (y/n): ');
  
  if (continueCollect.toLowerCase() !== 'y') {
    console.log('\n👋 Exiting...\n');
    rl.close();
    return;
  }
  
  let collected = 0;
  
  for (const profile of criticalProfiles) {
    // Check if already collected
    const exists = data.profiles.find(p => p.id === profile.id);
    if (exists) {
      const overwrite = await question(`\n⚠️  Profile "${profile.name}" already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('   ⏭️  Skipping...');
        continue;
      }
      // Remove existing
      data.profiles = data.profiles.filter(p => p.id !== profile.id);
    }
    
    const result = await collectProfile(profile);
    
    if (result) {
      data.profiles.push(result);
      data.lastUpdated = new Date().toISOString();
      saveData(data);
      collected++;
      
      console.log('\n✅ Profile saved successfully!');
      
      const continueNext = await question('\n▶️  Collect next profile? (y/n): ');
      if (continueNext.toLowerCase() !== 'y') {
        break;
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎉 Collection Complete!`);
  console.log(`   Total profiles: ${data.profiles.length}`);
  console.log(`   Just collected: ${collected}`);
  console.log(`   Data saved to: ${INDEX_FILE}`);
  console.log('='.repeat(80) + '\n');
  
  // Show summary
  if (data.profiles.length > 0) {
    console.log('📊 Collected Data Summary:\n');
    data.profiles.forEach((p, i) => {
      const carrierCount = Object.keys(p.rates).length;
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Carriers: ${carrierCount}`);
      if (carrierCount > 0) {
        const avgAnnual = Math.round(
          Object.values(p.rates).reduce((sum, r) => sum + r.annual, 0) / carrierCount
        );
        console.log(`      Avg Premium: $${avgAnnual}/year ($${Math.round(avgAnnual/12)}/mo)`);
      }
      console.log('');
    });
  }
  
  console.log('📚 Next Steps:');
  console.log('   1. Run: node scripts/validate-with-ca-doi.js');
  console.log('   2. Update base rates if needed');
  console.log('   3. Collect more profiles to improve accuracy\n');
  
  rl.close();
}

// Handle errors and exit
process.on('uncaughtException', (err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

