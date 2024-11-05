import { ModelDB } from '../model-db';

export async function migrate(db: ModelDB): Promise<void> {
  console.info('Ajuste do compartilhamento das listas.');
  await db.transaction('rw', db.tables, async () => { });

  console.info('Migração para a versão 4 concluída com sucesso.');
}
