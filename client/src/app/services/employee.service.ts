import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) { }

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
      })))
    );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    const payload = {
      ...employee,
      streetNumber: employee.address.streetNumber,
      addressLine1: employee.address.addressLine1,
      addressLine2: employee.address.addressLine2,
      city: employee.address.city,
      country: employee.address.country,
      address: undefined
    };
    return this.http.post<Employee>(this.apiUrl, payload);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    const payload = {
      ...employee,
      streetNumber: employee.address.streetNumber,
      addressLine1: employee.address.addressLine1,
      addressLine2: employee.address.addressLine2,
      city: employee.address.city,
      country: employee.address.country,
      address: undefined
    };
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, payload);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
