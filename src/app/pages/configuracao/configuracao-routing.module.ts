import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ROTAS_CONFIG } from "src/app/app-routing.module";
import { GrupoContaComponent } from "src/app/pages/configuracao/grupo-conta/grupo-conta.component";
import { ConfiguracaoComponent } from "./configuracao.component";
import { MeioMovimentacaoComponent } from "./meio-movimentacao/meio-movimentacao.component";
import { PlanoContaComponent } from "./plano-conta/plano-conta.component";

const routes: Routes = [
  { path: '', component: ConfiguracaoComponent },
  { path: ROTAS_CONFIG.grupoConta, component: GrupoContaComponent },
  { path: ROTAS_CONFIG.planoConta, component: PlanoContaComponent },
  { path: ROTAS_CONFIG.meioMov, component: MeioMovimentacaoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracoesRoutingModule { }
