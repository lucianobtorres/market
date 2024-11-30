import { Injectable } from '@angular/core';
import { db } from '../db/model-db';

@Injectable({
  providedIn: 'root',
})
export class ClassificationService {
  async createOrUpdateMapping(
    baseProduct: string,
    synonyms: string[],
    exclusions: string[]
  ) {
    await db.productMappings.put({
      userDefined: true,
      baseProduct,
      synonyms,
      exclusions,
    });
  }

  async classifyProduct(productName: string): Promise<string | null> {
    const mappings = await db.productMappings.toArray();

    for (const rule of mappings) {
      const isSimilar = rule.synonyms.some((synonym: string) =>
        productName.toLowerCase().includes(synonym.toLowerCase())
      );

      if (isSimilar) return rule.baseProduct;
    }

    return null;
  }

}
