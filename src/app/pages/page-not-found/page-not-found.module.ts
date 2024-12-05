import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found.component';
import { PageNotFoundRoutingModule } from './page-not-found-routing.module';
import { MaterialModule } from 'src/app/module/material.module';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [
    PageNotFoundComponent
  ],
  imports: [
    ComponentsModule,
    CommonModule,
    MaterialModule,
    PageNotFoundRoutingModule
  ]
})
export class PageNotFoundModule { }
