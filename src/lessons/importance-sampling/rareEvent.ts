import { normalIntervalProbability } from './simulation';

// shared by Step3 (naive Monte Carlo) and Step4 (importance sampling) so both
// steps always estimate the exact same rare event and stay visually comparable
export const RARE_INTERVAL: [number, number] = [3, 5];
export const RARE_INTERVAL_LABEL = '[3, 5]';
export const RARE_DOMAIN: [number, number] = [-4, 6];
export const RARE_TRUE_VALUE = normalIntervalProbability(...RARE_INTERVAL);
export const RARE_RUNNING_ESTIMATE_Y_MAX = RARE_TRUE_VALUE * 4;
