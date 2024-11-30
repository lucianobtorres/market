import { IDictionary } from '../utils/idictionary';
import { ModelDB } from '././model-db';

import { migrate as m1 } from './migrations/001_initial_schema';
import { migrate as m2 } from './migrations/002_modify_schema';
import { migrate as m3 } from './migrations/003_remove_oldSchema';
import { migrate as m4 } from './migrations/004_include_share';
import { migrate as m5 } from './migrations/005_include_inventory';

export const CURRENT_DATABASE_VERSION = 3;

type functionMigrate = (db: ModelDB) => Promise<void>;

// Cria um dicionário de funções de migração que carrega os módulos dinamicamente

export const migrations: IDictionary<functionMigrate> = {
  1: m1, 2: m2, 3: m3, 4: m4, 5: m5
};

export abstract class Migrations {
  public static async createMigrations(db: ModelDB) {
    if (await Migrations.needsMigration(db)) {

      console.debug('Executando migrations..')
      await db.transaction('rw', db.tables, async () => {
        const currentVersion = await Migrations.getDatabaseVersion(db) ?? 0;

        for (let version: number = currentVersion + 1; version <= CURRENT_DATABASE_VERSION; version++) {
          console.debug(`executando migration: ${version}`)

          if (migrations[version]) {
            await migrations[version](db);
          }
        }

        console.debug(`ajustando database: ${CURRENT_DATABASE_VERSION}`)
        await Migrations.setDatabaseVersion(CURRENT_DATABASE_VERSION, db);
      });

      console.debug('Migrações concluídas.');
    } else {
      console.debug('Base está atualizada.');
    }
  }

  private static async getDatabaseVersion(db: ModelDB): Promise<number> {
    const meta = await db.versionDB?.get({ id: 1 });
    return meta?.version ?? 0;
  }

  private static async setDatabaseVersion(version: number, db: ModelDB) {
    if (db.tables.some(table => table.name === "versionDB")) {
      await db.versionDB.put({ id: 1, version: version });
    }
  }

  private static async needsMigration(db: ModelDB): Promise<boolean> {
    const version = await Migrations.getDatabaseVersion(db);
    return version < CURRENT_DATABASE_VERSION;
  }
}
