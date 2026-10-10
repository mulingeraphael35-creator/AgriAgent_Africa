
export type FarmWeather = {
  temperature: number;
  rainProbability: number;
  rainfall: number;
  forecastTime: string;
};

export async function getFarmWeather(
  latitude: number,
  longitude: number
): Promise<FarmWeather> {
  const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set(
    "hourly",
    "precipitation_probability,precipitation"
  );
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to retrieve the weather forecast.");
  }

  const data = await response.json();

  const currentTime = data.current.time as string;
  const hourlyTimes = data.hourly.time as string[];
  const probabilities = data.hourly
    .precipitation_probability as number[];
  const rainfallValues = data.hourly.precipitation as number[];

  let nearestIndex = hourlyTimes.findIndex(
    (time) => time >= currentTime
  );

  if (nearestIndex < 0) {
    nearestIndex = 0;
  }

  return {
    temperature: data.current.temperature_2m,
    rainProbability: probabilities[nearestIndex] ?? 0,
    rainfall: rainfallValues[nearestIndex] ?? 0,
    forecastTime: hourlyTimes[nearestIndex] ?? currentTime,
  };
}