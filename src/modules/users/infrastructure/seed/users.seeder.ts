import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { getConfig } from '../../../../shared/config/get-config';
import { randomUser } from '../../presentation/utils/random-user';
import { UsersRepository } from '../persistence/users.repository';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function makeSeedEmail(name: string, globalIndex: number): string {
  const base = slugify(name) || 'user';
  return `${base}.${globalIndex}@example.com`;
}

function makeSeedPhone(globalIndex: number): string {
  const suffix = String(globalIndex % 10_000_000_000).padStart(10, '0');
  return `+1${suffix}`;
}

@Injectable()
export class UsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(UsersSeeder.name);
  private readyPromise: Promise<void> | null = null;
  private resolveReady: (() => void) | null = null;

  constructor(private readonly usersRepo: UsersRepository) {}

  async onModuleInit() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    void this.seedIfNeeded();
  }

  async waitUntilReady(): Promise<void> {
    if (!this.readyPromise) return;
    await this.readyPromise;
  }

  private async seedIfNeeded(): Promise<void> {
    const config = getConfig();
    if (!config.seedOnStartup) {
      this.logger.log('SEED_ON_STARTUP=false -> skipping seed');
      this.resolveReady?.();
      return;
    }

    const existing = await this.usersRepo.estimatedCount();
    if (existing > 0) {
      this.logger.log(`Users already exist: ~${existing}. Skipping seed.`);
      this.resolveReady?.();
      return;
    }

    const total = config.seedUsersCount;
    const batchSize = config.seedBatchSize;
    this.logger.log(`Seeding ${total.toLocaleString()} users (batch=${batchSize.toLocaleString()})...`);

    const startedAt = Date.now();
    let inserted = 0;
    while (inserted < total) {
      const size = Math.min(batchSize, total - inserted);

      const batch = Array.from({ length: size }, (_, i) => {
        const globalIndex = inserted + i;
        const u = randomUser();
        return {
          name: u.name,
          email: makeSeedEmail(u.name, globalIndex),
          phone: makeSeedPhone(globalIndex),
          dateOfBirth: u.dateOfBirth,
        };
      });

      await this.usersRepo.insertMany(batch);
      inserted += size;

      const elapsedSec = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      const rate = Math.floor(inserted / elapsedSec);
      this.logger.log(`Seed progress: ${inserted.toLocaleString()}/${total.toLocaleString()} (~${rate}/s)`);
    }

    this.logger.log(`Seed done. Inserted ${inserted.toLocaleString()} users.`);
    this.resolveReady?.();
  }
}

