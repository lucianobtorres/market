import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListaCorrenteDetalhadaComponent } from './components/lista-corrente/lista-corrente-detalhada/lista-corrente-detalhada.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { DispensaComponent } from './components/dispensa/dispensa.component';
import { PurchaseMapComponent } from './components/purchase-map/purchase-map.component';

export const ROTAS = {
  root: '/',
  home: 'home',
  perfil: 'perfil',
  config: 'configuracoes',
  lista: 'lista',
  dispensa: 'dispensa',
  mapa: 'map',
};

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: ROTAS.home, component: HomeComponent },
  { path: ROTAS.perfil, component: PerfilComponent },
  { path: ROTAS.dispensa, component: DispensaComponent },
  { path: ROTAS.mapa, component: PurchaseMapComponent },
  { path: ROTAS.config, component: SettingsComponent },
  { path: `${ROTAS.lista}/:id`, component: ListaCorrenteDetalhadaComponent },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/page-not-found/page-not-found.module')
        .then(m => m.PageNotFoundModule)
  },
  // { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
