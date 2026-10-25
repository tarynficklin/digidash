// Third-party API proxies used by the widgets. Weather, dictionary and currency use
// free keyless APIs and are reshaped into the Dark Sky / Oxford / currencyconverterapi
// responses the widgets were written against. Places still needs a key from .env.
// Failures are reported as 502 instead of crashing the server.
import axios from 'axios';
import { readJson } from '../http.js';

const { REACT_APP_PLACES } = process.env;

// WMO weather codes (Open-Meteo) -> Dark Sky icon, summary and precipitation type.
const WMO = [
  [[0], 'clear-day', 'Clear'],
  [[1], 'partly-cloudy-day', 'Mainly clear'],
  [[2], 'partly-cloudy-day', 'Partly cloudy'],
  [[3], 'cloudy', 'Overcast'],
  [[45, 48], 'fog', 'Fog'],
  [[51, 53, 55], 'rain', 'Drizzle', 'rain'],
  [[56, 57], 'sleet', 'Freezing drizzle', 'sleet'],
  [[61, 63, 65], 'rain', 'Rain', 'rain'],
  [[66, 67], 'sleet', 'Freezing rain', 'sleet'],
  [[71, 73, 75, 77], 'snow', 'Snow', 'snow'],
  [[80, 81, 82], 'rain', 'Rain showers', 'rain'],
  [[85, 86], 'snow', 'Snow showers', 'snow'],
  [[95, 96, 99], 'thunderstorm', 'Thunderstorms', 'rain'],
];

function describeWeather(code) {
  const [, icon, summary, precipType] = WMO.find(([codes]) => codes.includes(code)) ?? [
    null,
    'cloudy',
    'Cloudy',
  ];
  return { icon, summary, precipType };
}

const round = (n, places = 0) => (n == null ? null : Number(n.toFixed(places)));

// Wiktionary definitions are HTML snippets; the widget shows plain text.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const htmlToText = (html) =>
  String(html)
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, e) =>
      e[0] === '#'
        ? String.fromCodePoint(
            e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)),
          )
        : (ENTITIES[e.toLowerCase()] ?? m),
    )
    .trim();

class NotFound extends Error {}

// Free Dictionary API (dictionaryapi.dev) -> [{ partOfSpeech, definition }]
async function freeDictionary(word) {
  try {
    const api = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    return api.data
      .flatMap((entry) => entry.meanings ?? [])
      .filter((m) => m.definitions?.length)
      .map((m) => ({ partOfSpeech: m.partOfSpeech, definition: m.definitions[0].definition }));
  } catch (err) {
    if (err?.response?.status === 404) throw new NotFound();
    throw err;
  }
}

// Wiktionary REST API (Wikimedia) -> [{ partOfSpeech, definition }]
async function wiktionary(word) {
  try {
    const api = await axios.get(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      {
        headers: { 'User-Agent': 'digidash (local development)' },
      },
    );
    return (api.data.en ?? [])
      .map((m) => ({
        partOfSpeech: m.partOfSpeech.toLowerCase(),
        definition: htmlToText(m.definitions?.[0]?.definition ?? ''),
      }))
      .filter((m) => m.definition);
  } catch (err) {
    if (err?.response?.status === 404) throw new NotFound();
    throw err;
  }
}

// Describe an upstream failure without echoing request URLs (they contain API keys).
function upstreamError(c, service, err) {
  const message = err?.response
    ? `${service} responded with HTTP ${err.response.status}`
    : `${service} request failed (${err?.code || 'network error'})`;
  console.error(message);
  return c.json({ error: message }, 502);
}

export default {
  // Free Dictionary API, falling back to Wiktionary when it's down, reshaped like
  // Oxford Dictionaries v2: results[0].lexicalEntries[].entries[0].senses[0].definitions
  dictionary: async (c) => {
    const { query } = await readJson(c);
    const word = String(query ?? '')
      .trim()
      .toLowerCase();
    if (!word) return c.json({ error: 'Missing query.' }, 400);
    let meanings;
    try {
      meanings = await freeDictionary(word);
    } catch (err) {
      if (!(err instanceof NotFound))
        console.error(
          `Free Dictionary API failed (${err?.response?.status ?? err?.code}); trying Wiktionary`,
        );
      try {
        meanings = await wiktionary(word);
      } catch (fallbackErr) {
        if (fallbackErr instanceof NotFound)
          return c.json({ error: `No definitions found for "${word}".` }, 404);
        return upstreamError(c, 'Wiktionary', fallbackErr);
      }
    }
    if (!meanings.length) return c.json({ error: `No definitions found for "${word}".` }, 404);
    const lexicalEntries = meanings.map((m) => ({
      lexicalCategory: { text: m.partOfSpeech },
      entries: [{ senses: [{ definitions: [m.definition] }] }],
    }));
    return c.json({ id: word, results: [{ id: word, word, lexicalEntries }] });
  },

  // Open-Meteo 7-day forecast, reshaped like Dark Sky's daily.data (°F, mph,
  // humidity and precipitation probability as 0-1, visibility in miles).
  weather: async (c) => {
    const { lat, lng } = await readJson(c);
    try {
      const api = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          daily: [
            'weather_code',
            'apparent_temperature_max',
            'apparent_temperature_min',
            'precipitation_probability_max',
            'wind_speed_10m_max',
            'wind_gusts_10m_max',
            'relative_humidity_2m_mean',
            'visibility_mean',
          ].join(','),
          temperature_unit: 'fahrenheit',
          wind_speed_unit: 'mph',
          timezone: 'auto',
          forecast_days: 7,
        },
      });
      const d = api.data.daily;
      const data = d.time.map((day, i) => {
        const { icon, summary, precipType } = describeWeather(d.weather_code[i]);
        return {
          time: Math.floor(new Date(`${day}T12:00:00Z`).getTime() / 1000),
          icon,
          summary,
          precipType,
          apparentTemperatureHigh: round(d.apparent_temperature_max[i]),
          apparentTemperatureLow: round(d.apparent_temperature_min[i]),
          precipProbability: round((d.precipitation_probability_max[i] ?? 0) / 100, 2),
          humidity: round((d.relative_humidity_2m_mean[i] ?? 0) / 100, 2),
          windSpeed: round(d.wind_speed_10m_max[i], 1),
          windGust: round(d.wind_gusts_10m_max[i], 1),
          visibility:
            d.visibility_mean[i] == null ? null : round(d.visibility_mean[i] / 1609.344, 1),
        };
      });
      return c.json({
        latitude: api.data.latitude,
        longitude: api.data.longitude,
        timezone: api.data.timezone,
        daily: { data },
      });
    } catch (err) {
      return upstreamError(c, 'Open-Meteo', err);
    }
  },

  getplaces: async (c) => {
    const { lat, lng } = await readJson(c);
    try {
      const api = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${lat},${lng}`,
          radius: 1500,
          type: 'restaurant',
          keyword: 'cruise',
          key: REACT_APP_PLACES,
        },
      });
      return c.json(api.data);
    } catch (err) {
      return upstreamError(c, 'Google Places', err);
    }
  },

  // GET /api/unsplash/search?query= (behind requireUser): the background picker's Unsplash
  // search, with UNSPLASH_KEY kept here instead of in the browser. Answers Unsplash's results.
  unsplashSearch: async (c) => {
    const query = c.req.query('query');
    const { UNSPLASH_KEY } = process.env;
    if (typeof query !== 'string' || !query.trim())
      return c.json({ error: 'Expected a search query.' }, 400);
    if (!UNSPLASH_KEY) return c.json({ error: 'Unsplash is not configured.' }, 503);
    try {
      const api = await axios.get('https://api.unsplash.com/search/photos', {
        // 30 is Unsplash's maximum; the 40 the picker used to ask for got the default 10
        params: { page: 1, per_page: 30, query },
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      });
      return c.json(api.data?.results ?? []);
    } catch (err) {
      return upstreamError(c, 'Unsplash', err);
    }
  },

  // Saves the background picked in the Unsplash picker (behind requireUser).
  unsplash: async (c) => {
    const db = c.get('db');
    const { image, color, theme } = await readJson(c);
    const [user] = await db.users.user_wallpaper([image, color, theme, c.get('userId')]);
    return c.json(user);
  },

  // Frankfurter (ECB reference rates), reshaped like currencyconverterapi v5:
  // results["USD_EUR"] = { id, fr, to, val }
  getcurency: async (c) => {
    const { val1, val2 } = await readJson(c);
    const from = String(val1 ?? '').toUpperCase();
    const to = String(val2 ?? '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to))
      return c.json({ error: 'Expected 3-letter currency codes.' }, 400);
    const id = `${from}_${to}`;
    if (from === to)
      return c.json({ query: { count: 1 }, results: { [id]: { id, fr: from, to, val: 1 } } });
    try {
      const api = await axios.get('https://api.frankfurter.dev/v1/latest', {
        params: { base: from, symbols: to },
      });
      const val = api.data.rates?.[to];
      if (val == null) return c.json({ error: `No rate for ${from} to ${to}.` }, 404);
      return c.json({
        query: { count: 1 },
        date: api.data.date,
        results: { [id]: { id, fr: from, to, val } },
      });
    } catch (err) {
      return upstreamError(c, 'Frankfurter', err);
    }
  },
};
