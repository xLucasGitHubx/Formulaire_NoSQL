import { Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';            // ← IMPORT NÉCESSAIRE
import { SurveyService } from '../../services/survey.service';
import { AuthService } from '../../services/auth.service';
import { Survey, QuestionType } from '../../models/survey.model';

@Component({
  standalone: true,
  selector: 'app-create-survey',
  imports: [
    ReactiveFormsModule,
    CommonModule        // ← ON L’AJOUTE ICI !!
  ],
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss']
})
export class CreateSurveyComponent {
  private fb = inject(FormBuilder);
  private api = inject(SurveyService);
  private router = inject(Router);
  private auth = inject(AuthService);

  saving = signal(false);

  // 1) Définition du FormGroup racine
  surveyForm = this.fb.group({
    name: ['', Validators.required],
    questions: this.fb.array([
      this.newQuestionGroup()
    ])
  });

  // Getter pratique pour accéder aux questions (FormArray)
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  // Label dynamique (Questions (nombre))
  questionLabel = computed(() => `Questions (${this.questions.length})`);

  // 2) Crée et retourne un FormGroup “question”
  private newQuestionGroup(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      type: ['text' as QuestionType, Validators.required],
      options: this.fb.array([])
    });
  }

  // 3) Helpers pour récupérer le FormArray “options” d’une question
  getOptions(qIndex: number): FormArray {
    return (this.questions.at(qIndex).get('options') as FormArray);
  }

  // Helper pour obtenir le type de la question
  getQuestionType(qIndex: number): QuestionType {
    const value = this.questions.at(qIndex).get('type')?.value;
    return (value as QuestionType) || 'text';
  }

  // 4) Ajouter / supprimer une question
  addQuestion(): void {
    this.questions.push(this.newQuestionGroup());
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    if (this.questions.length === 0) {
      this.addQuestion();
    }
  }

  // 5) Ajouter / supprimer une option dans la question qIndex
  addOption(qIndex: number): void {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number): void {
    this.getOptions(qIndex).removeAt(optIndex);
  }

  // 6) Quand l’utilisateur clique “Enregistrer”
  submit(): void {
    if (this.surveyForm.invalid) {
      return;
    }
    this.saving.set(true);

    const payload = this.surveyForm.getRawValue() as Survey;

    this.api.create(payload).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('Erreur lors de la création du sondage', err);
        this.saving.set(false);
      }
    });
  }

  // 7) Hook pour empêcher la navigation si le formulaire est dirty
  hasUnsaved(): boolean {
    return this.surveyForm.dirty && !this.saving();
  }
}
