import { CreditNoteDetail } from './CreditNoteDetail';

export class CreditNoteSummary {
  ToBeSubmittedAndRejected: Array<CreditNoteDetail>;
  PendingForApproval: Array<CreditNoteDetail>;
  Approved: Array<CreditNoteDetail>;
  PublishedCN: Array<CreditNoteDetail>;
}
