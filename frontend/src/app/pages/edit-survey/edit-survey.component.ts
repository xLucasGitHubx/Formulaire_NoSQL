import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { CreateSurveyComponent } from '../create-survey/create-survey.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-edit-survey',
  template: `
    <app-create-survey #base></app-create-survey>
  `,
  imports: [CreateSurveyComponent],
})
export class EditSurveyComponent {
  private route = inject(ActivatedRoute);
  private api = inject(SurveyService);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get('id')!;
  loading = signal(true);

  constructor() {
    this.api.getById(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: survey => {
          queueMicrotask(() => {
            (document.querySelector('app-create-survey') as any)
              ?.surveyForm.patchValue(survey);
            this.loading.set(false);
          });
        },
        error: () => this.router.navigateByUrl('/'),
      });
  }
}
