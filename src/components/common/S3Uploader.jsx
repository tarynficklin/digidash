// React 19 replacement for react-s3-uploader's <ReactS3Uploader>.
// That package (last released 2020) calls ReactDOM.findDOMNode, which React 19
// removed, and drags in the end-of-life aws-sdk v2. This component keeps the
// same props and the same signing-server contract, so code written against
// react-s3-uploader's README works by changing the import:
//
//   import S3Uploader from '../common/S3Uploader';
//   <S3Uploader signingUrl="/api/s3/sign" accept="image/*" onFinish={(r) => ...} />
//
// Flow: GET `${server}${signingUrl}?objectName=<name>&contentType=<type>[&path=<s3path>]`
// must return JSON with { signedUrl, publicUrl?, headers? }; the file is then PUT to
// signedUrl. Nothing in the app renders this yet, and the server has no signing
// route yet (see README "S3 uploads"; @aws-sdk/s3-request-presigner can create the URL).
import React, { useImperativeHandle, useRef } from 'react';

const defaultScrub = (filename) => filename.replace(/[^\w\d_\-.]+/gi, '');
const valueOf = (option) => (typeof option === 'function' ? option() : option);

function errorContext(xhr) {
  return { response: xhr.responseText, status: xhr.status, statusText: xhr.statusText, readyState: xhr.readyState };
}

export default function S3Uploader({
  signingUrl = '/sign-s3',
  signingUrlMethod = 'GET',
  signingUrlHeaders,
  signingUrlQueryParams,
  signingUrlWithCredentials,
  getSignedUrl,
  preprocess = (file, next) => next(file),
  onSignedUrl = () => {},
  onProgress = () => {},
  onFinish = () => {},
  onError = (message) => console.error('Upload error:', message),
  uploadRequestHeaders,
  contentDisposition,
  server = '',
  scrubFilename = defaultScrub,
  s3path = '',
  autoUpload = true,
  inputRef,
  ref,
  ...inputProps
}) {
  const input = useRef(null);
  const requests = useRef([]);

  function requestSignedUrl(file, callback) {
    const params = new URLSearchParams({ objectName: scrubFilename(file.name), contentType: file.type });
    if (s3path) params.set('path', s3path);
    Object.entries(valueOf(signingUrlQueryParams) ?? {}).forEach(([k, v]) => params.set(k, v));

    const xhr = new XMLHttpRequest();
    xhr.open(signingUrlMethod, `${server}${signingUrl}?${params}`, true);
    if (signingUrlWithCredentials != null) xhr.withCredentials = signingUrlWithCredentials;
    Object.entries(valueOf(signingUrlHeaders) ?? {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onload = () => {
      if (xhr.status !== 200 && xhr.status !== 201) {
        return onError(`Could not contact request signing server. Status = ${xhr.status}`, file, errorContext(xhr));
      }
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        return onError('Invalid response from server', file, errorContext(xhr));
      }
      onSignedUrl(result);
      callback(result);
    };
    xhr.onerror = () => onError('Could not contact request signing server.', file, errorContext(xhr));
    xhr.send();
  }

  function uploadToS3(file, signResult) {
    const xhr = new XMLHttpRequest();
    requests.current.push(xhr);
    xhr.open('PUT', signResult.signedUrl, true);

    const headers = { 'content-type': file.type };
    if (contentDisposition) {
      const disposition =
        contentDisposition === 'auto' ? (file.type.startsWith('image/') ? 'inline' : 'attachment') : contentDisposition;
      headers['content-disposition'] = `${disposition}; filename="${scrubFilename(file.name)}"`;
    }
    if (!uploadRequestHeaders) headers['x-amz-acl'] = 'public-read';
    [signResult.headers, uploadRequestHeaders].filter(Boolean).forEach((extra) =>
      Object.entries(extra).forEach(([k, v]) => (headers[k.toLowerCase()] = v))
    );
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent, percent === 100 ? 'Finalizing' : 'Uploading', file);
    };
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        onProgress(100, 'Upload completed', file);
        onFinish(signResult, file);
      } else {
        onError(`Upload error: ${xhr.status}`, file, errorContext(xhr));
      }
    };
    xhr.onerror = () => onError('XHR error', file, errorContext(xhr));
    xhr.send(file);
  }

  function uploadFile() {
    requests.current = [];
    for (const file of input.current?.files ?? []) {
      preprocess(file, (processed) => {
        onProgress(0, 'Waiting', processed);
        const upload = (signResult) => uploadToS3(processed, signResult);
        getSignedUrl ? getSignedUrl(processed, upload) : requestSignedUrl(processed, upload);
      });
    }
  }

  // Same imperative methods as ReactS3Uploader: ref.current.uploadFile() / abort() / clear()
  useImperativeHandle(ref, () => ({
    uploadFile,
    abort: () => requests.current.forEach((xhr) => xhr.abort()),
    clear: () => {
      if (input.current) input.current.value = '';
    },
  }));

  function setInput(node) {
    input.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef) inputRef.current = node;
  }

  return <input {...inputProps} type="file" ref={setInput} onChange={autoUpload ? uploadFile : inputProps.onChange} />;
}
