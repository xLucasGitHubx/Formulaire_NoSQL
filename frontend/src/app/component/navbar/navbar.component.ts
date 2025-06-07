import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule],
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
    this.token.set(null);
    location.replace(location.origin);

  }
}