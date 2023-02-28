import { DropDown } from "./DropDown";

export class IRFRevenueSharing {
  Id: number;
  IRFID: number;
  EntityType: string;
  EntityID: number;
  GrossProfit: number;
  SharingType: string;
  Value: number;
  ComputedValue: number;
  Remarks: string;
  LastUpdatedOn: Date;
  LastUpdatedBy: number;
  RowState: string;
  SourcingConsultant: DropDown;
  SourcingConsultantId: number;
}
