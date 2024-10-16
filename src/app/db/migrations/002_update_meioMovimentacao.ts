import { ModelDB } from "../model-db";

export async function migrateToVersion2(db: ModelDB) {
  console.log('Atualizando para a versão 2 do banco de dados.');

  const meioMovimentacaoItems = await db.meioMovimentacao.toArray();

  // Atualizar os dados existentes com a nova propriedade `teste`
  await Promise.all(
    meioMovimentacaoItems.map((item, index) => db.meioMovimentacao.update(item.id ?? 0, { ...item, teste: index === 0 }))
  );
}
