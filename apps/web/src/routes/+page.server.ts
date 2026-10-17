import { missionsOfLot, progress } from '#lib/missions.server.js';
import type { PageServerLoad } from './$types';

const LOT = 0;

export const load: PageServerLoad = () => {
  const missions = missionsOfLot(LOT);
  return { lot: LOT, missions, progress: progress(missions) };
};
