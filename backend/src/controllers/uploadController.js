// Local file storage for user uploads (replaces the S3 uploader experiment). Files are
// written to UPLOAD_DIR (default: backend/uploads) under the uploader's user id and
// served back at /uploads/<user_id>/<file>.
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

export const uploadDir = (root) =>
  path.resolve(process.env.UPLOAD_DIR || path.join(root, 'uploads'));

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
    const key = `${userId}/${crypto.randomUUID()}.${extension}`;
    await mkdir(path.join(dir, userId), { recursive: true });
    await Bun.write(path.join(dir, key), file);
    return c.json({ key, publicUrl: `/uploads/${key}` }, 201);
  },
});
