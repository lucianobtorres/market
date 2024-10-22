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
import { ShoppingItemComponent } from './shopping-item/shopping-item.component';
import { SearchListComponent } from './search-list/search-list.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { SearchListItemComponent } from './search-list-item/search-list-item.component';
import { TextEllipsisDirective } from '../directives/text-ellipsis.directive';
import { ShoppingDialogComponent } from './shopping-dialog/shopping-dialog.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ListaDetalhadaComponent } from '../pages/lista-detalhada/lista-detalhada.component';
import { SwipeListItemComponent } from './swipe-list-item/swipe-list-item.component';
import { CapitalizePipe } from '../pipes/capitalize.pipe';

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
  ShoppingListEditComponent,
  ShoppingItemComponent,
  SearchListComponent,
  SearchDialogComponent,
  SearchListItemComponent,
  ShoppingDialogComponent,
  ListItemComponent,
  ListaDetalhadaComponent,
  SwipeListItemComponent
]

const directives = [
  TextEllipsisDirective,
];

const pipes = [
  ConvertWithFunctionPipe, CapitalizePipe,
];

@NgModule({
  declarations: [components, directives, pipes],
  exports: [components, directives, pipes],
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
