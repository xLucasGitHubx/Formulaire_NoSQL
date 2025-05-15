// src/app/app.component.ts

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Formulaire Sondage';
  formData = {
    nom: '',
    platPrefere: ''
  };

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    this.http
      .post('http://localhost:5000/api/reponses', this.formData)
      .subscribe({
        next: res => {
          console.log('Réponse envoyée !', res);
          // Réinitialiser le formulaire si besoin
          this.formData = { nom: '', platPrefere: '' };
        },
        error: err => console.error('Erreur d’envoi :', err)
      });
  }
}
