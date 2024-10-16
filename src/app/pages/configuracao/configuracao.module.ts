import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ComponentsModule } from "src/app/components/components.module";
import { GrupoContaComponent } from "src/app/pages/configuracao/grupo-conta/grupo-conta.component";
import { FormGrupoContaComponent } from "src/app/pages/configuracao/grupo-conta/form-grupo-conta/form-grupo-conta.component";
import { MaterialModule } from "src/app/module/material.module";
import { ConfiguracoesRoutingModule as ConfiguracaoRoutingModule } from "./configuracao-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MeioMovimentacaoComponent } from "./meio-movimentacao/meio-movimentacao.component";
import { FormMeioMovimentacaoComponent } from "./meio-movimentacao/form-meio-movimentacao/form-meio-movimentacao.component";
import { PlanoContaComponent } from './plano-conta/plano-conta.component';
import { FormPlanoContaComponent } from './plano-conta/form-plano-conta/form-plano-conta.component';

const components = [
  FormGrupoContaComponent,
  GrupoContaComponent,
  MeioMovimentacaoComponent,
  FormMeioMovimentacaoComponent,
]

@NgModule({
  declarations: [
    components,
    PlanoContaComponent,
    FormPlanoContaComponent,
  ],
  exports: [
    components
  ]
  ,
  imports: [
    ComponentsModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ConfiguracaoRoutingModule,
  ]
})
export class ConfiguracaoModule { }
