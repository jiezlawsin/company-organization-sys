import { Component, Input, SimpleChanges } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { Company } from '../../models/company.model';

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
  @Input() company: Company = { id: '', name: '' };
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

    const rootEmployees = this.employees.filter(emp => !emp.reportsTo || emp.reportsTo === null || emp.reportsTo === '');

    if (rootEmployees.length === 0) {
      this.data = [{
        label: this.company.name,
        type: 'department',
        styleClass: 'org-chart-root',
        expanded: true,
        children: this.employees.map(emp => this.buildTreeNode(emp))
      }];
      return;
    }

    if (rootEmployees.length === 1) {
      this.data = [this.buildTreeNode(rootEmployees[0])];
    } else {
      this.data = [{
        label: this.company.name,
        type: 'department',
        styleClass: 'org-chart-root',
        expanded: true,
        children: rootEmployees.map(rootEmp => this.buildTreeNode(rootEmp))
      }];
    }
  }

  private buildTreeNode(employee: Employee): TreeNode {
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
      node.children = directReports.map(report => this.buildTreeNode(report));
    }
    return node;
  }
}
