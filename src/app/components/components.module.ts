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
import { MenuFooterComponent } from './shared/menu-footer/menu-footer.component';
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
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { SettingsComponent } from '../pages/settings/settings.component';
import { ShortDatePipe } from '../pipes/short-date.pipe';
import { IconOutlinedDirective } from '../directives/icon-outlined.directive';
import { MenuSideComponent } from './shared/menu-side/menu-side.component';
import { PerfilComponent } from '../pages/perfil/perfil.component';
import { DispensaComponent as DispensaComponent } from './dispensa/dispensa.component';
import { DispensaItemDetalhesComponent } from './dispensa/dispensa-item-detalhe/dispensa-item-detalhes.component';
import { PurchaseHistoryModalComponent } from './purchase-history-modal/purchase-history-modal.component';
import { PurchaseHistoryModalDialogComponent } from './purchase-history-modal/purchase-history-modal-dialog/purchase-history-modal-dialog.component';
import { PurchaseMapComponent } from './purchase-map/purchase-map.component';
import { PurchaseMapDialogComponent } from './purchase-map/purchase-map-dialog/purchase-map-dialog.component';

export const components = [
  HomeComponent,
  SettingsComponent,
  HeaderComponent,
  MenuFooterComponent,
  MenuSideComponent,
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
  ListasComponent,
  ConfirmDialogComponent,
  NotificationListComponent,
  PerfilComponent,
  DispensaComponent,
  DispensaItemDetalhesComponent,
  PurchaseHistoryModalComponent,
  PurchaseHistoryModalDialogComponent,
  PurchaseMapComponent,
  PurchaseMapDialogComponent,
]

const directives = [
  TextEllipsisDirective, IconOutlinedDirective
];

const pipes = [
  ConvertWithFunctionPipe, CapitalizePipe, ShortDatePipe,
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
