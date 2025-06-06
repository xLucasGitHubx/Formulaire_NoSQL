// Chemin : frontend/src/app/pages/edit-survey/edit-survey.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SurveyService } from '../../services/survey.service'; // Ajustez le chemin selon votre projet
import { Survey, QuestionType, QuestionOption } from '../../models/survey.model'; // Ajustez selon vos modèles

@Component({
  standalone: true,
  selector: 'app-edit-survey',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './edit-survey.component.html',
  styleUrls: ['./edit-survey.component.scss']
})
export class EditSurveyComponent implements OnInit {
  loading = true;
  errorMessage = '';

  surveyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    questions: this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private api: SurveyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de sondage introuvable.';
      this.loading = false;
      return;
    }

    this.api.getById(id).subscribe({
      next: (survey: Survey) => {
        this.surveyForm.patchValue({ name: survey.name });
        survey.questions.forEach(q => {
          console.log('Options question:', q.options);
          const group = this.fb.group({
            title: [q.title, Validators.required],
            type: [q.type, Validators.required],
            options: this.fb.array([])
          });

          // Préremplir les options si la question n'est pas de type 'text'
          if (q.type !== 'text' && Array.isArray(q.options)) {
          const optsFA = group.get('options') as FormArray;
          // <-- ici, opt est une simple string, pas un objet
          q.options.forEach((opt: string) => {
            optsFA.push(this.fb.control(opt, Validators.required));
          });
        }

          this.questions.push(group);
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement du sondage.';
        this.loading = false;
      }
    });
  }

  addQuestion(): void {
    this.questions.push(this.fb.group({
      title: ['', Validators.required],
      type: ['text' as QuestionType, Validators.required],
      options: this.fb.array([])
    }));
  }

  hasUnsaved(): boolean {
    return this.surveyForm.dirty;
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  addOption(qIndex: number): void {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number): void {
    this.getOptions(qIndex).removeAt(optIndex);
  }

  submit(): void {
    if (this.surveyForm.invalid) {
      console.warn('Formulaire invalide', this.surveyForm);
      return;
    }

    const payload: Survey = this.surveyForm.getRawValue();
    console.log('Payload à envoyer:', payload);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de sondage introuvable pour la mise à jour.';
      return;
    }

    this.api.update(id, payload).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: err => {
        console.error('Erreur lors de la mise à jour du sondage', err);
        this.errorMessage = 'La mise à jour a échoué.';
      }
    });
  }
}
