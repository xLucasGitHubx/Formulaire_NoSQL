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
<<<<<<< HEAD
      questions: this.fb.array([this.createQuestion()])
    });
  }

  private createQuestion(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      type: ['text', Validators.required],
      options: this.fb.array([])
=======
      questions: this.fb.array([this.fb.control('', Validators.required)])
>>>>>>> main
    });
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion(): void {
<<<<<<< HEAD
    this.questions.push(this.createQuestion());
=======
    this.questions.push(new FormControl('', Validators.required));
>>>>>>> main
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    if (this.questions.length === 0) {
      this.addQuestion();
    }
  }
<<<<<<< HEAD

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    this.getOptions(questionIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  onTypeChange(questionIndex: number): void {
    const q = this.questions.at(questionIndex);
    if (q.get('type')?.value !== 'choice') {
      this.getOptions(questionIndex).clear();
    }
  }
=======
>>>>>>> main

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
