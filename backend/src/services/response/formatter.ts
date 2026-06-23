export interface StandardResponse {
  question: string;
  llm: string;
  result_type: 'scalar' | 'record' | 'table';
  columns: string[];
  rows: any[][];
  meta: {
    row_count: number;
    source: 'external' | 'database' | 'mixed';
  };
}

export function formatExternalResponse(
  question: string,
  llm: string,
  api: string,
  data: any
): StandardResponse {
  let result_type: 'scalar' | 'record' | 'table' = 'scalar';
  let columns: string[] = [];
  let rows: any[][] = [];

  if (api === 'getConversionRate') {
    const symbolKeys = Object.keys(data.rates || {});
    const rateVal = symbolKeys.length > 0 ? data.rates[symbolKeys[0]] : null;
    
    result_type = 'scalar';
    columns = ['rate'];
    rows = [[rateVal]];
    
  } else if (api === 'getSupportedCurrencies') {
    if (question.toLowerCase().includes('how many')) {
      const count = Object.keys(data).length;
      result_type = 'scalar';
      columns = ['supported_currencies_count'];
      rows = [[count]];
    } else {
      // Look for symbol in single quotes like 'CHF' or default to CHF
      const match = question.match(/'([^']+)'/);
      const symbol = match ? match[1].toUpperCase() : 'CHF';
      const name = data[symbol] || null;
      
      result_type = 'scalar';
      columns = ['currency_name'];
      rows = [[name]];
    }
    
  } else if (api === 'getLocation') {
    const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (!item) {
      throw new Error("No location coordinates found");
    }
    
    const isLat = question.toLowerCase().includes('latitude');
    const isLon = question.toLowerCase().includes('longitude');
    
    if (isLat && !isLon) {
      result_type = 'scalar';
      columns = ['lat'];
      rows = [[parseFloat(item.lat)]];
    } else if (isLon && !isLat) {
      result_type = 'scalar';
      columns = ['lon'];
      rows = [[parseFloat(item.lon)]];
    } else {
      result_type = 'record';
      columns = ['lat', 'lon'];
      rows = [[parseFloat(item.lat), parseFloat(item.lon)]];
    }
  }

  return {
    question,
    llm,
    result_type,
    columns,
    rows,
    meta: {
      row_count: rows.length,
      source: 'external'
    }
  };
}
