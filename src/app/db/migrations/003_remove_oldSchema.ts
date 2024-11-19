import { ModelDB } from '../model-db';

export async function migrate(db: ModelDB): Promise<void> {
  console.debug('Remoção da estrutura anterior.');
  await db.transaction('rw', db.tables, async () => {
    await db.table('shoppingItems').clear();
    await db.table('boughtItems').clear();
    await db.table('shoppingLists').clear();
  });

  console.debug('Migração para a versão 3 concluída com sucesso.');
}
