## Test Task Server (NestJS + MongoDB)

### What’s implemented
- **Framework**: NestJS (Node.js **v22+**)
- **DB**: MongoDB + **Mongoose**
- **Architecture**: DDD-style folders + **CQRS** (`@nestjs/cqrs`)
- **Pagination**: **cursor-based** (by `_id`, base64 cursor)
- **Outbox**: `outbox_events` collection + processor (claim/lock + retries) that “delivers” events via logging
- **Swagger**: available at `GET /api/docs`
- **JWT auth**: Bearer token in `Authorization: Bearer <token>`

### Endpoints (as per the task)
- `POST /api/v1/add-user` — creates a user (if fields are not provided, they are generated randomly), saves to MongoDB and writes a log
- `GET /api/v1/get-users` — cursor-based pagination + filters by `name/email/phone`
- `GET /api/v1/get-user/:id` — get a user by id

Additional (required to obtain JWT):
- `POST /api/v1/auth/login` — returns an `accessToken`

### Run with Docker
1) Create `.env` (copy from `env.example`)

2) Run:

```bash
docker compose up --build
```

Or in a single command:

```bash
chmod +x ./run.sh && ./run.sh
```

Swagger: `http://localhost:3000/api/docs`

### Auth
For the test task, authorization is simplified: there is a single “technical” user.
Login/password are taken from env:
- `AUTH_USERNAME` (default: `admin`)
- `AUTH_PASSWORD` (default: `admin`)

Get a token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'
```

### Seeding 2,000,000 users
On startup, if the `users` collection is empty and `SEED_ON_STARTUP=true`, the service will create `SEED_USERS_COUNT` users in batches of `SEED_BATCH_SIZE`.

**Important:** `get-users` / `get-user` requests wait until seeding is finished (to avoid race conditions on the first run).

### Outbox
When a user is created, a record is written to `outbox_events` with status `PENDING`.

Background processor:
- atomically claims an event (`PENDING/FAILED → PROCESSING`) to avoid duplicates across multiple instances
- delivers the event (for this task — logs it)
- marks it as `PROCESSED`, or as `FAILED` on error with backoff and retries



![Screenshot](<Screenshot 2026-01-20 at 12.11.56 PM.png>)




