export class Collection {
  Id: number;
  InvoiceNumber: string;
  InvoiceID: number;
  InvoiceDate: Date;
  CollectionDate: Date;
  ClientName: string;
  ClientID: number;
  CreditAmount: number;
  TDS: number;
  TotalCollection: number;
  OtherDeduction: number;
  OutstandingAmount: number;
  Remarks: string;
  Status: number;
  LastUpdatedOn: Date;
  LastUpdatedBy: string;
  IsPublished: boolean;
}
