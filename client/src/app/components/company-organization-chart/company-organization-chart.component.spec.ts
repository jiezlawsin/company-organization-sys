import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOrganizationChartComponent } from './company-organization-chart.component';

describe('CompanyOrganizationChartComponent', () => {
  let component: CompanyOrganizationChartComponent;
  let fixture: ComponentFixture<CompanyOrganizationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyOrganizationChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyOrganizationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
