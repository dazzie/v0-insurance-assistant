/**
 * Quick Quote Validation - Compare against actual policy
 */

// Your actual Progressive policy
const actualProgressive = {
  monthly: 140,  // $1,675/year ÷ 12
  annual: 1675
}

// What the engine calculated
const engineProgressive = {
  monthly: 90,
  annual: 1080
}

console.log('🧪 Quote Engine Validation\n')
console.log('Profile: 2015 Tesla Model S, San Francisco, CA')
console.log('Current Progressive Policy: $1,675/year\n')
console.log('='.repeat(60))

const diff = engineProgressive.monthly - actualProgressive.monthly
const diffPct = ((diff / actualProgressive.monthly) * 100).toFixed(1)

console.log(`\n${'Metric'.padEnd(30)} ${'Engine'.padStart(12)} ${'Actual'.padStart(12)}`)
console.log('-'.repeat(60))
console.log(`${'Monthly Premium'.padEnd(30)} ${'$' + engineProgressive.monthly + '/mo'.padStart(11)} ${'$' + actualProgressive.monthly + '/mo'.padStart(11)}`)
console.log(`${'Annual Premium'.padEnd(30)} ${'$' + engineProgressive.annual + '/yr'.padStart(11)} ${'$' + actualProgressive.annual + '/yr'.padStart(11)}`)
console.log(`${'Difference'.padEnd(30)} ${'-$' + Math.abs(diff) + '/mo'.padStart(11)} ${diffPct + '%'.padStart(11)}`)

console.log('\n' + '='.repeat(60))

if (Math.abs(parseFloat(diffPct)) > 15) {
  console.log('\n❌ ENGINE IS OFF BY MORE THAN 15%')
  console.log('\n🔧 Calibration Needed:')
  
  const multiplier = (actualProgressive.monthly / engineProgressive.monthly).toFixed(2)
  console.log(`   • Current base rate: $1,850/year`)
  console.log(`   • Suggested adjustment: Multiply by ${multiplier}`)
  console.log(`   • New base rate: $${Math.round(1850 * multiplier)}/year`)
  
  console.log('\n📋 Possible Issues:')
  console.log('   1. Base rates too low (using 2024 data, rates increased in 2025)')
  console.log('   2. Too many stacked discounts (credit + age + vehicle + region)')
  console.log('   3. Missing California-specific factors (high insurance state)')
  console.log('   4. Not accounting for comprehensive/collision coverage levels')
  
  console.log('\n✅ Validation Methods:')
  console.log('   1. Get 3+ real quotes and add to validation')
  console.log('   2. Check latest CA state average: insurance.ca.gov')
  console.log('   3. Compare against Insurify/Zebra aggregator data')
  console.log('   4. Use industry reports (J.D. Power, AM Best)')
} else {
  console.log('\n✅ ENGINE IS ACCURATE (within 15% tolerance)')
}

console.log('\n📊 Next Steps:')
console.log('   1. Collect 2-3 more real quotes (call GEICO, State Farm)')
console.log('   2. Update base-rates.json with current data')
console.log('   3. Run validation again')
console.log('')

