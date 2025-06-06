import { Component, computed, effect, signal, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'nav-bar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private auth = inject(AuthService);

  // signal local pour token
  token = signal<string | null>(this.auth.token());

  constructor() {
    // synchroniser avec auth.token
    effect(() => {
      this.token.set(this.auth.token());
      console.log('Token updated:', this.token());
    });
  }

  isLoggedIn(): boolean {
    // Vérifie si le token est présent dans le signal
    console.log('isLoggedIn called, token:', this.token());
    return !!this.token();
  }

  logout() {
    // Fonction de déconnexion
    localStorage.removeItem('token');
    this.token.set(null); // Met à jour le signal pour refléter la déconnexion
  }
}
