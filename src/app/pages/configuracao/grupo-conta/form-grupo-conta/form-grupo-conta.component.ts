import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { GrupoContas } from "src/app/models/interfaces";

interface FormGrupoLancamento {
  icone: FormControl<string | undefined>,
  title: FormControl<string | undefined>,
}

@Component({
  selector: 'app-form-grupo-conta',
  templateUrl: './form-grupo-conta.component.html',
  styleUrls: ['./form-grupo-conta.component.scss']
})
export class FormGrupoContaComponent implements OnInit {
  public form!: FormGroup<FormGrupoLancamento>;
  public btnTexto: string;
  public multiAdd = false;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<FormGrupoContaComponent>,
    private fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      item?: GrupoContas
    }) {
    this.btnTexto = data.item ? 'Alterar' : 'Adicionar';
  }

  ngOnInit(): void {
    const iconeValue = this.data.item ? this.data.item.icone : undefined;
    const titleValue = this.data.item ? this.data.item.title : undefined;

    this.form = this.fb.nonNullable.group({
      icone: [iconeValue, [Validators.required]],
      title: [titleValue, [Validators.required]]
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    if (
      !value.icone ||
      !value.title
    ) {
      return;
    }

    this._bottomSheetRef.dismiss({
      item: {
        icone: value.icone,
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
