#!/bin/sh
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__env__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}",
  VITE_CDN_BASE_URL: "${VITE_CDN_BASE_URL}",
  VITE_GITHUB_CLIENT_ID: "${VITE_GITHUB_CLIENT_ID}",
  VITE_GOOGLE_CLIENT_ID: "${VITE_GOOGLE_CLIENT_ID}"
};
EOF
exec nginx -g "daemon off;"
