import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExtratoComponent } from './pages/extrato/extrato.component';
import { HomeComponent } from './pages/home/home.component';
import { ListaDetalhadaComponent } from './pages/lista-detalhada/lista-detalhada.component';

export const ROTAS = {
  root: '/',
  home: 'home',
  extrato: 'extrato',
  configuracoes: 'configuracoes',
  lista: 'lista',
};

export const ROTAS_CONFIG = {
  root: '/',
  grupoConta: 'grupo-conta',
  planoConta: 'plano-conta',
  meioMov: 'meio-movimentacao',
};

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: ROTAS.home, component: HomeComponent },
  { path: ROTAS.extrato, component: ExtratoComponent },
  { path: `${ROTAS.lista}/:id`, component: ListaDetalhadaComponent },
  {
    path: ROTAS.configuracoes,
    loadChildren: () =>
      import('./pages/configuracao/configuracao.module')
        .then(m => m.ConfiguracaoModule)
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/page-not-found/page-not-found.module')
        .then(m => m.PageNotFoundModule)
  },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
