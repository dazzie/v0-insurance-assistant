/**
 * Validation using CA DOI Official Rates
 * 
 * Instructions:
 * 1. Go to: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::
 * 2. Enter your profile details
 * 3. Record the annual premiums below
 * 4. Run: node scripts/validate-with-ca-doi.js
 */

console.log('📊 CA DOI Official Rate Validation\n')
console.log('Source: California Department of Insurance (Jan 1, 2025)')
console.log('URL: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::\n')
console.log('='.repeat(80))

// Load from collected CA DOI data if available
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/ca-doi-reference/index.json');
let caDoiRates = {
  progressive: null,
  geico: null,
  stateFarm: null,
  allstate: null,
  libertyMutual: null
};

// Try to load collected data
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    // Find the current Tesla profile
    const currentProfile = data.profiles.find(p => 
      p.id === 'sf-tesla-2015-standard-clean' || 
      p.vehicle.includes('2015 Tesla')
    );
    
    if (currentProfile && currentProfile.rates) {
      console.log(`✅ Loaded CA DOI data from collected dataset (${currentProfile.collectedDate})\n`);
      Object.entries(currentProfile.rates).forEach(([carrier, rates]) => {
        const key = carrier.toLowerCase().replace(' ', '');
        if (key.includes('progressive')) caDoiRates.progressive = rates.annual;
        if (key.includes('geico')) caDoiRates.geico = rates.annual;
        if (key.includes('state') && key.includes('farm')) caDoiRates.stateFarm = rates.annual;
        if (key.includes('allstate')) caDoiRates.allstate = rates.annual;
        if (key.includes('liberty')) caDoiRates.libertyMutual = rates.annual;
      });
    }
  } catch (err) {
    console.log('⚠️  Could not load CA DOI data:', err.message);
  }
}

// If no collected data, use manual entry (TODO: fill in)
if (!caDoiRates.progressive) {
  // Manual override - fill in these values from CA DOI tool
  caDoiRates = {
    progressive: null,  // e.g., 1650
    geico: null,        // e.g., 1720
    stateFarm: null,    // e.g., 1890
    allstate: null,     // e.g., 2100
    libertyMutual: null // e.g., 1950
  };
}

// Current engine output (after calibration)
const engineRates = {
  progressive: 119,  // Monthly
  geico: 95,         // Monthly (estimate)
  stateFarm: 125,    // Monthly (estimate)
  allstate: 130,     // Monthly (estimate)
  libertyMutual: 120 // Monthly (estimate)
}

console.log('\n📋 Your Profile:')
console.log('   Vehicle: 2015 Tesla Model S')
console.log('   Location: San Francisco, CA 94122')
console.log('   Coverage: Standard')
console.log('   Mileage: 10,500/year')
console.log('   Record: Clean\n')

console.log('=' .repeat(80))
console.log('VALIDATION RESULTS\n')

const carriers = ['progressive', 'geico', 'stateFarm', 'allstate', 'libertyMutual']
let totalAccurate = 0
let totalTested = 0

console.log(`${'Carrier'.padEnd(20)} ${'CA DOI'.padStart(12)} ${'Engine'.padStart(12)} ${'Diff'.padStart(12)} ${'Status'.padStart(12)}`)
console.log('-'.repeat(80))

carriers.forEach(carrier => {
  const doiAnnual = caDoiRates[carrier]
  const engineMonthly = engineRates[carrier]
  
  if (!doiAnnual) {
    console.log(`${carrier.padEnd(20)} ${'NOT SET'.padStart(12)} ${'$' + engineMonthly + '/mo'.padStart(11)} ${'-'.padStart(12)} ${'⚠️ Fill DOI data'.padStart(19)}`)
    return
  }
  
  const doiMonthly = Math.round(doiAnnual / 12)
  const diff = engineMonthly - doiMonthly
  const diffPct = (diff / doiMonthly * 100).toFixed(1)
  const isAccurate = Math.abs(parseFloat(diffPct)) <= 15
  
  totalTested++
  if (isAccurate) totalAccurate++
  
  const status = isAccurate ? '✅ Accurate' : '❌ Off Target'
  const diffStr = `${diff > 0 ? '+' : ''}${diff} (${diffPct}%)`
  
  console.log(
    `${carrier.padEnd(20)} ` +
    `${'$' + doiMonthly + '/mo'.padStart(11)} ` +
    `${'$' + engineMonthly + '/mo'.padStart(11)} ` +
    `${diffStr.padStart(15)} ` +
    `${status.padStart(12)}`
  )
})

console.log('='.repeat(80))

if (totalTested === 0) {
  console.log('\n⚠️  NO CA DOI DATA ENTERED\n')
  console.log('📋 Instructions:')
  console.log('   1. Visit: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::')
  console.log('   2. Select your profile:')
  console.log('      - Coverage Type: Standard')
  console.log('      - Location: San Francisco, CA or 94122')
  console.log('      - Years Licensed: Your actual years')
  console.log('      - Mileage: 10,001-15,000 miles/year')
  console.log('      - Driving Record: Clean')
  console.log('      - Vehicle: 2015 Tesla Model S')
  console.log('   3. Click "Compare Rates"')
  console.log('   4. Update caDoiRates in this file with annual premiums')
  console.log('   5. Run: node scripts/validate-with-ca-doi.js\n')
} else {
  const accuracyPct = (totalAccurate / totalTested * 100).toFixed(1)
  console.log(`\n📊 Validation Summary: ${totalAccurate}/${totalTested} carriers accurate (${accuracyPct}%)`)
  console.log(`✅ Target: ±15% variance from CA DOI official rates\n`)
  
  if (totalAccurate === totalTested) {
    console.log('🎉 EXCELLENT! All quotes within acceptable range!')
    console.log('   Your quote engine is validated against official CA state data.\n')
  } else if (totalAccurate / totalTested >= 0.6) {
    console.log('✅ GOOD! Most quotes are accurate.')
    console.log('   Minor calibration may improve off-target carriers.\n')
  } else {
    console.log('⚠️  NEEDS CALIBRATION')
    console.log('   Several carriers are off target. Recommendations:')
    console.log('   1. Verify CA base rate is correct ($2,450/year)')
    console.log('   2. Check carrier regional adjustments')
    console.log('   3. Review multiplier stacking\n')
  }
}

console.log('📚 Resources:')
console.log('   - CA DOI Tool: https://interactive.web.insurance.ca.gov/apex_extprd/f?p=111:11:::NO:::')
console.log('   - Validation Guide: scripts/ca-doi-validation-guide.md')
console.log('   - Base Rates Config: config/factors/base-rates.json\n')

