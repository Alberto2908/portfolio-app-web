import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitCounter } from '../models/visit-counter.model';

@Injectable({ providedIn: 'root' })
export class VisitCounterService {
  private readonly baseUrl = 'http://localhost:8085/api/visits';

  constructor(private http: HttpClient) {}

  incrementVisit(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/increment`, {}, { withCredentials: true });
  }

  getVisitCount(): Observable<VisitCounter> {
    return this.http.get<VisitCounter>(`${this.baseUrl}/count`, { withCredentials: true });
  }
}
