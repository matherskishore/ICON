import { DropDown } from "./DropDown";

export class IRFCandidate {
  Id: number;
  IRFID: number;
  CandidateName: string;
  PersonID: string;
  OfferedJobTitle: string;
  JobCategory: string;
  DateOfJoining: Date;
  JobLocation: string;
  AnnualCTC: number;
  SourcingConsultantID: number;
  LastUpdatedOn: Date;
  LastUpdatedBy: number;
  SourcingConsultant: DropDown;
  RowState: string;
  DateOfJoiningStr: string;
}
