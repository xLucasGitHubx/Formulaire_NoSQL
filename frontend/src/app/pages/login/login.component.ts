import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  error = '';

  submit() {
    if (this.form.invalid) return;
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: res => {
        this.auth.setToken(res.token);
        window.location.href = '/'; // ← recharge la page pour que le token soit bien pris en compte
        // this.router.navigateByUrl('/'); // (ancienne ligne)
      },
      error: err => {
        this.error = err.error?.error || 'Erreur de connexion';
      }
    });
  }
}
