import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Company } from '../../models/company.model';
import { Employee } from '../../models/employee.model';
import { CompanyService } from '../../services/company.service';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeFormDialogComponent } from '../../components/employee-form-dialog/employee-form-dialog.component';
import { CompanyFormDialogComponent } from '../../components/company-form-dialog/company-form-dialog.component';
import { EmployeesTableComponent } from '../../components/employees-table/employees-table.component';
import { CompanyOrganizationChartComponent } from '../../components/company-organization-chart/company-organization-chart.component';
import { ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    EmployeeFormDialogComponent,
    CompanyFormDialogComponent,
    EmployeesTableComponent,
    CompanyOrganizationChartComponent,
    CardModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ConfirmDialog,
    TabsModule
  ],
  providers: [
    ConfirmationService,
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  showEmployeeDialog: boolean = false;
  showCompanyDialog: boolean = false;
  isEditMode: boolean = false;
  formLoading: boolean = false;

  employeeFormError: string = '';
  companyFormError: string = '';

  companyId: string = '';
  company: Company | null = null;
  updateCompany: Company = { id: '', name: '' };;

  employees: Employee[] = [];
  newEmployee: Employee = this.getEmptyEmployee();

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.companyId = params.get('companyId') || '';
      if (this.companyId) {
        this.companyService.getCompanyById(this.companyId).subscribe(company => {
          this.company = company;
        });
      } else {
        this.router.navigate(['/companies']);
      }
    });
    this.loadEmployees();
  }

  getCompanyName(): string {
    return this.company ? this.company.name : 'Company';
  }

  getEmptyEmployee(): Employee {
    return {
      id: '',
      firstName: '',
      lastName: '',
      position: '',
      address: {
        streetNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: ''
      },
      reportsTo: null,
      companyId: this.companyId
    };
  }

  loadEmployees() {
    this.employeeService.getEmployeesByCompany(this.companyId).subscribe({
      next: (employees) => this.employees = employees,
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  openEmployeeDialog() {
    this.showEmployeeDialog = true;
    this.isEditMode = false;
    this.newEmployee = this.getEmptyEmployee();
    this.employeeFormError = '';
  }

  onSaveEmployee(employee: Employee) {
    this.formLoading = true;
    this.employeeFormError = '';
    employee.companyId = this.companyId;
    console.log('Saving employee:', employee);
    if (employee.id) {
      this.employeeService.updateEmployee(employee).subscribe({
        next: () => {
          this.showEmployeeDialog = false;
          this.formLoading = false;
          this.loadEmployees();
        },
        error: (err) => {
          this.formLoading = false;
          this.employeeFormError = 'Failed to update employee.';
          console.error(err);
        }
      });
    } else {
      this.employeeService.addEmployee(employee).subscribe({
        next: () => {
          this.showEmployeeDialog = false;
          this.formLoading = false;
          this.loadEmployees();
        },
        error: (err) => {
          this.employeeFormError = 'Failed to add employee.';
          this.formLoading = false;
          console.error(err);
        }
      });
    }
  }

  onEditEmployee(employee: Employee) {
    this.newEmployee = JSON.parse(JSON.stringify(employee));
    this.isEditMode = true;
    this.showEmployeeDialog = true;
    this.employeeFormError = '';
  }

  onDeleteEmployee(employee: Employee) {
    console.log('Deleting employee:', employee);
    if (employee.id) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Failed to delete employee:', err);
        }
      });
    }
  }
  openCompanyDialog() {
    this.showCompanyDialog = true;
    this.isEditMode = true;
    this.companyFormError = '';
    this.updateCompany = this.company ? { ...this.company } : { id: '', name: '' };
  }

  onSaveCompany(company: Company) {
    this.formLoading = true;
    this.companyFormError = '';

    this.companyService.updateCompany(company).subscribe({
      next: (updatedCompany) => {
        this.company = updatedCompany;
        this.showCompanyDialog = false;
        this.formLoading = false;
      },
      error: (err) => {
        console.log(err.error.error);
        this.companyFormError = 'Failed to update company.';
        if (err && err.error && err.error.error) {
          this.companyFormError = err.error.error;
        }
        this.formLoading = false;
        console.error(err);
      }
    });
  }

  onDeleteCompany(event: Event) {
    if (this.company) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to delete this record?',
        header: 'Remove Company',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Delete',
          severity: 'danger',
        },
        accept: () => {
          if (this.company && this.company.id) {
            this.companyService.deleteCompany(this.company.id).subscribe({
              next: () => {
                this.router.navigate(['/companies']);
              },
              error: (err) => {
                console.error('Failed to delete company:', err);
              }
            });
            this.router.navigate(['/companies']);
          }
        },
      });
    }
  }
}
