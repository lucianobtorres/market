import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import Dexie from 'dexie';
import { IHistoricoCompras, db } from '../db/finance-db';

export const dexieService = {
  async adicionarCompra(compra: IHistoricoCompras) {
    await db.historicoCompras.add(compra);
  },

  async obterHistoricoCompras() {
    return await db.historicoCompras.toArray();
  },

  async limparHistoricoCompras() {
    await db.historicoCompras.clear();
  },
};

const NUM_FEATURES = 10;
@Injectable({
  providedIn: 'root'
})
export class AprendizagemMaquinaService {  // dados de treinamento
  private historicoCompras!: Dexie.Table<IHistoricoCompras, number>;

  modelo!: tf.LayersModel;
  otimizador!: tf.Optimizer;

  private db!: Dexie;


  constructor() {
    this.inicializarModelo();
  }

  async inicializarModelo() {
    this.otimizador = tf.train.adam();
    this.modelo = await this.criarModelo();
  }

  async criarModelo(): Promise<tf.LayersModel> {
    const model = tf.sequential();

    model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [NUM_FEATURES] }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    //model.compile({ optimizer: this.otimizador, loss: 'meanSquaredError' });
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    return model;
  }

  async treinarModelo() {
    const [x, y] = await this.getDataSet();

    await this.modelo.fit(x, y, { epochs: 10 });
  }


  async getDataSet(): Promise<[tf.Tensor, tf.Tensor]> {
    const historicoCompras = await dexieService.obterHistoricoCompras();

    const x: number[][] = [];
    const y: number[][] = [];

    for (let i = 0; i < historicoCompras.length - 1; i++) {
      const compraAtual = historicoCompras[i];
      const compraSeguinte = historicoCompras[i + 1];

      const dataAtual = new Date(compraAtual.data).getTime();
      const dataSeguinte = new Date(compraSeguinte.data).getTime();

      const isCompraAtual = compraAtual.comprado ? 1 : 0;

      x.push([isCompraAtual,
        this.stringParaNumero(compraAtual.item),
        this.dataParaNumero(compraAtual.data)
      ]);
      y.push([compraSeguinte.comprado ? 1 : 0]);
    }

    const xTensor = tf.tensor2d(x);
    const yTensor = tf.tensor2d(y);

    return [xTensor, yTensor];
  }
  async fazerPrevisao(): Promise<string[]> {
    // Obtém os dados do histórico de compras do usuário
    const historicoCompras = await dexieService.obterHistoricoCompras();

    // Realiza a previsão dos itens a serem comprados
    const itensRecomendados = await tf.tidy(() => {
      const entradas = tf.tensor2d(historicoCompras.map(compra => {
        return [
          Number(compra.comprado),
          this.stringParaNumero(compra.item),
          this.dataParaNumero(compra.data)
        ];
      }));

      const saidas = this.modelo.predict(entradas) as tf.Tensor<tf.Rank>;
      return Array.from(saidas.dataSync());
    });

    // Seleciona os itens que foram recomendados
    const itensSelecionados = [];
    for (let i = 0; i < historicoCompras.length; i++) {
      if (itensRecomendados[i] >= 0.5) {
        itensSelecionados.push(historicoCompras[i].item);
      }
    }

    // Retorna os itens recomendados
    return itensSelecionados;
  }

  // Converte uma string em um número
  private stringParaNumero(valor: string): number {
    let soma = 0;
    for (let i = 0; i < valor.length; i++) {
      soma += valor.charCodeAt(i);
    }
    return soma / valor.length;
  }

  // Converte uma data em um número
  private dataParaNumero(valor: string): number {
    const partesData = valor.split('-');
    return (new Date(Number(partesData[0]), Number(partesData[1]) - 1, Number(partesData[2]))).getTime() / 1000 / 60 / 60 / 24;
  }
}
