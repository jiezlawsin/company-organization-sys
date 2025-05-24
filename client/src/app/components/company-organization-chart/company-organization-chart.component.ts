import { Component, Input, SimpleChanges } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-company-organization-chart',
  imports: [
    CommonModule,
    OrganizationChartModule,
    AvatarModule,
    AvatarGroupModule,
  ],
  templateUrl: './company-organization-chart.component.html',
  styleUrl: './company-organization-chart.component.scss'
})
export class CompanyOrganizationChartComponent {
  @Input() employees: Employee[] = [];

  data: TreeNode[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employees'] && this.employees) {
      this.buildOrganizationChart();
    }
  }

  getInitials(employee: Employee | undefined): string {
    return employee && employee.firstName && employee.lastName ? employee.firstName.charAt(0).toUpperCase() + employee.lastName.charAt(0).toUpperCase() : '';
  }

  buildOrganizationChart(): void {
    if (!this.employees || this.employees.length === 0) {
      this.data = [];
      return;
    }

    const employeeMap = new Map<string, Employee>();
    this.employees.forEach(emp => employeeMap.set(emp.id, emp));

    const rootEmployees = this.employees.filter(emp => !emp.reportsTo);
    this.data = rootEmployees.map(rootEmp => this.buildTreeNode(rootEmp, employeeMap));
  }

  private buildTreeNode(employee: Employee, employeeMap: Map<string, Employee>): TreeNode {
    const directReports = this.employees.filter(emp => emp.reportsTo === employee.id);

    const node: TreeNode = {
      label: `${employee.firstName} ${employee.lastName}`,
      type: 'person',
      styleClass: 'org-chart-node',
      expanded: true,
      data: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        avatar: this.getInitials(employee),
        employee: employee
      }
    };

    if (directReports.length > 0) {
      node.children = directReports.map(report => this.buildTreeNode(report, employeeMap));
    }
    return node;
  }
}
