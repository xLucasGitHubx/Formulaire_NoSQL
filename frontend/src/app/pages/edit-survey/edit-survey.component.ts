// Chemin : frontend/src/app/pages/edit-survey/edit-survey.component.ts

import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Survey, Question, QuestionOption, QuestionType } from '../../models/survey.model';
import { switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-edit-survey',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './edit-survey.component.html',
  styleUrls: ['./edit-survey.component.scss']
})
export class EditSurveyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(SurveyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Pour afficher un loader si besoin
  loading = true;
  errorMessage = '';

  // Le même FormGroup que pour Create, mais on le remplit après récupération
  surveyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    questions: this.fb.array([])
  });

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  questionLabel(): string {
    return `Questions (${this.questions.length})`;
  }

  ngOnInit(): void {
    // 1) On récupère l’ID depuis l’URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de sondage introuvable dans l’URL.';
      return;
    }

    // 2) On demande le sondage à l’API puis on préremplit le formulaire
    this.api.getById(id).subscribe({
      next: (survey: Survey) => {
        // Remplissage du champ "name"
        this.surveyForm.get('name')?.setValue(survey.name);

        // Vider d’éventuelles questions (si, par erreur, on avait déjà quelque chose)
        this.questions.clear();

        // Pour chaque question reçue, on crée un FormGroup identique à newQuestionGroup(),
        // puis on patch les valeurs dans ce FormGroup.
        survey.questions.forEach((q: Question) => {
          // 2.a) Construction d’un FormGroup question de base
          const group = this.fb.group({
            title: [q.title, Validators.required],
            type: [q.type as QuestionType, Validators.required],
            options: this.fb.array([])
          });

          // 2.b) Si c’est un QCM (radio, checkbox, select), on préremplit les options
          if (q.type !== 'text' && Array.isArray(q.options)) {
            const optsFA = group.get('options') as FormArray;
            // Pour chaque option, on crée un FormControl<string> contenant la chaîne
            q.options.forEach((opt: QuestionOption) => {
              optsFA.push(this.fb.control(opt.label, Validators.required));
            });
          }

          // 2.c) On ajoute ce FormGroup au FormArray questions
          this.questions.push(group);
        });

        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors de la récupération du sondage', err);
        this.errorMessage = 'Impossible de charger les données du sondage.';
        this.loading = false;
      }
    });
  }

  // Comme dans CreateSurveyComponent : ajoute un nouveau FormGroup vide
  addQuestion(): void {
    this.questions.push(this.newQuestionGroup());
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    if (this.questions.length === 0) {
      this.addQuestion();
    }
  }

  addOption(qIndex: number): void {
    const opts = this.getOptions(qIndex);
    opts.push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number): void {
    this.getOptions(qIndex).removeAt(optIndex);
  }

  getOptions(qIndex: number): FormArray {
    return (this.questions.at(qIndex).get('options') as FormArray);
  }

  getQuestionType(qIndex: number): QuestionType {
    const value = this.questions.at(qIndex).get('type')?.value;
    return (value as QuestionType) || 'text';
  }

  private newQuestionGroup(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      type: ['text' as QuestionType, Validators.required],
      options: this.fb.array([])
    });
  }

  // Soumission du formulaire mis à jour
  submit(): void {
    if (this.surveyForm.invalid) {
      return;
    }

    // On reconstitue un objet Survey à partir du FormGroup
    const payload: Survey = this.surveyForm.getRawValue();

    // On récupère l’ID dans l’URL (de la même façon que ngOnInit)
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de sondage introuvable pour la mise à jour.';
      return;
    }

    // On appelle l’API PUT /api/surveys/:id
    this.api.update(id, payload).subscribe({
      next: updatedSurvey => {
        // Redirection vers la liste des sondages
        this.router.navigateByUrl('/');
      },
      error: err => {
        console.error('Erreur lors de la mise à jour du sondage', err);
        this.errorMessage = 'La mise à jour a échoué.';
      }
    });
  }
}
