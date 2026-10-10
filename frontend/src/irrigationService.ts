
import type { FarmWeather } from "./weatherService";

export type IrrigationDecision =
  | "IRRIGATE"
  | "WAIT AND RECHECK"
  | "KEEP OFF";

export type IrrigationResult = {
  fieldName: string;
  moisture: number;
  threshold: number;
  decision: IrrigationDecision;
  reason: string;
};

// SIMULATED readings only — replace with sensor data later.
const simulatedFields: Record<
  string,
  { moisture: number; threshold: number }
> = {
  "North Plot": { moisture: 18, threshold: 30 },
  "East Plot": { moisture: 32, threshold: 35 },
  "South Field": { moisture: 48, threshold: 30 },
  "West Field": { moisture: 45, threshold: 40 },
};

export function getIrrigationDecision(
  fieldName: string,
  weather: FarmWeather | null
): IrrigationResult {
  const field = simulatedFields[fieldName] ?? {
    moisture: 25,
    threshold: 30,
  };

  let decision: IrrigationDecision;
  let reason: string;

  if (field.moisture >= field.threshold) {
    decision = "KEEP OFF";
    reason = "Simulated soil moisture is at or above its threshold.";
  } else if (!weather) {
    decision = "WAIT AND RECHECK";
    reason = "Weather data is unavailable; check field conditions first.";
  } else if (
    weather.rainProbability >= 60 ||
    weather.rainfall >= 1
  ) {
    decision = "WAIT AND RECHECK";
    reason =
      "Soil moisture is below threshold, but the nearest forecast hour indicates possible rain. Reassess the field before watering.";
  } else {
    decision = "IRRIGATE";
    reason =
      "Simulated soil moisture is below threshold and the nearest forecast hour indicates limited rain. Verify field conditions before watering.";
  }

  return {
    fieldName,
    moisture: field.moisture,
    threshold: field.threshold,
    decision,
    reason,
  };
}