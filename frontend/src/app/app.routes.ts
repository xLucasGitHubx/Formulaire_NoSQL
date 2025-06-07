import { Routes } from '@angular/router';
import { SurveyListComponent } from './pages/survey-list/survey-list.component';
import { CreateSurveyComponent } from './pages/create-survey/create-survey.component';
import { EditSurveyComponent } from './pages/edit-survey/edit-survey.component';
import { TakeSurveyComponent } from './pages/take-survey/take-survey.component';
import { exitIfUnsaved } from './guards/unsaved.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: '', component: SurveyListComponent, title: 'Sondages', canActivate: [authGuard] },
  { path: 'create', component: CreateSurveyComponent, canDeactivate: [exitIfUnsaved], canActivate: [authGuard] },
  { path: 'edit/:id', component: EditSurveyComponent, canDeactivate: [exitIfUnsaved], canActivate: [authGuard] },
  { path: 'survey/:id', component: TakeSurveyComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
