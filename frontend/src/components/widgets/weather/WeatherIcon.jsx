// Replaces react-skycons (last released 2020; its canvas engine "skycons" is
// unmaintained). Maps Dark Sky / Skycons icon names (e.g. "CLEAR_DAY" or
// "clear-day") to Font Awesome 5.2 icons, which index.html already loads.
import React from 'react';

const ICONS = {
  CLEAR_DAY: 'fa-sun',
  CLEAR_NIGHT: 'fa-moon',
  PARTLY_CLOUDY_DAY: 'fa-cloud',
  PARTLY_CLOUDY_NIGHT: 'fa-cloud',
  CLOUDY: 'fa-cloud',
  RAIN: 'fa-umbrella',
  SLEET: 'fa-tint',
  SNOW: 'fa-snowflake',
  WIND: 'fa-cloud',
  FOG: 'fa-cloud',
  THUNDERSTORM: 'fa-bolt',
};

export default function WeatherIcon({ icon, color = 'white', size = 40 }) {
  const name = String(icon ?? '')
    .toUpperCase()
    .replace(/-/g, '_');
  return (
    <i
      className={`fas ${ICONS[name] ?? 'fa-cloud'}`}
      style={{ color, fontSize: size, margin: '10px 0' }}
      role="img"
      aria-label={name.toLowerCase().replace(/_/g, ' ') || 'weather'}
    />
  );
}
