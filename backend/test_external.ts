/**
 * Standalone test for external API clients and response formatter.
 * Tests currency, geocoding, and formatting without needing Groq API key.
 * 
 * Run: bun run test_external.ts
 */

import { getConversionRate, getSupportedCurrencies } from './src/services/external/currency.js';
import { getLocationCoordinates } from './src/services/external/geocode.js';
import { formatExternalResponse } from './src/services/response/formatter.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, details?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${details ? ' — ' + details : ''}`);
    failed++;
  }
}

async function testCurrencyRate() {
  console.log('\n🔹 Test: getConversionRate (EUR→USD, 2024-01-15)');
  const data = await getConversionRate({ base: 'EUR', symbols: 'USD', date: '2024-01-15' });
  assert(data.rates?.USD === 1.0945, `Rate is 1.0945`, `Got: ${data.rates?.USD}`);
  
  // Test formatter
  const formatted = formatExternalResponse(
    'What was the EUR to USD exchange rate on January 15, 2024?',
    'gemini-2.5-flash',
    'getConversionRate',
    data
  );
  assert(formatted.result_type === 'scalar', 'result_type is scalar');
  assert(formatted.rows[0][0] === 1.0945, `formatted rows = [[1.0945]]`, `Got: ${JSON.stringify(formatted.rows)}`);
  assert(formatted.meta.source === 'external', 'meta.source is external');
}

async function testCurrencyRateJPY() {
  console.log('\n🔹 Test: getConversionRate (EUR→JPY, 2024-01-15)');
  const data = await getConversionRate({ base: 'EUR', symbols: 'JPY', date: '2024-01-15' });
  assert(data.rates?.JPY === 159.67, `JPY rate is 159.67`, `Got: ${data.rates?.JPY}`);
}

async function testCurrencyRateGBP() {
  console.log('\n🔹 Test: getConversionRate (EUR→GBP, 2024-01-15)');
  const data = await getConversionRate({ base: 'EUR', symbols: 'GBP', date: '2024-01-15' });
  assert(data.rates?.GBP === 0.86075, `GBP rate is 0.86075`, `Got: ${data.rates?.GBP}`);
}

async function testSupportedCurrencies() {
  console.log('\n🔹 Test: getSupportedCurrencies');
  const data = await getSupportedCurrencies();
  const count = Object.keys(data).length;
  assert(count > 0, `Has currencies (count: ${count})`);
  assert(data['CHF'] === 'Swiss Franc', `CHF = Swiss Franc`, `Got: ${data['CHF']}`);
  
  // Test formatter - "how many"
  const formattedCount = formatExternalResponse(
    'How many currencies are supported by the Frankfurter currency API?',
    'gemini-2.5-flash',
    'getSupportedCurrencies',
    data
  );
  assert(formattedCount.result_type === 'scalar', 'result_type is scalar');
  assert(formattedCount.rows[0][0] === count, `count matches`, `Got: ${formattedCount.rows[0][0]}`);
  
  // Test formatter - "full name"
  const formattedName = formatExternalResponse(
    "What is the full currency name for the symbol 'CHF'?",
    'gemini-2.5-flash',
    'getSupportedCurrencies',
    data
  );
  assert(formattedName.rows[0][0] === 'Swiss Franc', `CHF name = Swiss Franc`, `Got: ${formattedName.rows[0][0]}`);
}

async function testGeocoding() {
  console.log('\n🔹 Test: getLocationCoordinates (Denver, Colorado)');
  const data = await getLocationCoordinates({ q: 'Denver, Colorado' });
  assert(Array.isArray(data) && data.length > 0, 'Got results array');
  
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  console.log(`  📍 lat=${lat}, lon=${lon}`);
  assert(Math.abs(lat - 39.7392364) < 0.001, `Lat ≈ 39.7392364`, `Got: ${lat}`);
  assert(Math.abs(lon - (-104.984862)) < 0.001, `Lon ≈ -104.984862`, `Got: ${lon}`);
  
  // Test formatter - latitude only
  const formattedLat = formatExternalResponse(
    'What is the latitude of Denver, Colorado according to OpenStreetMap?',
    'gemini-2.5-flash',
    'getLocation',
    data
  );
  assert(formattedLat.result_type === 'scalar', 'result_type is scalar for lat');
  assert(formattedLat.columns[0] === 'lat', 'column is lat');
  assert(typeof formattedLat.rows[0][0] === 'number', `lat is a number: ${formattedLat.rows[0][0]}`);
  
  // Test formatter - longitude only
  const formattedLon = formatExternalResponse(
    'What is the longitude of Denver, Colorado according to OpenStreetMap?',
    'gemini-2.5-flash',
    'getLocation',
    data
  );
  assert(formattedLon.result_type === 'scalar', 'result_type is scalar for lon');
  assert(formattedLon.columns[0] === 'lon', 'column is lon');
  assert(typeof formattedLon.rows[0][0] === 'number', `lon is a number: ${formattedLon.rows[0][0]}`);
}

async function main() {
  console.log('========================================');
  console.log('  External API & Formatter Tests');
  console.log('========================================');
  
  await testCurrencyRate();
  await testCurrencyRateJPY();
  await testCurrencyRateGBP();
  await testSupportedCurrencies();
  await testGeocoding();
  
  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');
  
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
