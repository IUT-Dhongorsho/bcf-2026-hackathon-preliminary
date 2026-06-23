export interface ConversionParams {
  base?: string;
  symbols?: string;
  date?: string;
}

export async function getConversionRate(params: ConversionParams = {}): Promise<any> {
  const base = params.base || 'EUR';
  const symbols = params.symbols || 'USD';
  const date = params.date && params.date !== 'latest' ? params.date : 'latest';
  
  const url = `https://api.frankfurter.dev/v1/${date}?base=${base}&symbols=${symbols}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Frankfurter API returned status ${response.status}`);
  }
  return await response.json();
}

export async function getSupportedCurrencies(): Promise<Record<string, string>> {
  const url = 'https://api.frankfurter.dev/v1/currencies';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Frankfurter API returned status ${response.status}`);
  }
  return await response.json();
}
