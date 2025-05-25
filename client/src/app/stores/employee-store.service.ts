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

  constructor() {
    this.initializeWithSeedData();
  }

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
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
  }

  private loadFromStorage(): Employee[] {
    const storedEmployees = sessionStorage.getItem(this.STORAGE_KEY);
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  }

  private generateTempId(): string {
    return `temp_${crypto.randomUUID()}`;
  }

  private initializeWithSeedData(): void {
    const currentEmployees = this.employeesSubject.value;

    if (currentEmployees.length === 0) {
      console.log('Loading initial seed data for employees...');
      const seedEmployees = this.getSeedEmployees();
      this.employeesSubject.next(seedEmployees);
      this.saveToStorage();
    }
  }

  private getSeedEmployees(): Employee[] {
    return [
      {
        id: 'emp-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        position: 'Chief Executive Officer',
        companyId: 'comp-1',
        reportsTo: null,
        address: {
          streetNumber: '456',
          addressLine1: 'Ponsonby Road',
          addressLine2: 'Apt 15',
          city: 'Auckland',
          country: 'NZ'
        }
      },
      {
        id: 'emp-2',
        firstName: 'Michael',
        lastName: 'Chen',
        position: 'Chief Technology Officer',
        companyId: 'comp-1',
        reportsTo: 'emp-1',
        address: {
          streetNumber: '789',
          addressLine1: 'Lambton Quay',
          addressLine2: '',
          city: 'Wellington',
          country: 'NZ'
        }
      },
      {
        id: 'emp-3',
        firstName: 'Emma',
        lastName: 'Williams',
        position: 'Senior Software Engineer',
        companyId: 'comp-1',
        reportsTo: 'emp-2',
        address: {
          streetNumber: '321',
          addressLine1: 'Karangahape Road',
          addressLine2: '',
          city: 'Auckland',
          country: 'NZ'
        }
      },
      {
        id: 'emp-4',
        firstName: 'James',
        lastName: 'Brown',
        position: 'Frontend Developer',
        companyId: 'comp-1',
        reportsTo: 'emp-2',
        address: {
          streetNumber: '654',
          addressLine1: 'Cuba Street',
          addressLine2: 'Unit 3',
          city: 'Wellington',
          country: 'NZ'
        }
      },
      {
        id: 'emp-5',
        firstName: 'Daniel',
        lastName: 'Thompson',
        position: 'Founder & CEO',
        companyId: 'comp-2',
        reportsTo: null,
        address: {
          streetNumber: '88',
          addressLine1: 'Flinders Street',
          addressLine2: 'Suite 12',
          city: 'Melbourne',
          country: 'AU'
        }
      },
      {
        id: 'emp-6',
        firstName: 'Michelle',
        lastName: 'Lee',
        position: 'Head of Engineering',
        companyId: 'comp-2',
        reportsTo: 'emp-5',
        address: {
          streetNumber: '200',
          addressLine1: 'Bourke Street',
          addressLine2: '',
          city: 'Melbourne',
          country: 'AU'
        }
      },
      {
        id: 'emp-7',
        firstName: 'Kevin',
        lastName: 'Rodriguez',
        position: 'Full Stack Developer',
        companyId: 'comp-2',
        reportsTo: 'emp-6',
        address: {
          streetNumber: '77',
          addressLine1: 'Pitt Street',
          addressLine2: 'Level 15',
          city: 'Sydney',
          country: 'AU'
        }
      },
      {
        id: 'emp-8',
        firstName: 'Ashley',
        lastName: 'White',
        position: 'Managing Director',
        companyId: 'comp-3',
        reportsTo: null,
        address: {
          streetNumber: '125',
          addressLine1: 'George Street',
          addressLine2: 'Level 22',
          city: 'Sydney',
          country: 'AU'
        }
      },
      {
        id: 'emp-9',
        firstName: 'Ryan',
        lastName: 'Clark',
        position: 'Product Manager',
        companyId: 'comp-3',
        reportsTo: 'emp-8',
        address: {
          streetNumber: '300',
          addressLine1: 'Kent Street',
          addressLine2: 'Office 45',
          city: 'Sydney',
          country: 'AU'
        }
      },
      {
        id: 'emp-10',
        firstName: 'Stephanie',
        lastName: 'Lewis',
        position: 'UX Designer',
        companyId: 'comp-3',
        reportsTo: 'emp-9',
        address: {
          streetNumber: '95',
          addressLine1: 'Market Street',
          addressLine2: 'Unit 8',
          city: 'Sydney',
          country: 'AU'
        }
      }
    ];
  }
}
