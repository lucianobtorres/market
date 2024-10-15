import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { liveQuery } from "dexie";
import { db } from "src/app/db/finance-db";
import { GrupoContas, PlanoContas } from "src/app/models/interfaces";

interface FormPlanoConta {
  grupoContasId: FormControl<number | undefined>,
  title: FormControl<string | undefined>,
}

@Component({
  selector: 'fi-form-plano-conta',
  templateUrl: './form-plano-conta.component.html',
  styleUrls: ['./form-plano-conta.component.scss']
})
export class FormPlanoContaComponent implements OnInit {
  public grupoContas$ = liveQuery(() => db.grupoContas.toArray());
  public gruposConta!: GrupoContas[];

  public form!: FormGroup<FormPlanoConta>;
  public btnTexto: string;
  public multiAdd = false;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<FormPlanoContaComponent>,
    private fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      item?: PlanoContas
    }) {
    this.btnTexto = data.item ? 'Alterar' : 'Adicionar';
  }

  ngOnInit(): void {
    const grupoContasId = this.data.item ? this.data.item.grupoContasId : undefined;
    const titleValue = this.data.item ? this.data.item.title : undefined;

    this.form = this.fb.nonNullable.group({
      grupoContasId: [grupoContasId, [Validators.required]],
      title: [titleValue, [Validators.required]]
    });

    this.grupoContas$.subscribe((gruposContas) => {
      this.gruposConta = gruposContas;
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    if (
      !value.grupoContasId ||
      !value.title
    ) {
      return;
    }

    this._bottomSheetRef.dismiss({
      item: {
        grupoContasId: value.grupoContasId,
        title: value.title,
      },
      multiAdd: this.multiAdd
    });
  }

  cancelar() {
    this._bottomSheetRef.dismiss();
  }

  deletar() {
    this._bottomSheetRef.dismiss({
      item: undefined
    });
  }
}
