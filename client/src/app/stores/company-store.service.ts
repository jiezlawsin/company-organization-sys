import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyStore {
  private readonly STORAGE_KEY = 'companies_store';
  private companiesSubject: BehaviorSubject<Company[]> = new BehaviorSubject<Company[]>(this.loadFromStorage());

  public companies$: Observable<Company[]> = this.companiesSubject.asObservable();

  constructor() { }

  getAll(): Company[] {
    return this.companiesSubject.getValue();
  }

  getById(id: string): Company | undefined {
    return this.getAll().find(company => company.id === id);
  }

  setAll(companies: Company[]): void {
    this.companiesSubject.next(companies);
    this.saveToStorage();
  }

  add(company: Company): void {
    const newCompany = {
      ...company,
      id: company.id || this.generateTempId(),
    }

    const currentCompanies = this.companiesSubject.getValue();
    const updatedCompanies = [...currentCompanies, newCompany];

    this.companiesSubject.next(updatedCompanies);
    this.saveToStorage();
  }

  update(updatedCompany: Company): void {
    const currentCompanies = this.companiesSubject.getValue();
    const companyIndex = currentCompanies.findIndex(company => company.id === updatedCompany.id);

    if (companyIndex !== -1) {
      const updatedCompanies = [...currentCompanies];
      updatedCompanies[companyIndex] = updatedCompany;

      this.companiesSubject.next(updatedCompanies);
      this.saveToStorage();
    } else {
      console.warn(`Company with id ${updatedCompany.id} not found.`);
    }
  }

  delete(id: string): void {
    const currentCompanies = this.companiesSubject.getValue();
    const updatedCompanies = currentCompanies.filter(company => company.id !== id);

    this.companiesSubject.next(updatedCompanies);
    this.saveToStorage();
  }

  replaceTempId(tempId: string, realCompany: Company): void {
    const currentCompany = this.companiesSubject.value;
    const updatedCompany = currentCompany.map(emp =>
      emp.id === tempId ? realCompany : emp
    );

    this.companiesSubject.next(updatedCompany);
    this.saveToStorage();
  }

  isTempId(id: string): boolean {
    return id.startsWith('temp_');
  }

  private saveToStorage(): void {
    const companies = this.companiesSubject.getValue();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(companies));
  }

  private loadFromStorage(): Company[] {
    const storedCompanies = localStorage.getItem(this.STORAGE_KEY);
    return storedCompanies ? JSON.parse(storedCompanies) : [];
  }

  private generateTempId(): string {
    return `temp_${crypto.randomUUID()}`;
  }
}
