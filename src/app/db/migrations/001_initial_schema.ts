import { ModelDB } from "../model-db";

export async function migrateToVersion1(db: ModelDB) {
  console.log('Criando a estrutura inicial do banco de dados.');

  await db.transaction('rw', db.tables, async () => {

    await db.grupoContas.bulkAdd([
      { title: 'Receita', icone: 'attach_money' },
      { title: 'Alimentação', icone: 'restaurant' },
      { title: 'Moradia', icone: 'home_work' },
      { title: 'Transporte', icone: 'commute' },
      { title: 'Lazer', icone: 'sports_soccer' },
      { title: 'Serviços Financeiros', icone: 'receipt' },
    ], { allKeys: true });

    let ids: number = 1;

    await db.planoContas.bulkAdd([
      { grupoContasId: ids, title: 'Salário  / Adiantamento /  Autônomo' },
      { grupoContasId: ids, title: 'Férias' },
      { grupoContasId: ids, title: '13º salário' },
      { grupoContasId: ids, title: 'Aposentadoria' },
      { grupoContasId: ids, title: 'Receita extra (aluguel, restituição IR)' },
      { grupoContasId: ids++, title: 'Outras Receitas' },

      { grupoContasId: ids, title: ' Supermercado' },
      { grupoContasId: ids, title: 'Feira / Sacolão' },
      { grupoContasId: ids, title: ' Padaria' },
      { grupoContasId: ids, title: 'Refeição fora de casa' },
      { grupoContasId: ids, title: 'Lanche' },
      { grupoContasId: ids++, title: 'Outros (café, água, sorvetes, etc)' },

      { grupoContasId: ids, title: 'Prestação / Aluguel de imóvel' },
      { grupoContasId: ids, title: 'Condomínio' },
      { grupoContasId: ids, title: 'Consumo de água' },
      { grupoContasId: ids, title: 'Serviço de limpeza( diarista ou mensalista)' },
      { grupoContasId: ids, title: 'Energia Elétrica' },
      { grupoContasId: ids, title: 'Gás' },
      { grupoContasId: ids, title: 'IPTU' },
      { grupoContasId: ids, title: 'Decoração da casa' },
      { grupoContasId: ids, title: 'Manutenção / Reforma' },
      { grupoContasId: ids, title: 'Celular' },
      { grupoContasId: ids, title: 'Telefone fixo' },
      { grupoContasId: ids++, title: 'Internet / TV a cabo' },

      { grupoContasId: ids, title: 'Ônibus / Metrô' },
      { grupoContasId: ids, title: 'Taxi / Uber / 99' },
      { grupoContasId: ids, title: 'Combustível' },
      { grupoContasId: ids, title: 'Estacionamento' },
      { grupoContasId: ids, title: 'Seguro Auto' },
      { grupoContasId: ids, title: 'Manutenção / Lavagem / Troca de óleo' },
      { grupoContasId: ids, title: 'Licenciamento' },
      { grupoContasId: ids, title: 'Pedágio' },
      { grupoContasId: ids++, title: 'IPVA' },

      { grupoContasId: ids, title: 'Cinema / Teatro / Shows' },
      { grupoContasId: ids, title: 'Livros / Revistas / Cd´s ' },
      { grupoContasId: ids, title: 'Clube / Parques / Casa Noturna' },
      { grupoContasId: ids, title: 'Viagens' },
      { grupoContasId: ids++, title: 'Restaurantes / Bares / Festas' },

      { grupoContasId: ids, title: 'Empréstimos' },
      { grupoContasId: ids, title: 'Seguros (vida / residencial)' },
      { grupoContasId: ids, title: 'Investimentos(Reservas / Poupança / Outros)' },
      { grupoContasId: ids, title: 'Juros Cheque Especial' },
      { grupoContasId: ids, title: 'Tarifas bancárias' },
      { grupoContasId: ids, title: 'Financiamento de veículo' },
      { grupoContasId: ids, title: 'Pagamento da fatura cartão de crédito' },
      { grupoContasId: ids, title: 'Imposto de Renda a Pagar ' },
      { grupoContasId: ids, title: 'Saque' },
      { grupoContasId: ids, title: 'Pagamento Parcela' },
      { grupoContasId: ids++, title: 'Pagamento Boleto' },

    ], { allKeys: true });

    await db.meioMovimentacao.bulkAdd([
      { sigla: 'CC', title: 'Cartão de Crédito', entrada: false, parcelavel: true },
      { sigla: 'DB', title: 'Debito', entrada: false, parcelavel: false },
      { sigla: 'DI', title: 'Dinheiro', entrada: false, parcelavel: false },
      { sigla: 'DP', title: 'Depósito', entrada: true, parcelavel: false },
      { sigla: 'RD', title: 'Recibo em dinheiro', entrada: true, parcelavel: false },
      { sigla: 'CH', title: 'Cheque', entrada: false, parcelavel: false },
      { sigla: 'SQ', title: 'Saque', entrada: false, parcelavel: false },
      { sigla: 'IV', title: 'Investimento', entrada: false, parcelavel: false },

    ], { allKeys: true });

    //await db.versionDB.add({ version: 1 });
  });
}
