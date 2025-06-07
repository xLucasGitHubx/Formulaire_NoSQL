import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey } from '../models/survey.model';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly API = 'http://localhost:9000/api/surveys';

  constructor(private http: HttpClient) {}

  create(survey: Survey): Observable<Survey> {
    return this.http.post<Survey>(this.API, survey);
  }
  update(id: string, survey: Survey): Observable<Survey> {
    return this.http.put<Survey>(`${this.API}/${id}`, survey);
  }
  remove(id: string) {
    return this.http.delete(`${this.API}/${id}`);
  }
  getAll(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.API);
  }
  getById(id: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.API}/${id}`);
  }

  submitResponse(response: any) {
    return this.http.post('http://localhost:9000/api/responses', response);
  }
}
