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
    const firstKey = symbolKeys[0];
    const rateVal = firstKey ? data.rates[firstKey] : null;
    
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
      const symbol = match?.[1]?.toUpperCase() ?? 'CHF';
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

/**
 * General-purpose formatter used by queryController for all source types.
 * Determines result_type from the shape of the rows.
 */
export function formatResponse(params: {
  question: string;
  llm: string;
  columns: string[];
  rows: any[][];
  source: 'external' | 'database' | 'mixed';
}): StandardResponse {
  const { question, llm, columns, rows, source } = params;

  let result_type: 'scalar' | 'record' | 'table';
  if (rows.length === 1 && columns.length === 1) {
    result_type = 'scalar';
  } else if (rows.length === 1) {
    result_type = 'record';
  } else {
    result_type = 'table';
  }

  // Normalize values: convert numeric strings to numbers, format dates
  const normalizedRows = rows.map((row: any[]) =>
    row.map((val: any) => {
      if (val === null || val === undefined) return null;
      if (val instanceof Date) {
        return val.toISOString().split('.')[0] + 'Z';
      }
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return val + 'T00:00:00Z';
      }
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/.test(val)) {
        return val.split('.')[0] + 'Z';
      }
      if (typeof val === 'string' && /^-?\d+(\.\d+)?$/.test(val)) {
        const num = Number(val);
        if (!isNaN(num)) return num;
      }
      return val;
    })
  );

  return {
    question,
    llm,
    result_type,
    columns,
    rows: normalizedRows,
    meta: {
      row_count: normalizedRows.length,
      source
    }
  };
}
