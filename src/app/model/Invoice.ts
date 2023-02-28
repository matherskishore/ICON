import { IUser } from "./user";

export class Invoice {
  Id: number;
  IRFID: number;
  IRFType: string;
  IRFSubType: string;
  InvoiceNumber: string;
  InvoiceDate: Date;
  ClientID: number;
  ClientName: string;
  InvoiceAmountBeforeTax: number;
  InvoiceAmountAfterTax: number;
  InvoiceNarration: string;
  Remarks: string;
  Status: number;
  LastUpdatedOn: Date;
  LastUpdatedBy: number;
  IsPublished: boolean;
  ClientType: string;
  ConsultantId: number;
  ConsultantName: string;
  User: IUser;
  Collection: number;
  Outstanding: number;
  OtherDeductions: number;
  DocumentId: number;
  FileName: string;
  InvoiceCentre: string;
  GrossProfit: number;
}
