export interface LocationParams {
  q: string;
}

export async function getLocationCoordinates(params: LocationParams): Promise<any> {
  if (!params.q) {
    throw new Error("Geocoding query parameter 'q' is required");
  }
  
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(params.q)}&format=json`;
  
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
