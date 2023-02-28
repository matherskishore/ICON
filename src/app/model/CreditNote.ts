export class CreditNote {
  Id: number;
  InvoiceID: number;
  ClientID: number;
  CreditNoteId: number;
  CreditDate: Date;
  CreditDateStr: string;
  CreditNoteAmount: number;
  Reasons: string;
  Status: number;
  LastUpdatedOn: Date;
  LastUpdatedBy: string;
  IsPublished: boolean;
  StatusText: string;
  CreditNoteNumber: string;
  ProcessedBy: number;
  ProcessedOn: Date;
  ProcessRemarks: string;
  OutstandingAmount: number;
  Remarks: string;
  InvoiceNumber: string;
  ConsultantId: number;
  FileName: string;
  DocumentId: number;
  InvoiceDocumentId: number;
  Narration: string;
}
