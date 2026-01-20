## Test task server (NestJS + MongoDB)

### Что сделано
- **Framework**: NestJS (Node.js **v22+**)
- **DB**: MongoDB + **Mongoose**
- **Архитектура**: DDD-style folders + **CQRS** (`@nestjs/cqrs`)
- **Pagination**: **cursor-based** (по `_id`, base64 cursor)
- **Outbox**: коллекция `outbox_events` + processor (claim/lock + retries), который “доставляет” события через логирование
- **Swagger**: доступен на `GET /api/docs`
- **JWT auth**: Bearer token в `Authorization: Bearer <token>`

### Эндпоинты (как в задании)
- `POST /api/v1/add-user` — создаёт пользователя (если поля не переданы — генерируются случайно), сохраняет в Mongo и пишет лог
- `GET /api/v1/get-users` — cursor pagination + фильтры `name/email/phone`
- `GET /api/v1/get-user/:id` — получить пользователя по id

Дополнительно (нужно чтобы получить JWT):
- `POST /api/v1/auth/login` — выдаёт `accessToken`

### Запуск через Docker
1) Создайте `.env` (копия `env.example`)

2) Запуск:

```bash
docker compose up --build
```

Или одной командой:

```bash
chmod +x ./run.sh && ./run.sh
```

Swagger: `http://localhost:3000/api/docs`

### Auth
Для тестового задания авторизация упрощена: есть один “технический” пользователь.
Логин/пароль берутся из env:
- `AUTH_USERNAME` (по умолчанию `admin`)
- `AUTH_PASSWORD` (по умолчанию `admin`)

Получить токен:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'
```

### Seed 2,000,000 пользователей
На старте, если коллекция `users` пустая и `SEED_ON_STARTUP=true`, сервис создаст `SEED_USERS_COUNT` пользователей батчами `SEED_BATCH_SIZE`.

Важно: запросы `get-users/get-user` ждут окончания сидинга (чтобы не было гонок на первом запуске).

### Outbox
При создании пользователя пишется запись в `outbox_events` со статусом `PENDING`.
Фоновый процессор:
- атомарно “забирает” событие (`PENDING/FAILED -> PROCESSING`), чтобы избежать дублей при нескольких инстансах
- “доставляет” событие (в рамках задания — логирует)
- помечает `PROCESSED`, а при ошибке — `FAILED` с backoff и повторами



