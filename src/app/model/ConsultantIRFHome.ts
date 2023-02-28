import { ConsultantIRFStatus } from './ConsultantIRFStatus';

export class ConsultantIRFHome {
  ToBeSubmitted: Array<ConsultantIRFStatus>;
  PendingForApproval: Array<ConsultantIRFStatus>;
  Approved: Array<ConsultantIRFStatus>;
  Rejected: Array<ConsultantIRFStatus>;
}
