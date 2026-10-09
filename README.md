# nodejs-ecommerce-api

E-commerce REST API built with Express 5 and MongoDB (Mongoose).

## Setup

Requires Node 20+ and a running MongoDB.

```sh
npm install
cp .env.example .env   # then set JWT_PRIVATE_KEY
npm run dev            # restarts on file changes; `npm start` for production
npm test               # uses a throwaway `ecommerce-api-test` database
```

Register a user, then promote them to admin:

```sh
npm run make-admin -- you@example.com
```

## Auth

`POST /api/v1/users/login` returns `{ user, token }`. Send the token as `Authorization: Bearer <token>`.

## Endpoints (`/api/v1`)

| Method | Path | Access |
| --- | --- | --- |
| POST | `/users/register`, `/users/login` | public |
| GET | `/users/me` | user |
| GET | `/users/:id` | self or admin |
| GET | `/users` | admin |
| GET | `/categories`, `/categories/:id` | public |
| POST, PUT, DELETE | `/categories`, `/categories/:id` | admin |
| GET | `/products?category=<id>&featured=true&page=1&limit=20`, `/products/:id` | public |
| POST, PUT, DELETE | `/products`, `/products/:id` | admin |
| POST | `/orders` | user |
| GET | `/orders/mine`, `/orders/:id` (own) | user |
| GET | `/orders` | admin |
| PUT | `/orders/:id/status` | admin |

Placing an order reserves stock and prices items from the database. Cancelling an order puts the stock back.
