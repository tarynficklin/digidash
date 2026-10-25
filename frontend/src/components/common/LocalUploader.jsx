// Uploads an image to the API's local file storage (POST /api/uploads) and replaces
// the old S3 uploader experiment. Renders a button that opens the file picker, then
// calls onFinish({ key, publicUrl }) or onError(message).

import axios from 'axios';
import React, { useRef, useState } from 'react';

export default function LocalUploader({
  accept = 'image/*',
  className,
  children = 'Upload',
  onFinish,
  onError,
}) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post('/api/uploads', form);
      onFinish?.(res.data);
    } catch (err) {
      onError?.(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? 'Uploading…' : children}
      </button>
    </>
  );
}
