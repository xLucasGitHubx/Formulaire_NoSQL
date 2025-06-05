import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, AsyncPipe } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey.model';

@Component({
  standalone: true,
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  imports: [NgFor, RouterLink, AsyncPipe],
})
export class SurveyListComponent {
  private api = inject(SurveyService);
  surveys = signal<Survey[]>([]);

  constructor() {
    this.fetch();
  }

  fetch() {
    this.api.getAll().subscribe(res => this.surveys.set(res));
  }

  delete(id?: string) {
    if (!id || !confirm('Supprimer ce sondage ?')) return;
    this.api.remove(id).subscribe(() => this.fetch());
  }
}
