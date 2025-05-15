import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent    // <-- on importe le component standalone
  ],
  bootstrap: [AppComponent]  // <-- on démarre avec lui
})
export class AppModule {}
