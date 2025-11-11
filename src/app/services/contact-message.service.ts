import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactMessage } from '../models/contact-message.model';

@Injectable({ providedIn: 'root' })
export class ContactMessageService {
  private readonly baseUrl = 'http://localhost:8085/api/contact';

  constructor(private http: HttpClient) {}

  create(message: ContactMessage): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.baseUrl, message);
  }

  list(page = 0, size = 10, processed?: boolean) {
    const params: any = { page, size };
    if (processed !== undefined) params.processed = processed;
    return this.http.get<any>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<ContactMessage>(`${this.baseUrl}/${id}`);
  }

  markProcessed(id: string, value = true) {
    return this.http.patch<ContactMessage>(`${this.baseUrl}/${id}/processed`, null, {
      params: { value }
    });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
