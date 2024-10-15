import { IDictionary } from '../utils/idictionary';
import { FinanceDB } from './finance-db';

import { migrateToVersion1 } from './migrations/001_initial_schema';
import { migrateToVersion2 } from './migrations/002_update_meioMovimentacao';

export const CURRENT_DATABASE_VERSION = 2;
const VERSION_DB = 'db_version';

type functionMigrate = (db: FinanceDB) => Promise<void>;

export const migrations: IDictionary<functionMigrate> = {
  1: migrateToVersion1,
  2: migrateToVersion2
};

export abstract class Migrations {
  public static async createMigrations(db: FinanceDB) {
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

/*/

export abstract class Migrations_DB {
  public static async createMigrations(db: FinanceDB): Promise<void> {
    if (await Migrations_DB.needsMigration(db)) {
      console.log('Realizando migrações pendentes...');

      await db.transaction('rw', db.tables, async () => {
        const currentVersion = await Migrations_DB.getDatabaseVersion(db) ?? 1;

        for (let version: number = currentVersion + 1; version <= CURRENT_DATABASE_VERSION; version++) {
          if (migrations[version]) {
            await migrations[version](db);
          }
        }

        Migrations_DB.setDatabaseVersion(db, CURRENT_DATABASE_VERSION);
      });
      console.log('Migrações concluídas.');
    }
  }

  private static async getDatabaseVersion(db: FinanceDB): Promise<number | undefined> {
    const currentVersion = (await db.versionDB.get(1));
    console.log(currentVersion)
    if (!currentVersion) {
      await db.versionDB.add({ version: 1 });
      return 1;
    }

    return currentVersion?.version;
  }

  private static async setDatabaseVersion(db: FinanceDB, version: number): Promise<void> {
    await db.versionDB.update(1, { version });
  }

  public static async needsMigration(db: FinanceDB): Promise<boolean> {
    const currentVersion = await Migrations_DB.getDatabaseVersion(db) ?? 1;
    return currentVersion < CURRENT_DATABASE_VERSION;
  }
}

/**/
