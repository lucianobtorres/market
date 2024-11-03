import { ModelDB } from '../model-db';

export async function migrate(db: ModelDB): Promise<void> {
  console.info('Ajuste da estrutura dos dados.');

  await db.transaction('rw', db.tables, async () => {
    // Passo 1: Migrar dados de `shoppingLists` para `lists`
    const oldLists = await db.table('shoppingLists').toArray();
    for (const list of oldLists) {
      await db.table('lists').add({
        id: list.id,
        name: list.nome,
        createdDate: list.dataCriacao || new Date(),
        status: 'active',
      });
    }

    // Passo 2: Migrar dados de `shoppingItems` para `items`
    const oldShoppingItems = await db.table('shoppingItems').toArray();
    for (const item of oldShoppingItems) {
      await db.table('items').add({
        id: item.id,
        name: item.nome,
        quantity: item.quantidade,
        unit: item.unidade,
        listId: item.shoppingListId,
        isPurchased: item.completed || false,
        addedDate: new Date(),
      });
    }

    // Passo 3: Migrar dados de `boughtItems` para `purchases`
    const oldBoughtItems = await db.table('boughtItems').toArray();
    for (const purchase of oldBoughtItems) {
      await db.table('purchases').add({
        id: purchase.id,
        name: purchase.nome,
        quantity: purchase.quantidade,
        unit: purchase.unidade,
        listId: purchase.shoppingListId,
        purchaseDate: purchase.dataCompra || new Date(),
      });
    }
  });

  console.info('Migração para a versão 2 concluída com sucesso.');
}
