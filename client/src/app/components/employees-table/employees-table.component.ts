import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/employee.model';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-employees-table',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    AvatarModule,
    AvatarGroupModule,
    ConfirmDialog
  ],
  providers: [
    ConfirmationService,
  ],
  templateUrl: './employees-table.component.html',
  styleUrl: './employees-table.component.scss'
})
export class EmployeesTableComponent {
  @Input() employees: Employee[] = [];
  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<Employee>();

  constructor(
    private confirmationService: ConfirmationService
  ) { }

  getInitial(employee: Employee | undefined): string {
    return employee && employee.firstName && employee.lastName ? employee.firstName.charAt(0).toUpperCase() + employee.lastName.charAt(0).toUpperCase() : '';
  }

  getReportsToEmployee(reportsToId: string): Employee | undefined {
    return this.employees.find(emp => emp.id === reportsToId);
  }

  onDeleteEmployee(event: Event, employee: Employee): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Remove Employee',
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
        this.delete.emit(employee);
      },
    });
  }
}
