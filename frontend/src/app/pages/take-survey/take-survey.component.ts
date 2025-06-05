import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-take-survey',
  templateUrl: './take-survey.component.html',
  styleUrls: ['./take-survey.component.scss'],
  imports: [ReactiveFormsModule, NgIf, NgFor],
})
export class TakeSurveyComponent {
  private api = inject(SurveyService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  survey: any;
  form!: FormGroup;
  submitted = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getById(id).subscribe(s => {
      this.survey = s;
      this.buildForm();
    });
  }

  buildForm() {
    const group: Record<string, any> = {};
    this.survey.questions.forEach((q: any) => {
      group[q.title] = [''];
    });
    this.form = this.fb.group(group);
  }

  submit() {
    if (this.form.invalid) return;
    this.api['http']
      .post('http://localhost:9000/api/responses', {
        surveyId: this.survey._id,
        answers: this.form.value,
      })
      .subscribe(() => (this.submitted = true));
  }
}
