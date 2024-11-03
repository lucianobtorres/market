import { ItemUnit } from "src/app/models/item-unit";
import { ModelDB } from "../model-db";

export async function migrate(db: ModelDB) {
  console.info('Criando a estrutura inicial do banco de dados.');

  await db.transaction('rw', db.tables, async () => {

    const existingNotification = await db.table('shoppingLists').get(1);
    if (!existingNotification) {
      await db.table('notifications').bulkAdd([
        {
          id: 1,
          title: 'Bem-vindo à sua lista de compras!',
          message: 'Explore as funcionalidades da aplicação.',
          read: false,
          timestamp: new Date(2024, 9, 25)
        },
      ]);
    }
    const existingList = await db.table('shoppingLists').get(1);
    if (!existingList) {
      await db.table('shoppingLists').bulkAdd([
        { id: 1, nome: 'Lista exemplo' },
      ]);
    }

    const existingboughtItems = await db.table('boughtItems').get(1);
    if (!existingboughtItems) {
      await db.table('boughtItems').bulkAdd([
        { id: 1, nome: 'Maçã', unidade: ItemUnit.KG, adding: false, dataCompra: new Date(), },
        { id: 2, nome: 'Leite', unidade: ItemUnit.LITRO, adding: false, dataCompra: new Date() },
        { id: 3, nome: 'Arroz', unidade: ItemUnit.KG, adding: false, dataCompra: new Date() },
        { id: 4, nome: 'Feijão', unidade: ItemUnit.KG, adding: false, dataCompra: new Date() },
        { id: 5, nome: 'Sabonete', unidade: ItemUnit.UNIDADE, adding: false, dataCompra: new Date() },
        { id: 6, nome: 'Detergente', unidade: ItemUnit.LITRO, adding: false, dataCompra: new Date() },
        { id: 7, nome: 'Papel Higiênico', unidade: ItemUnit.UNIDADE, adding: false, dataCompra: new Date() },
        { id: 8, nome: 'Macarrão', unidade: ItemUnit.UNIDADE, adding: false, dataCompra: new Date() },
        { id: 9, nome: 'Óleo de Soja', unidade: ItemUnit.LITRO, adding: false, dataCompra: new Date() },
        { id: 10, nome: 'Frango', unidade: ItemUnit.KG, adding: false, dataCompra: new Date() }

      ], { allKeys: true });
    }

    const existingshoppingItems= await db.table('shoppingItems').get(1);
    if (!existingshoppingItems) {
      await db.table('shoppingItems').bulkAdd([
        { shoppingListId: 1, id: 1, nome: 'Leite', quantidade: 2, unidade: ItemUnit.LITRO, completed: false, },
        { shoppingListId: 1, id: 2, nome: 'Arroz', quantidade: 1, unidade: ItemUnit.KG, completed: false, },
        { shoppingListId: 1, id: 3, nome: 'Sabonete', quantidade: 5, unidade: ItemUnit.UNIDADE, completed: false, },
        { shoppingListId: 1, id: 4, nome: 'Detergente', quantidade: 1, unidade: ItemUnit.LITRO, completed: false, },
        { shoppingListId: 1, id: 5, nome: 'Óleo de Soja', quantidade: 1, unidade: ItemUnit.LITRO, completed: false, },

      ], { allKeys: true });
    }

    const existingversionDB = await db.table('versionDB').get(1);
    if (!existingversionDB) {
      console.info('adicionando controle de versão na versão 1')
      await db.table('versionDB').add({ version: 1 });
    }
  });
}
