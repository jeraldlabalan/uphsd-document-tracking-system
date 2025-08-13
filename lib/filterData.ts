// lib/filterData.ts
export interface FilterData {
  documentTypes: { TypeID: number; TypeName: string }[];
  departments: { DepartmentID: number; Name: string }[];
  statuses: { StatusID: number; StatusName: string }[];
}

export async function fetchFilterData(): Promise<FilterData> {
  try {
    const [documentTypesRes, departmentsRes, statusesRes] = await Promise.all([
      fetch('/api/user/doctype'),
      fetch('/api/user/department'),
      fetch('/api/user/status')
    ]);

    const documentTypes = await documentTypesRes.json();
    const departments = await departmentsRes.json();
    const statuses = await statusesRes.json();

    return {
      documentTypes,
      departments,
      statuses
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      documentTypes: [],
      departments: [],
      statuses: []
    };
  }
}
