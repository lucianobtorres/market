import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CurrencyMaskModule } from "ng2-currency-mask";

import { MaterialModule } from '../module/material.module';
import { HomeComponent } from '../pages/home/home.component';

import { AddLancamentoComponent } from './add-lancamento/add-lancamento.component';
import { HeaderComponent } from './header/header.component';
import { ItemGrupoLancamentoComponent } from './item-grupo-lancamento/item-grupo-lancamento.component';
import { LancamentosComponent } from './lancamentos/lancamentos.component';
import { MenuComponent } from './menu/menu.component';
import { TimelineComponent } from './timeline/timeline.component';
import { ToastComponent } from './toast/toast.component';
import { ConvertWithFunctionPipe } from '../pipes/convert-with-function.pipe';
import { ConfiguracaoItemComponent } from '../pages/configuracao/configuracao-item/configuracao-item.component';
import { ConfiguracaoComponent } from '../pages/configuracao/configuracao.component';
import { BarcodeScannerComponent } from './barcode-scanner/barcode-scanner.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { ShoppingListEditComponent } from './shopping-list-edit/shopping-list-edit.component';

export const components = [
  HomeComponent,
  HeaderComponent,
  LancamentosComponent,
  ItemGrupoLancamentoComponent,
  TimelineComponent,
  MenuComponent,
  AddLancamentoComponent,
  ToastComponent,
  ConvertWithFunctionPipe,
  ConfiguracaoComponent,
  ConfiguracaoItemComponent,
  BarcodeScannerComponent,
  ShoppingListComponent,
  ShoppingListEditComponent
]

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    CurrencyMaskModule,
    MaterialModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    RouterModule.forChild([]),
  ]
})
export class ComponentsModule { }
