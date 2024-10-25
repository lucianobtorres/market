import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListaCorrenteDetalhadaComponent } from './components/lista-corrente/lista-corrente-detalhada/lista-corrente-detalhada.component';

export const ROTAS = {
  root: '/',
  home: 'home',
  lista: 'lista',
};

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: `${ROTAS.lista}/:id`, component: ListaCorrenteDetalhadaComponent },
  { path: ROTAS.home, component: HomeComponent },
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
