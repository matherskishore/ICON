import { ClaimSheetReport } from "./ClaimSheetReport";

export class PayoutRequest{
  ToBeSubmitted: Array<ClaimSheetReport>;
  ToBeProcessed: Array<ClaimSheetReport>;
  Processed: Array<ClaimSheetReport>;
}
