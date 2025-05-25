import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { EmployeeStore } from '../stores/employee-store.service';
import { OfflineQueueService } from './offline-queue.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(
    private http: HttpClient,
    private employeeStore: EmployeeStore,
    private offlineQueueService: OfflineQueueService,
  ) { }

  getEmployeesByCompany(companyId: string): Observable<Employee[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`).pipe(
      map(employees => employees.map(emp => ({
        ...emp,
        address: {
          streetNumber: emp.streetNumber || '',
          addressLine1: emp.addressLine1 || '',
          addressLine2: emp.addressLine2 || '',
          city: emp.city || '',
          country: emp.country || ''
        }
      }))),
      tap(employees => {
        this.employeeStore.setByCompanyId(companyId, employees);
      }),
      catchError(error => {
        return of(this.employeeStore.getByCompanyId(companyId));
      })
    );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    this.employeeStore.add(employee);
    const storedEmployee = this.employeeStore.getAll().slice(-1)[0];

    const payload = this.transformForApi(storedEmployee);

    return this.http.post<Employee>(this.apiUrl, payload).pipe(
      tap(newEmployee => {
        if (this.employeeStore.isTempId(storedEmployee.id)) {
          this.employeeStore.replaceTempId(storedEmployee.id, newEmployee);
        }
      }),
      catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'POST',
          url: this.apiUrl,
          payload: storedEmployee,
          description: 'Adding company while offline'
        });
        return of(storedEmployee);
      })
    );
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    this.employeeStore.update(employee);
    const storedEmployee = this.employeeStore.getById(employee.id);

    const payload = this.transformForApi(storedEmployee!);

    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, payload).pipe(
      catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'PUT',
          url: `${this.apiUrl}/${employee.id}`,
          payload: storedEmployee,
          description: 'Updating employee while offline'
        });
        return of(storedEmployee!);
      })
    );
  }

  deleteEmployee(id: string): Observable<any> {
    this.employeeStore.delete(id);

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn('API request failed, queuing for offline processing:', error);
        this.offlineQueueService.apiRequest({
          method: 'DELETE',
          url: `${this.apiUrl}/${id}`,
          description: 'Deleting employee while offline'
        });
        return of({ message: 'Employee deletion queued' });
      })
    );
  }

  private transformForApi(employee: Employee): any {
    return {
      ...employee,
      streetNumber: employee.address.streetNumber,
      addressLine1: employee.address.addressLine1,
      addressLine2: employee.address.addressLine2,
      city: employee.address.city,
      country: employee.address.country,
      address: undefined
    };
  }
}
