import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formacion } from '../models/formacion.model';
import { environment } from '../../environments/environment';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormacionesService {
  private apiUrl = `${environment.apiUrl}/api/formaciones`;

  constructor(private http: HttpClient) {}

  list(page: number = 0, size: number = 100): Observable<PageResponse<Formacion>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Formacion>>(this.apiUrl, { params, withCredentials: true });
  }

  getById(id: string): Observable<Formacion> {
    return this.http.get<Formacion>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  create(formacion: Formacion): Observable<Formacion> {
    return this.http.post<Formacion>(this.apiUrl, formacion, { withCredentials: true });
  }

  update(id: string, formacion: Formacion): Observable<Formacion> {
    return this.http.put<Formacion>(`${this.apiUrl}/${id}`, formacion, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
