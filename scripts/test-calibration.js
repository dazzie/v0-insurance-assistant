/**
 * Test calibration after updating CA base rate
 */

const oldBase = 1850
const newBase = 2450
const increase = ((newBase - oldBase) / oldBase * 100).toFixed(1)

console.log('🔧 Calibration Update')
console.log('='.repeat(60))
console.log(`CA Base Rate: $${oldBase} → $${newBase} (+${increase}%)`)

const oldEngine = 90 // Previous monthly
const newEngine = Math.round(oldEngine * (newBase / oldBase))

const actual = 140
const newDiff = newEngine - actual
const newDiffPct = ((newDiff / actual) * 100).toFixed(1)

console.log('\n📊 Projected Impact')
console.log('-'.repeat(60))
console.log(`Old Engine Monthly:  $${oldEngine}/mo (was 35.7% low)`)
console.log(`New Engine Monthly:  $${newEngine}/mo (estimated)`)
console.log(`Actual Progressive:  $${actual}/mo`)
console.log(`New Difference:      ${newDiff > 0 ? '+' : ''}$${newDiff}/mo (${newDiffPct}%)`)

console.log('\n' + '='.repeat(60))

if (Math.abs(parseFloat(newDiffPct)) <= 15) {
  console.log('✅ CALIBRATION SUCCESSFUL - Within 15% tolerance!')
} else if (Math.abs(parseFloat(newDiffPct)) <= 20) {
  console.log('⚠️  CLOSE - Within 20%, minor tweaking needed')
} else {
  console.log('❌ STILL OFF - Additional calibration required')
}

console.log('\n🧪 Validation Checklist:')
console.log('  [ ] Restart dev server to reload config')
console.log('  [ ] Upload policy and get new quotes')
console.log('  [ ] Compare new engine output to $140/mo actual')
console.log('  [ ] Collect 2-3 more real quotes for validation')
console.log('')

