import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeStore {
  private readonly STORAGE_KEY = 'employees_store';
  private employeesSubject: BehaviorSubject<Employee[]> = new BehaviorSubject<Employee[]>(this.loadFromStorage());

  public employees$: Observable<Employee[]> = this.employeesSubject.asObservable();

  constructor() { }

  getAll(): Employee[] {
    return this.employeesSubject.getValue();
  }

  getByCompanyId(companyId: string): Employee[] {
    return this.employeesSubject.value.filter(employee => employee.companyId === companyId);
  }

  getById(id: string): Employee | undefined {
    return this.getAll().find(employee => employee.id === id);
  }

  setAll(employees: Employee[]): void {
    this.employeesSubject.next(employees);
    this.saveToStorage();
  }

  setByCompanyId(companyId: string, employees: Employee[]): void {
    const currentEmployees = this.getAll();
    const filteredEmployees = currentEmployees.filter(employee => employee.companyId !== companyId);
    const updatedEmployees = [...filteredEmployees, ...employees];
    this.employeesSubject.next(updatedEmployees);
    this.saveToStorage();
  }

  add(employee: Employee): void {
    const newEmployee = {
      ...employee,
      id: employee.id || this.generateTempId(),
    };

    const currentEmployees = this.employeesSubject.getValue();
    const updatedEmployees = [...currentEmployees, newEmployee];

    this.employeesSubject.next(updatedEmployees);
    this.saveToStorage();
  }

  update(updatedEmployee: Employee): void {
    const currentEmployees = this.employeesSubject.getValue();
    const employeeIndex = currentEmployees.findIndex(employee => employee.id === updatedEmployee.id);

    if (employeeIndex !== -1) {
      const updatedEmployees = [...currentEmployees];
      updatedEmployees[employeeIndex] = updatedEmployee;

      this.employeesSubject.next(updatedEmployees);
      this.saveToStorage();
    } else {
      console.warn(`Employee with id ${updatedEmployee.id} not found.`);
    }
  }

  delete(id: string): void {
    const currentEmployees = this.employeesSubject.getValue();
    const updatedEmployees = currentEmployees.filter(employee => employee.id !== id);

    this.employeesSubject.next(updatedEmployees);
    this.saveToStorage();
  }

  replaceTempId(tempId: string, realEmployee: Employee): void {
    const currentEmployees = this.employeesSubject.value;
    const updatedEmployees = currentEmployees.map(emp =>
      emp.id === tempId ? realEmployee : emp
    );

    this.employeesSubject.next(updatedEmployees);
    this.saveToStorage();
  }

  isTempId(id: string): boolean {
    return id.startsWith('temp_');
  }

  private saveToStorage(): void {
    const employees = this.employeesSubject.getValue();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
  }

  private loadFromStorage(): Employee[] {
    const storedEmployees = localStorage.getItem(this.STORAGE_KEY);
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  }

  private generateTempId(): string {
    return `temp_${crypto.randomUUID()}`;
  }
}
