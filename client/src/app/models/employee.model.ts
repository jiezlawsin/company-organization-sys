export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  address: {
    streetNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    country: string;
  }
  reportsTo: string | null; // Employee ID of the manager
  companyId: string; // ID of the company the employee belongs to
}
