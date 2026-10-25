// Widget CRUD. Every route runs behind requireUser, so c.get('userId') is the
// logged-in user and queries are scoped to that user's widgets.
import { readJson } from '../http.js';

const isId = (value) => /^\d+$/.test(String(value));
const badId = (c) => c.json({ error: 'Invalid widget id.' }, 400);
const found = (c, widget) =>
  widget ? c.json(widget) : c.json({ error: 'Widget not found.' }, 404);

export default {
  read: async (c) => {
    const db = c.get('db');
    return c.json(await db.widgets.read_widget([c.get('userId')]));
  },

  create: async (c) => {
    const db = c.get('db');
    const { widget_name, x, y, w, h, o1, o2, o3, o4, o5, o6 } = await readJson(c);
    const [widget] = await db.widgets.create_widget([
      c.get('userId'),
      widget_name,
      x,
      y,
      w,
      h,
      o1,
      o2,
      o3,
      o4,
      o5,
      o6,
    ]);
    return c.json(widget);
  },

  position: async (c) => {
    const db = c.get('db');
    const masterId = c.req.param('master_id');
    if (!isId(masterId)) return badId(c);
    const { x, y, w, h } = await readJson(c);
    const [widget] = await db.widgets.widget_position([x, y, w, h, masterId, c.get('userId')]);
    return found(c, widget);
  },

  settings: async (c) => {
    const db = c.get('db');
    const masterId = c.req.param('master_id');
    if (!isId(masterId)) return badId(c);
    const { o1, o2, o3, o4, o5, o6 } = await readJson(c);
    const [widget] = await db.widgets.widget_settings([
      o1,
      o2,
      o3,
      o4,
      o5,
      o6,
      masterId,
      c.get('userId'),
    ]);
    return found(c, widget);
  },

  delete: async (c) => {
    const db = c.get('db');
    const masterId = c.req.param('master_id');
    if (!isId(masterId)) return badId(c);
    const [widget] = await db.widgets.delete_widget([masterId, c.get('userId')]);
    return found(c, widget);
  },
};
