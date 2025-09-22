// Test prompt generation for years licensed question
import { extractCollectedInfo, getMissingInfo, getNextInfoToCollect } from './lib/information-tracker.js';
import { generateSuggestedPrompts } from './lib/suggested-prompts.js';

// Simulate conversation after Tesla Model 3 is entered
const messages = [
  { role: 'assistant', content: 'How many drivers will be on this policy?' },
  { role: 'user', content: 'Just me' },
  { role: 'assistant', content: 'How many vehicles?' },
  { role: 'user', content: 'Just 1 vehicle' },
  { role: 'assistant', content: 'ZIP code?' },
  { role: 'user', content: '94105' },
  { role: 'assistant', content: 'What year?' },
  { role: 'user', content: '2025' },
  { role: 'assistant', content: 'What make?' },
  { role: 'user', content: 'Tesla model 3' },
  { role: 'assistant', content: 'How many years have you been licensed?' }
];

const profile = { age: '23', location: 'San Francisco, CA', needs: ['auto'] };

console.log('Testing prompt generation after "How many years have you been licensed?" question:\n');

const collected = extractCollectedInfo(messages, profile);
console.log('Collected Info:', JSON.stringify(collected, null, 2));

const missing = getMissingInfo(collected);
console.log('\nMissing Info:', missing);

const next = getNextInfoToCollect(missing);
console.log('\nNext to collect:', next);

const prompts = generateSuggestedPrompts(messages, profile);
console.log('\nGenerated Prompts:');
prompts.forEach(p => console.log(`  - ${p.icon} ${p.text}`));