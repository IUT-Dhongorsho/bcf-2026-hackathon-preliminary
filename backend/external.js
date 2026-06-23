export async function getConversionRate({ base = 'EUR', symbols = 'USD', date = 'latest' } = {}) {
  // If date is passed but is not 'latest', ensure format YYYY-MM-DD
  const pathSegment = date && date !== 'latest' ? date : 'latest';
  const url = `https://api.frankfurter.dev/v1/${pathSegment}?base=${base}&symbols=${symbols}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Frankfurter API returned status ${response.status}`);
  }
  return await response.json();
}

export async function getSupportedCurrencies() {
  const url = `https://api.frankfurter.dev/v1/currencies`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Frankfurter API returned status ${response.status}`);
  }
  return await response.json();
}

export async function getLocation({ q } = {}) {
  if (!q) throw new Error("Location query 'q' is required");
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ConversationalDBEngine/1.0 (hackathon-preliminary@buet.edu)'
    }
  });
  if (!response.ok) {
    throw new Error(`Nominatim API returned status ${response.status}`);
  }
  return await response.json();
}
