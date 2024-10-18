import { IDictionary } from '../utils/idictionary';
import { ModelDB } from '././model-db';

import { migrateToVersion1 } from './migrations/001_initial_schema';

export const CURRENT_DATABASE_VERSION = 1;
const VERSION_DB = 'db_version';

type functionMigrate = (db: ModelDB) => Promise<void>;

export const migrations: IDictionary<functionMigrate> = {
  1: migrateToVersion1,
};

export abstract class Migrations {
  public static async createMigrations(db: ModelDB) {
    if (Migrations.needsMigration()) {
      await db.transaction('rw', db.tables, async () => {
        const currentVersion = Migrations.getDatabaseVersion() ?? 0;

        for (let version: number = currentVersion + 1; version <= CURRENT_DATABASE_VERSION; version++) {
          if (migrations[version]) {
            await migrations[version](db);
          }
        }

        Migrations.setDatabaseVersion(CURRENT_DATABASE_VERSION);
      });

      console.log('Migrações concluídas.');
    }
  }

  private static getDatabaseVersion(): number {
    const version = localStorage.getItem(VERSION_DB);
    return version ? parseInt(version, 10) : 0;
  }

  private static setDatabaseVersion(version: number) {
    localStorage.setItem(VERSION_DB, version.toString());
  }

  private static needsMigration(): boolean {
    const version = Migrations.getDatabaseVersion();
    return version < CURRENT_DATABASE_VERSION;
  }
}
