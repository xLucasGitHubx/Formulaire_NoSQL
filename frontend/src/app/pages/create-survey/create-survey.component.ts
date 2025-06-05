import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { QuestionType } from '../../models/survey.model';

@Component({
  standalone: true,
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
  imports: [ReactiveFormsModule],
})
export class CreateSurveyComponent {
  private fb = inject(FormBuilder);
  private api = inject(SurveyService);
  private router = inject(Router);

  saving = signal(false);

  surveyForm = this.fb.group({
    name: ['', Validators.required],
    questions: this.fb.array([this.createQuestionGroup()]),
  });

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  questionLabel = computed(() => `Questions (${this.questions.length})`);

  createQuestionGroup() {
    return this.fb.group({
      title: ['', Validators.required],
      type: ['text' as QuestionType, Validators.required],
      options: this.fb.array([]),
    });
  }

  addQuestion() {
    this.questions.push(this.createQuestionGroup());
  }
  removeQuestion(i: number) {
    this.questions.removeAt(i);
    if (this.questions.length === 0) this.addQuestion();
  }

  addOption(qIndex: number) {
    const options = this.questions.at(qIndex).get('options') as FormArray;
    options.push(this.fb.control('', Validators.required));
  }
  removeOption(qIndex: number, optIdx: number) {
    const options = this.questions.at(qIndex).get('options') as FormArray;
    options.removeAt(optIdx);
  }

  submit() {
    if (this.surveyForm.invalid) return;
    this.saving.set(true);
    this.api.create(this.surveyForm.value).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: err => { console.error(err); this.saving.set(false); },
    });
  }

  hasUnsaved(): boolean {
    return this.surveyForm.dirty && !this.saving();
  }
}
