import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { environment } from '../environments/environment';
import { OfflineQueueService } from './offline-queue.service';
import { CompanyStore } from '../stores/company-store.service';
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(
    private http: HttpClient,
    private companyStore: CompanyStore,
    private offlineQueueService: OfflineQueueService,
  ) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl).pipe(
      tap(companies => {
        this.companyStore.setAll(companies);
      }),
      catchError(error => {
        console.warn('API request failed, falling back to cached data:', error);
        return of(this.companyStore.getAll());
      })
    );
  }

  getCompanyById(id: string): Observable<Company> {
    console.log(`Fetching company with ID: ${id}`);
    return this.http.get<Company>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn(`API request failed for company ${id}, falling back to cached data:`, error);
        const company = this.companyStore.getById(id);
        return of(company || { id, name: '', address: {} } as Company);
      })
    );
  }

  addCompany(company: Company): Observable<Company> {
    this.companyStore.add(company);
    const storedCompany = this.companyStore.getAll().slice(-1)[0];

    return this.http.post<Company>(this.apiUrl, storedCompany).pipe(
      tap(newCompany => {
        if (this.companyStore.isTempId(storedCompany!.id)) {
          this.companyStore.replaceTempId(storedCompany!.id, newCompany);
        }
      }
      ), catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'POST',
          url: this.apiUrl,
          payload: storedCompany,
          description: 'Adding company while offline'
        });
        return of(storedCompany);
      }
      ));
  }

  updateCompany(company: Company): Observable<Company> {
    this.companyStore.update(company);

    return this.http.put<Company>(`${this.apiUrl}/${company.id}`, company).pipe(
      catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'PUT',
          url: `${this.apiUrl}/${company.id}`,
          payload: company,
          description: 'Updating company while offline'
        });
        return of(company);
      })
    );
  }

  deleteCompany(id: string): Observable<any> {
    this.companyStore.delete(id);

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'DELETE',
          url: `${this.apiUrl}/${id}`,
          description: 'Deleting company while offline'
        });
        return of({ message: 'Company deletion queued' });
      })
    );
  }
}
