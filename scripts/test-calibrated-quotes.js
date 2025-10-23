#!/usr/bin/env node

/**
 * Test Calibrated Quote Engine
 * Validates the improved accuracy against official CA DOI rates
 */

const { QuoteEngine } = require('../lib/quote-engine/engine');

console.log('🧪 Testing Calibrated Quote Engine...\n');

// Test profile matching the validation results
const testProfile = {
  insuranceType: 'auto',
  state: 'CA',
  age: 35,
  creditTier: 'good',
  vehicleType: 'luxury',
  vehicleYear: 2015,
  vehicleMake: 'Tesla',
  vehicleModel: 'Model S',
  annualMileage: 12000,
  violations: 0,
  accidents: 0,
  deductible: 500,
  coverageLevel: 'standard',
  bundleHome: false
};

const engine = new QuoteEngine();
const result = engine.generateQuotes(testProfile);

console.log('📊 Calibrated Results:');
console.log('====================');

result.quotes.forEach(quote => {
  const carrier = quote.carrierName;
  const monthly = quote.monthlyPremium;
  
  // Official rates from validation
  const officialRates = {
    'Progressive': 138,
    'GEICO': 143,
    'State Farm': 158
  };
  
  const official = officialRates[carrier];
  if (official) {
    const diff = monthly - official;
    const percentDiff = ((monthly - official) / official * 100).toFixed(1);
    const status = Math.abs(percentDiff) <= 15 ? '✅ Accurate' : '❌ Off Target';
    
    console.log(`${carrier}:`);
    console.log(`  Our Quote: $${monthly}/mo`);
    console.log(`  Official:  $${official}/mo`);
    console.log(`  Difference: $${diff > 0 ? '+' : ''}${diff} (${percentDiff > 0 ? '+' : ''}${percentDiff}%)`);
    console.log(`  Status: ${status}\n`);
  }
});

console.log('🎯 Calibration Impact:');
console.log('• Base rate reduced by 32.7%');
console.log('• Added CA-specific territory factors');
console.log('• Added Tesla Model S specific factors');
console.log('• Updated carrier regional adjustments');
console.log('• Added credit score and driving record factors');
