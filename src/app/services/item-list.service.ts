import { Injectable } from '@angular/core';
import { db } from '../db/model-db';
import { liveQuery } from 'dexie';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { Items, ItemShoppingList as ItemListModel, Lists } from '../models/interfaces';

import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ItemListService {
  private listasSubject$ = new BehaviorSubject<ItemListModel[]>([]);
  get listasCorrentes$(): Observable<ItemListModel[]> {
    return this.listasSubject$.asObservable().pipe(
      map((listas) => listas.filter((item) => item.lists.status !== 'completed'))
    );
  }

  get listas$(): Observable<ItemListModel[]> {
    return this.listasSubject$.asObservable();
  }

  private loaded = false;

  private currentLists: Lists[] = [];
  private currentItems: Items[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Subscribing to shopping lists using liveQuery
    liveQuery(() => db.lists.toArray()).subscribe(lists => {
      this.currentLists = lists;
      this.loaded ||= true;
      this.combineData();
    });

    // Subscribing to shopping items using liveQuery
    liveQuery(() => db.items.toArray()).subscribe(itens => {
      this.currentItems = itens;
      this.loaded ||= true;
      this.combineData();
    });
  }

  private combineData() {
    if (!this.loaded) {
      return;
    }

    console.debug("Dados carregados:", this.currentLists, this.currentItems);

    if (this.currentLists.length || this.currentItems.length) {
      const combinedLists = this.currentLists.map(list => ({
        lists: list,
        itens: this.currentItems.filter(item => item.listId === list.id)
      }));

      this.listasSubject$.next(combinedLists);
    } else {
      this.listasSubject$.next([]);
    }
  }

  private async shareListJSON(listaId: number): Promise<{ json: string, lista: Lists } | null> {
    try {
      const lista = await this.setShare(listaId);
      if (!lista) {
        return null;
      }

      const itens = await db.items
        .where("listId")
        .equals(listaId)
        .toArray();

      const dadosParaExportar = {
        ...lista,
        itens: itens,
      };

      return { json: JSON.stringify(dadosParaExportar, null, 2), lista };

    } catch (error) {
      await this.setShare(listaId, true);
      throw error;
    }
  }

  async removeShare(listaId: number): Promise<Lists | null> {
    return await this.setShare(listaId, true);
  }

  private async setShare(listaId: number, remove: boolean = false): Promise<Lists | null> {
    const lista = await db.lists.get(listaId);
    if (lista) {
      lista.share = remove ? undefined : uuidv4();
      await db.lists.put(lista);
      return lista;
    }

    return null;
  }

  async importListJSON(jsonData: string): Promise<void> {
    try {
      console.debug('Realizando importação')
      const dadosImportados = JSON.parse(jsonData);
      if (!dadosImportados.id || !dadosImportados.name || !dadosImportados.share) {
        return;
      }

      console.debug('lista pode ser importada')
      if (dadosImportados.share) {
        const listaExistente = await db.lists
          .where('share')
          .equals(dadosImportados.share)
          .first();

        if (listaExistente) {
          console.debug('atualiza lista existente')
          await db.items
            .where("id")
            .equals(listaExistente.id!)
            .delete();

          dadosImportados.id = listaExistente.id;
          await db.lists.put(dadosImportados);

          console.debug('atualiza itens da lista existente')
          dadosImportados.itens
            .forEach((item: Items) => item.listId = listaExistente.id!);

          await db.items.bulkAdd(dadosImportados.itens);
          return;
        }
      }

      console.debug('cria uma nova lista')
      delete dadosImportados.id;
      const novaListaId = await db.lists.add(dadosImportados);

      console.debug('inclui itens na nova lista')
      dadosImportados.itens
        .forEach((item: Items) => {
          delete item.id;
          item.listId = novaListaId;
        });

      await db.items.bulkAdd(dadosImportados.itens);

    } catch (error) {
      console.error('Erro ao importar lista:', error);
    }
  }

  async shareList(listaId: number): Promise<void> {
    const shareData = await this.shareListJSON(listaId);
    if (!shareData?.json) {
      console.error("Erro ao exportar lista como JSON");
      return;
    }

    const fileName = `${shareData.lista.name}.json`;
    const isDesktop = this.verificarSeDesktop();

    // Verifica se a Web Share API está disponível
    if (navigator.share && !isDesktop) {
      try {
        await navigator.share({
          title: "Lista de Compras",
          text: shareData.json,
          url: undefined,
        });
        console.log("Lista compartilhada com sucesso!");
      } catch (error) {
        console.error("Erro ao compartilhar lista:", error);
      }
    } else {
      // Fallback para download do arquivo JSON
      this.baixarArquivoJSON(shareData.json, fileName);
    }
  }

  async duplicarLista(listaId: number): Promise<void> {
    try {
      console.debug('Realizando duplicação')
      const listaExistente = await db.lists
        .where('id')
        .equals(listaId)
        .first();

      if (!listaExistente) {
        return;
      }

      console.debug('cria uma nova lista')
      delete listaExistente.id;
      listaExistente.name = `${listaExistente.name} - Cópia`
      listaExistente.share = undefined;
      const novaListaId = await db.lists.add(listaExistente);

      const itensExistente = await db.items
        .where('listId')
        .equals(listaId)
        .toArray();

      if (!itensExistente?.length) {
        return;
      }

      console.debug('inclui itens na nova lista')
      itensExistente
        .forEach((item: Items) => {
          delete item.id;
          item.listId = novaListaId;
        });

      await db.items.bulkAdd(itensExistente);

    } catch (error) {
      console.error('Erro ao importar lista:', error);
    }
  }

  // Verifica se o dispositivo é desktop
  verificarSeDesktop(): boolean {
    // Checa o userAgent para detectar desktops
    const userAgent = navigator.userAgent;
    return /Windows|Macintosh|Linux/i.test(userAgent) && !/Mobi/i.test(userAgent);
  }

  // Função auxiliar para baixar o arquivo JSON
  baixarArquivoJSON(jsonData: string, fileName: string): void {
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
