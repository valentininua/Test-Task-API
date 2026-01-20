import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    process.env.MONGO_URI = mongo.getUri('test_task');
    process.env.SEED_ON_STARTUP = 'false';
    process.env.OUTBOX_POLL_INTERVAL_MS = '1000000';
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_USERNAME = 'admin';
    process.env.AUTH_PASSWORD = 'admin';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  it('POST /api/v1/add-user should create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/add-user')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(typeof res.body.name).toBe('string');
    expect(typeof res.body.email).toBe('string');
    expect(typeof res.body.phone).toBe('string');
  });

  it('GET /api/v1/get-users should paginate with cursor', async () => {
    // create a few users
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/add-user')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `User ${i}`, email: `u${i}@example.com`, phone: `+1000000000${i}` })
        .expect(201);
    }

    const page1 = await request(app.getHttpServer())
      .get('/api/v1/get-users')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 2 })
      .expect(200);

    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.nextCursor).toBeDefined();

    const page2 = await request(app.getHttpServer())
      .get('/api/v1/get-users')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 2, cursor: page1.body.nextCursor })
      .expect(200);

    expect(page2.body.items).toHaveLength(2);
    expect(page2.body.items[0].id).not.toBe(page1.body.items[0].id);
  });

  it('GET /api/v1/get-users should filter by name', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/add-user')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unique Filter Name', email: 'unique@example.com', phone: '+19999999999' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/v1/get-users')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'Unique Filter' })
      .expect(200);

    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.some((u: any) => u.name.includes('Unique'))).toBe(true);
  });

  it('GET /api/v1/get-user/:id should return user by id', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/add-user')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ById User', email: 'byid@example.com', phone: '+18888888888' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/get-user/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(created.body.id);
    expect(res.body.email).toBe('byid@example.com');
  });

  it('GET /api/v1/get-user/:id should 404 for missing', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/get-user/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});

