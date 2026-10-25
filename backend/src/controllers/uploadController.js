// Local file storage for user uploads (replaces the S3 uploader experiment). Files live in the
// app's data folder, DATA_PATH (e.g. E:/Documents/Sites/legacy/digidash), as in the lockwood apps:
// <DATA_PATH>/uploads/backgrounds/<user_id>/<file>, served back at /uploads/backgrounds/....
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const dataPath = () => {
  if (!process.env.DATA_PATH)
    throw new Error("DATA_PATH is not set: point it at the app's data folder in backend/.env");
  return path.resolve(process.env.DATA_PATH);
};

export const uploadDir = () => path.join(dataPath(), 'uploads');

// The uploads' folder under uploadDir(): the background picker is the only uploader.
const BACKGROUNDS = 'backgrounds';

export default (dir) => ({
  // POST /api/uploads (multipart, field "file") -> 201 { key, publicUrl }
  create: async (c) => {
    const body = await c.req.parseBody();
    const file = body.file;
    if (!(file instanceof File))
      return c.json({ error: 'Expected a multipart "file" field.' }, 400);
    const extension = EXTENSIONS[file.type];
    if (!extension)
      return c.json({ error: 'Only JPEG, PNG, WebP, GIF or AVIF images are allowed.' }, 415);
    if (file.size > MAX_UPLOAD_BYTES)
      return c.json({ error: 'Images must be 10 MB or smaller.' }, 413);

    const userId = String(c.get('userId'));
    const key = `${BACKGROUNDS}/${userId}/${crypto.randomUUID()}.${extension}`;
    await mkdir(path.join(dir, BACKGROUNDS, userId), { recursive: true });
    await Bun.write(path.join(dir, key), file);
    return c.json({ key, publicUrl: `/uploads/${key}` }, 201);
  },
});
