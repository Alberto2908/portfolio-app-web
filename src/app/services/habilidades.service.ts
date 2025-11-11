import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habilidad } from '../models/habilidad.model';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class HabilidadesService {
  private readonly baseUrl = 'http://localhost:8085/api/habilidades';

  constructor(private http: HttpClient) {}

  list(page = 0, size = 100, category?: string): Observable<Page<Habilidad>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category) params = params.set('category', category);
    return this.http.get<Page<Habilidad>>(this.baseUrl, { params, withCredentials: true });
  }

  create(habilidad: Habilidad): Observable<Habilidad> {
    return this.http.post<Habilidad>(this.baseUrl, habilidad, { withCredentials: true });
  }

  upload(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, form, { withCredentials: true });
  }

  getById(id: string): Observable<Habilidad> {
    return this.http.get<Habilidad>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  update(id: string, habilidad: Habilidad): Observable<Habilidad> {
    return this.http.put<Habilidad>(`${this.baseUrl}/${id}`, habilidad, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
