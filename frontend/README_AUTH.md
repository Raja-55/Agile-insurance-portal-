Auth setup

1. Create a Google OAuth 2.0 Client ID
   - Visit https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add your dev origin (e.g. http://localhost:5173) to Authorized JavaScript origins
   - Copy Client ID into `frontend/.env.local` as `VITE_GOOGLE_CLIENT_ID`

2. Create a Facebook App
   - Visit https://developers.facebook.com/apps/
   - Create an app and add Facebook Login product
   - Configure OAuth redirect URIs and valid OAuth origins
   - Copy App ID into `frontend/.env.local` as `VITE_FACEBOOK_APP_ID`

3. Use local env
   - Copy `frontend/.env.example` → `frontend/.env.local` and fill values
   - Restart the Vite dev server after changing env vars

4. Verify in browser
   - Open DevTools Console and check `window.google` and `window.FB` are defined after page load
   - Network tab should show `accounts.google.com/gsi/client` and `connect.facebook.net` scripts
