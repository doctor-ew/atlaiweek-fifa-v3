import { fetchMartaVehicles, MOCK_VEHICLES } from '@/lib/marta';
import type { MartaApiResponse } from '@/types';

export async function GET(): Promise<Response> {
  if (process.env.USE_MOCK_MARTA_DATA === 'true') {
    const body: MartaApiResponse = {
      vehicles: MOCK_VEHICLES,
      cached: false,
      source: 'mock',
    };
    return Response.json(body);
  }

  try {
    const vehicles = await fetchMartaVehicles();
    const isMock = vehicles === MOCK_VEHICLES;
    const body: MartaApiResponse = {
      vehicles,
      cached: true,
      source: isMock ? 'mock' : 'live',
    };
    return Response.json(body);
  } catch (err) {
    console.error('[/api/marta] feed fetch failed:', err);
    const body: MartaApiResponse = {
      vehicles: MOCK_VEHICLES,
      cached: false,
      source: 'mock',
    };
    return Response.json(body);
  }
}
