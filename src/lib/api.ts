import type { DailyData } from '@/types';

export async function fetchDailyData(date: string): Promise<DailyData> {
  const response = await fetch(`/api/daily?date=${encodeURIComponent(date)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch daily data: ${response.status}`);
  }
  
  return response.json();
}