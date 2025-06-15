import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- ¡Importa esto!

import { AppComponent } from './app.component';
import { AccountListComponent } from './account-list/account-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule // <-- ¡Agrégalo aquí!
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }