import { ClaimSheetDetail } from "./ClaimSheetDetail";

export class ClaimSheetSummary{
  ToBeSubmitted: Array<ClaimSheetDetail>;
  Submitted: Array<ClaimSheetDetail>;
  ToBeApproved: Array<ClaimSheetDetail>;
  Approved: Array<ClaimSheetDetail>;
  Processed: Array<ClaimSheetDetail>;
  Paid: Array<ClaimSheetDetail>;
  ProcessedUnpaid: Array<ClaimSheetDetail>;
}
