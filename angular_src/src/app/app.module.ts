import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent, Toast} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PageMainComponent} from './components/page-main/page-main.component';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {ReactiveFormsModule} from '@angular/forms';
import {FormComponent} from "./components/form/form.component";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {FormListComponent} from "./components/form-list/form-list.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";

@NgModule({
  declarations: [
    AppComponent,
    PageMainComponent,
    FormComponent,
    FormListComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatRadioModule,
        MatCardModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatAutocompleteModule
    ],
  bootstrap: [AppComponent],
  entryComponents: [
    Toast
  ]
})
export class AppModule {
}
