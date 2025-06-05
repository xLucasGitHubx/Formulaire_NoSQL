// src/app/app.component.ts

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './component/navbar/navbar.component';
import { FooterComponent } from './component/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Créateur de Sondage';
  surveyForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.surveyForm = this.fb.group({
      surveyName: ['', Validators.required],
      questions: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(new FormControl('', Validators.required));
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    if (this.questions.length === 0) {
      this.addQuestion();
    }
  }

  onSubmit(): void {
    if (this.surveyForm.invalid) {
      return;
    }

    this.http
      .post('http://localhost:9000/api/reponses', this.surveyForm.value)
      .subscribe({
        next: res => {
          console.log('Sondage enregistré !', res);
          this.surveyForm.reset();
          // remettre une question vide
          this.questions.clear();
          this.addQuestion();
        },
        error: err => console.error('Erreur d\u2019envoi :', err)
      });
  }
}
