import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { EmployeesComponent } from './pages/employees/employees.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'companies/:companyId/employees', component: EmployeesComponent },
  { path: '**', redirectTo: 'companies' }
];
