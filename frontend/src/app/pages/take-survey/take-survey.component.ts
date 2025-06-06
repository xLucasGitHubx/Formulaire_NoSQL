/* take-survey.component.ts */
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-take-survey',
  templateUrl: './take-survey.component.html',
  styleUrls: ['./take-survey.component.scss'],
  imports: [ReactiveFormsModule, NgIf, NgFor, NgSwitch, NgSwitchCase],
})
export class TakeSurveyComponent {
  private api = inject(SurveyService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  survey: any;
  form!: FormGroup;
  submitted = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getById(id).subscribe(s => {
      this.survey = s;
      this.normalizeTypes();
      this.buildForm();
    });
  }

  /** Harmonise les types pour le ngSwitch du template */
  normalizeTypes() {
    this.survey.questions.forEach((q: any) => {
      // Harmonisation des types pour le template
      if (q.type === 'single-choice') q.type = 'radio';
      if (q.type === 'multiple-choice') q.type = 'checkbox';
      if (q.type === 'dropdown') q.type = 'select';
      // Si options est un tableau de string, transforme-le en [{label: ...}]
      if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
        q.options = q.options.map((label: string) => ({ label }));
      }
    });
  }

  buildForm() {
    const group: Record<string, FormControl> = {};
    this.survey.questions.forEach((q: any) => {
      group[q.title] = this.fb.control(
        q.type === 'checkbox' ? [] : ''
      );
    });
    this.form = this.fb.group(group);
  }

  /** Toggle helper pour les cases à cocher */
  toggleCheckbox(field: string, label: string, checked: boolean) {
    const current: string[] = this.form.controls[field].value || [];
    this.form.controls[field].setValue(
      checked ? [...current, label] : current.filter(v => v !== label)
    );
  }

  submit() {
    if (this.form.invalid) return;
    this.api.submitResponse({
      surveyId: this.survey._id,
      answers: this.form.value,
    }).subscribe(() => (this.submitted = true));
  }
}
