import { ModelDB } from '../model-db';

export async function migrate(db: ModelDB): Promise<void> {
  console.info('Inclusão da dispensa para organização do usuário.');
  await db.transaction('rw', db.tables, async () => { });

  console.info('Migração para a versão 5 concluída com sucesso.');
}
