import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Employee } from '../../models/employee.model';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule
  ],
  templateUrl: './employee-form-dialog.component.html',
  styleUrl: './employee-form-dialog.component.scss'
})
export class EmployeeFormDialogComponent {
  @Input() visible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() employee: Employee = this.getEmptyEmployee();
  @Input() employees: Employee[] = [];
  @Input() error: string = '';
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Employee>();

  filteredEmployees: Employee[] = [];
  selectedReportsTo: any = null;

  ngOnChanges() {
    if (this.employee && this.employees) {
      this.selectedReportsTo = this.fullNameList.find(
        e => e.id === this.employee.reportsTo
      ) || null;
    }
  }

  get fullNameList(): any[] {
    return this.employees
      .filter(e => !this.employee.id || e.id !== this.employee.id) // Exclude self
      .map(e => ({
        ...e,
        fullName: `${e.firstName} ${e.lastName}`
      }));
  }

  filterEmployees(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEmployees = [
      { fullName: 'None', id: null },
      ...this.fullNameList.filter(emp =>
        emp.fullName.toLowerCase().includes(query)
      )
    ];
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
      companyId: ''
    };
  }

  onHide() {
    this.visibleChange.emit(false);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.selectedReportsTo && this.selectedReportsTo.id) {
        this.selectedReportsTo = this.selectedReportsTo.id;
      }
      this.employee.reportsTo = this.selectedReportsTo ?? null;
      this.save.emit(this.employee);
    }
  }
}
