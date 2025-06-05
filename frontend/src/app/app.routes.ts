import { Routes } from '@angular/router';
import { SurveyListComponent } from './pages/survey-list/survey-list.component';
import { CreateSurveyComponent } from './pages/create-survey/create-survey.component';
import { EditSurveyComponent } from './pages/edit-survey/edit-survey.component';
import { TakeSurveyComponent } from './pages/take-survey/take-survey.component';
import { exitIfUnsaved } from './guards/unsaved.guard';

export const routes: Routes = [
  { path: '', component: SurveyListComponent, title: 'Sondages' },
  { path: 'create', component: CreateSurveyComponent, canDeactivate: [exitIfUnsaved] },
  { path: 'edit/:id', component: EditSurveyComponent, canDeactivate: [exitIfUnsaved] },
  { path: 'survey/:id', component: TakeSurveyComponent },
  { path: '**', redirectTo: '' },
];
