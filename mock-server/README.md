# mock-server

Temporary dev-only stub so `admin-web` has something to log in against before `Backend-web` is built. Accepts any non-empty identifier/password, sets a mock session cookie.

## Run

```
npm install
npm start
```

Listens on `http://localhost:4000`, matching `admin-web/.env`'s `VITE_API_URL`.

## Delete this folder once `Backend-web` implements the real `/auth/*` endpoints.
