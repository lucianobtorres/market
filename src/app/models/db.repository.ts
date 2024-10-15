import { Table } from 'dexie';
import { take } from 'rxjs';
import { db } from '../db/finance-db';
import { ToastService } from '../services/toast.service';

export abstract class DBRepository<T> {
  table!: Table<T, number>;

  constructor(private ts: ToastService) {
  }

  add(item: T, msg = 'adicionado..') {
    this.table
      .add(item)
      .then(() => {
        this.ts.showSuccess(msg);
      })
      .catch((err) => {
        this.ts.showError(err);
      });
  }

  async delete(id: number, msg = 'removido..', dismiss?: boolean) {
    const dism = dismiss ?? true;
    const item = await this.table.where('id').equals(id).first();
    if (!item) return;

    db.transaction('rw', this.table, () => {

      this.table
        .delete(id)
        .then(() => {
          if (dism) {
            this.ts
              .showDismiss(msg)
              .afterDismissed()
              .pipe(
                take(1)
              )
              .subscribe((value) => {
                if (value.dismissedByAction) {
                  this.table.add(item);
                }
              });
          }
          else {
            this.ts
              .showSuccess(msg)
              .afterDismissed()
              .pipe(
                take(1)
              )
              .subscribe((value) => { });
          }
        })
        .catch(e => {
          this.ts.showError(e);
        });
    });
  }

  update(id: number, changes: {}, msg = 'atualizado..') {
    this.table
      .update(id, changes)
      .then((updated) => {
        if (updated) {
          if (msg.length > 0) this.ts.showSuccess(msg);
        }
        else this.ts.showWarning(`não foi encontrado o item com id: ${id} em ${this.table.name}`);
      })
      .catch((err) => {
        this.ts.showError(err);
      });
  }
}
