export class InvoiceProcessedDetail {
  Id: number;
  CompanyId: number;
  ReferenceNumber: number;
  InvoiceNumber: string;
  InvoiceDate: string;
  InvoiceAmountBeforeTax: number;
  InvoiceAmountAfterTax: number;
  Narration: string;
  Remarks: string;
  StatusCode: string;
  StatusCodeDescription: string;
}
