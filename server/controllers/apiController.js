// Third-party API proxies used by the widgets. Keys come from .env (names kept
// from the CRA days). Several of these services have been shut down or changed
// since 2018; failures are reported as 502 instead of crashing the server.
import axios from 'axios';
import { readJson } from '../http.js';

const { REACT_APP_WEATHERKEY, REACT_APP_DICTIONARY_ID, REACT_APP_DICTIONARY_KEY, REACT_APP_PLACES } = process.env;

// Describe an upstream failure without echoing request URLs (they contain API keys).
function upstreamError(c, service, err) {
  const message = err?.response
    ? `${service} responded with HTTP ${err.response.status}`
    : `${service} request failed (${err?.code || 'network error'})`;
  console.error(message);
  return c.json({ error: message }, 502);
}

export default {
  // Oxford Dictionaries API v2 (what the oxford-dictionary package called).
  dictionary: async (c) => {
    const { query } = await readJson(c);
    const word = String(query ?? '').trim().toLowerCase();
    if (!word) return c.json({ error: 'Missing query.' }, 400);
    try {
      const api = await axios.get(
        `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${encodeURIComponent(word)}`,
        {
          params: { fields: 'definitions' },
          headers: { Accept: 'application/json', app_id: REACT_APP_DICTIONARY_ID, app_key: REACT_APP_DICTIONARY_KEY },
        }
      );
      return c.json(api.data);
    } catch (err) {
      return upstreamError(c, 'Oxford Dictionaries', err);
    }
  },

  // Dark Sky (shut down by Apple in 2023).
  weather: async (c) => {
    const { lat, lng } = await readJson(c);
    try {
      const api = await axios.get(`https://api.darksky.net/forecast/${REACT_APP_WEATHERKEY}/${lat},${lng}`);
      return c.json(api.data);
    } catch (err) {
      return upstreamError(c, 'Dark Sky', err);
    }
  },

  getplaces: async (c) => {
    const { lat, lng } = await readJson(c);
    try {
      const api = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: { location: `${lat},${lng}`, radius: 1500, type: 'restaurant', keyword: 'cruise', key: REACT_APP_PLACES },
      });
      return c.json(api.data);
    } catch (err) {
      return upstreamError(c, 'Google Places', err);
    }
  },

  // Saves the background picked in the Unsplash picker (behind requireUser).
  unsplash: async (c) => {
    const db = c.get('db');
    const { image, color, theme } = await readJson(c);
    const [user] = await db.users.user_wallpaper([image, color, theme, c.get('userId')]);
    return c.json(user);
  },

  // free.currencyconverterapi.com v5 (keyless endpoint, since retired).
  getcurency: async (c) => {
    const { val1, val2 } = await readJson(c);
    try {
      const api = await axios.get('http://free.currencyconverterapi.com/api/v5/convert', {
        params: { q: `${val1}_${val2}`, count: 2 },
      });
      return c.json(api.data);
    } catch (err) {
      return upstreamError(c, 'Currency converter', err);
    }
  },
};
