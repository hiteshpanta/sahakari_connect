// Wrapper around fetch that uses cookie-based auth and transparently
// refreshes the access token (via /api/auth/refresh) once when the server
// responds 401, then retries the original request.
let refreshing = null;

async function refreshAccessToken() {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Refresh failed');
        return res.json();
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export default async function apiFetch(url, options = {}) {
  const doFetch = (opts) => fetch(url, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });

  let res = await doFetch(options);

  if (res.status === 401) {
    try {
      await refreshAccessToken();
      res = await doFetch(options);
    } catch {
      // Refresh failed - return the original 401 response
    }
  }

  return res;
}
