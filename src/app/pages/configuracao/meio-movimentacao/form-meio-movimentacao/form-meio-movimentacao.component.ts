import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { MeioMovimentacao } from "src/app/models/interfaces";

interface FormMeioMovimentacao {
  sigla: FormControl<string | undefined>,
  title: FormControl<string | undefined>,
  entrada: FormControl<boolean>,
  parcelavel: FormControl<boolean>,
}

@Component({
  selector: 'app-form-meio-movimentacao',
  templateUrl: './form-meio-movimentacao.component.html',
  styleUrls: ['./form-meio-movimentacao.component.scss']
})
export class FormMeioMovimentacaoComponent implements OnInit {
  public form!: FormGroup<FormMeioMovimentacao>;
  public btnTexto: string;
  public multiAdd = false;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<FormMeioMovimentacaoComponent>,
    private fb: FormBuilder,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      item?: MeioMovimentacao
    }) {
    this.btnTexto = data.item ? 'Alterar' : 'Adicionar';
  }

  ngOnInit(): void {
    const siglaValue = this.data.item ? this.data.item.sigla : undefined;
    const titleValue = this.data.item ? this.data.item.title : undefined;
    const entradaValue = this.data.item ? this.data.item.entrada : false;
    const parcelavelValue = this.data.item ? this.data.item.parcelavel : false;

    this.form = this.fb.nonNullable.group({
      sigla: [siglaValue, [Validators.required]],
      title: [titleValue, [Validators.required]],
      entrada: [entradaValue],
      parcelavel: [parcelavelValue]
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    if (
      !value.sigla ||
      !value.title
    ) {
      return;
    }

    this._bottomSheetRef.dismiss({
      item: {
        sigla: value.sigla,
        title: value.title,
        entrada: value.entrada,
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
