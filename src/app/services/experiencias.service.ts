import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experiencia } from '../models/experiencia.model';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExperienciasService {
  private apiUrl = 'http://localhost:8085/api/experiencias';

  constructor(private http: HttpClient) {}

  list(page: number = 0, size: number = 100): Observable<PageResponse<Experiencia>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Experiencia>>(this.apiUrl, { params, withCredentials: true });
  }

  getById(id: string): Observable<Experiencia> {
    return this.http.get<Experiencia>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  create(experiencia: Experiencia): Observable<Experiencia> {
    return this.http.post<Experiencia>(this.apiUrl, experiencia, { withCredentials: true });
  }

  update(id: string, experiencia: Experiencia): Observable<Experiencia> {
    return this.http.put<Experiencia>(`${this.apiUrl}/${id}`, experiencia, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  upload(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>('http://localhost:8085/api/habilidades/upload', formData, { withCredentials: true });
  }
}
