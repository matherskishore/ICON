export class DashboardData {
  InvoiceData: InvoiceData;
  EntitySharing: Array<EnititySharing>;
}

export class InvoiceData {
  TotalInvoiceAmount: number;
  TotalInvoices: number;
  TotalCollectionAmount: number;
  CollectionPercentage: number;
  TotalOutstandingAmount: number;
  OutstandingPercentage: number;
  TotalCreditNotesAmount: number;
  TotalCreditNotes: number;
}

export class EnititySharing {
  EntityType: string;
  ComputedValue: number;
}
