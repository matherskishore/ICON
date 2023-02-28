import { DBOperation } from "../types/types";

export class IRFAttachment {
  Id: number;
  IRFID: number;
  FileName: string;
  DocumentID: number;
  Comments: string;
  IsClientConfirmationMail: boolean;
  LastUpdatedOn: Date;
  LastUpdatedBy: number;
  RowState: string;
}
