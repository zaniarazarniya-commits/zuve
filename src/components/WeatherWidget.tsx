"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  windspeed: number;
  code: number;
}

function weatherDescription(code: number): string {
  if (code === 0) return "Klart";
  if (code === 1) return "Mestadels klart";
  if (code === 2) return "Delvis molnigt";
  if (code === 3) return "Mulet";
  if (code <= 48) return "Dimma";
  if (code <= 57) return "Duggregn";
  if (code <= 67) return "Regn";
  if (code <= 77) return "Snö";
  if (code <= 82) return "Regnskurar";
  return "Åska";
}

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=58.2755&longitude=11.4390&current=temperature_2m,weathercode,windspeed_10m&timezone=Europe/Stockholm"
    )
      .then((r) => r.json())
      .then((d) =>
        setWeather({
          temperature: Math.round(d.current.temperature_2m),
          windspeed: Math.round(d.current.windspeed_10m),
          code: d.current.weathercode,
        })
      )
      .catch(() => {});
  }, []);

  if (!weather) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-2 px-5 rounded-2xl bg-white/60 border border-sand/50 mx-auto w-fit">
      <span className="text-xl leading-none">{weatherEmoji(weather.code)}</span>
      <div>
        <p className="text-sm font-semibold text-foreground leading-none">{weather.temperature}°C</p>
        <p className="text-[10px] text-granite-light mt-0.5">
          {weatherDescription(weather.code)} · {weather.windspeed} m/s
        </p>
      </div>
    </div>
  );
}
