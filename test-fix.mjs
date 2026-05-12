// Definitively test: set __undiciFetch BEFORE any openai module loads
import { fetch as undiciFetch } from 'undici'

// This must be the FIRST thing that runs
globalThis.__undiciFetch = undiciFetch

// Verify the patch works
const shims = await import('./node_modules/openai/internal/shims.js')
console.log('[1] getDefaultFetch() === undiciFetch:', shims.getDefaultFetch() === undiciFetch)

// Now import openai
const { OpenAI } = await import('openai')
console.log('[2] OpenAI imported')

const client = new OpenAI({
  apiKey: 'sk-sqcbayxjsvgsxkcmitwtfudshfnpnfwvqkpkwtgaytxxj',
  baseURL: 'https://taotoken.net/api/v1/chat/completions',
})
console.log('[3] OpenAI client created')

// Check if client has the right fetch
console.log('[4] client.fetch === undiciFetch:', client.fetch === undiciFetch)
console.log('[4] typeof client.fetch:', typeof client.fetch)

// Make a direct API call to verify
client.chat.completions.create({
  model: 'deepseek-v4-pro',
  messages: [{ role: 'user', content: 'hi' }],
  max_tokens: 5,
}).then(r => {
  console.log('[5] SUCCESS:', JSON.stringify(r).slice(0, 100))
  process.exit(0)
}).catch(e => {
  console.error('[5] ERROR:', e.message)
  console.error('[5] status:', e.status)
  process.exit(1)
})
