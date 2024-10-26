import { ItemUnit } from "src/app/models/item-unit";
import { ModelDB } from "../model-db";

export async function migrateToVersion1(db: ModelDB) {
  console.log('Criando a estrutura inicial do banco de dados.');

  await db.transaction('rw', db.tables, async () => {

    await db.notifications.bulkAdd([
      {
        id: 1,
        title: 'Bem-vindo à sua lista de compras!',
        message: 'Explore as funcionalidades da aplicação.',
        read: false,
        timestamp: new Date(2024, 9, 25)
      },
    ]);

    await db.shoppingLists.bulkAdd([
      { id: 1, nome: 'Lista exemplo' },
    ]);

    await db.boughtItems.bulkAdd([
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

    await db.shoppingItems.bulkAdd([
      { shoppingListId: 1, id: 1, nome: 'Leite', quantidade: 2, unidade: ItemUnit.LITRO, completed: false },
      { shoppingListId: 1, id: 2, nome: 'Arroz', quantidade: 1, unidade: ItemUnit.KG, completed: false },
      { shoppingListId: 1, id: 3, nome: 'Sabonete', quantidade: 5, unidade: ItemUnit.UNIDADE, completed: false },
      { shoppingListId: 1, id: 4, nome: 'Detergente', quantidade: 1, unidade: ItemUnit.LITRO, completed: false },
      { shoppingListId: 1, id: 5, nome: 'Óleo de Soja', quantidade: 1, unidade: ItemUnit.LITRO, completed: false },

    ], { allKeys: true });


    //await db.versionDB.add({ version: 1 });
  });
}
