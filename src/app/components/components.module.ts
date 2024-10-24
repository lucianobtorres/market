import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CurrencyMaskModule } from "ng2-currency-mask";

import { MaterialModule } from '../module/material.module';
import { HomeComponent } from '../pages/home/home.component';

import { HeaderComponent } from './shared/header/header.component';
import { MenuComponent } from './shared/menu/menu.component';
import { ToastComponent } from './shared/toast/toast.component';
import { ConvertWithFunctionPipe } from '../pipes/convert-with-function.pipe';
import { BarcodeScannerComponent } from './search-list/barcode-scanner/barcode-scanner.component';
import { ListaCorrenteComponent } from './lista-corrente/lista-corrente.component';
import { FormListaCorrenteItemComponent } from './lista-corrente/form-lista-corrente-item/form-lista-corrente-item.component';
import { ListaCorrenteItemComponent } from './lista-corrente/lista-corrente-item/lista-corrente-item.component';
import { SearchListComponent } from './search-list/search-list.component';
import { SearchDialogComponent } from './search-list/search-dialog/search-dialog.component';
import { SearchListItemComponent } from './search-list/search-list-item/search-list-item.component';
import { TextEllipsisDirective } from '../directives/text-ellipsis.directive';
import { ListaCorrenteDialogComponent } from './lista-corrente/lista-corrente-dialog/lista-corrente-dialog.component';
import { ListItemComponent } from './listas/listas-item/listas-item.component';
import { ListaCorrenteDetalhadaComponent } from './lista-corrente/lista-corrente-detalhada/lista-corrente-detalhada.component';
import { SwipeListItemComponent } from './swipe-list-item/swipe-list-item.component';
import { CapitalizePipe } from '../pipes/capitalize.pipe';
import { ValorEditComponent } from './shared/valor-edit/valor-edit.component';
import { ListasComponent } from './listas/listas.component';

export const components = [
  HomeComponent,
  HeaderComponent,
  MenuComponent,
  ToastComponent,
  BarcodeScannerComponent,
  ListaCorrenteComponent,
  FormListaCorrenteItemComponent,
  ListaCorrenteItemComponent,
  SearchListComponent,
  SearchDialogComponent,
  SearchListItemComponent,
  ListaCorrenteDialogComponent,
  ListItemComponent,
  ListaCorrenteDetalhadaComponent,
  SwipeListItemComponent,
  ValorEditComponent,
  ListasComponent
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
