import { Component, OnInit, ViewChild } from '@angular/core';
import { CreditNote } from '../../model/CreditNote';
import { Service } from '../../Service/service';
import { ConfigService } from '../../Service/config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceDetails } from '../../model/InvoiceDetails';
import { Common } from '../../shared/common';
import { RequestOptions } from '@angular/http';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FileUploader } from '../../../../node_modules/ng2-file-upload';

@Component({
  selector: 'app-raise-credit-note',
  templateUrl: './raise-credit-note.component.html',
  styleUrls: ['./raise-credit-note.component.css']
})
export class RaiseCreditNoteComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  previousPage: string;
  _creditNote: CreditNote;
  _invoiceDetails: InvoiceDetails;
  apiEndpoints = Common.GetEndPoints();
  inputParams: any;
  invoiceNumber: string;
  creditNoteId: number;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  creditNoteDate: Object;
  isReadOnly: boolean;
  dbOps: DBOperation;
  saveBtnText: string;
  user: any;
  @ViewChild('creditNoteSubmitCnfm') creditNoteSubmitCnfm: ModalComponent;
  selectedStatus: string;
  remarks: string;
  URL = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader(
    {
      url: this.URL,
      authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
      maxFileSize: 4 * 1024 * 1024 // 4 MB
    });
  hasAnotherDropZoneOver: boolean;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.previousPage = sessionStorage.getItem('irf-home');
    this._creditNote = new CreditNote();
    this._invoiceDetails = new InvoiceDetails();

    this.inputParams = this.route.queryParams.subscribe(params => {
      this.invoiceNumber = params['id'];
      this.creditNoteId = params['cid'];

      if (this.creditNoteId > 0) {
        this.dbOps = DBOperation.update;
        this.saveBtnText = "Update";
      } else {
        this.dbOps = DBOperation.insert;
        this.saveBtnText = "Save";
      }
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status === 200) {
        this._creditNote.DocumentId = response;
      }
    };
  }
  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  ngOnInit() {
    this.user = sessionStorage.getItem('currentUser');
    if (this.user !== null && this.user !== '') {
      const userObject = JSON.parse(this.user);
      this.user = userObject;
    }
    this.loadInvoiceDetails();
  }

  loadInvoiceDetails = () => {
    const options = new RequestOptions({
      params: {
        invoiceNumber: this.invoiceNumber,
      }
    });

    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_CREDINOTE_DETAILS_ENDPOINT, options)
      .subscribe(c => {
        this._invoiceDetails = c;
        this.indLoading = false;
        this.msg = "";
        this._creditNote.InvoiceID = this._invoiceDetails.InvoiceId;
        this._creditNote.ClientID = this._invoiceDetails.ClientId;
        this._creditNote.InvoiceNumber = this.invoiceNumber;
        this.loadCreditNoteDetails();
      },
        error => this.msg = <any>error);
  }

  loadCreditNoteDetails = () => {
    if (this.dbOps === DBOperation.update) {
      const options = new RequestOptions({
        params: {
          id: this.creditNoteId,
        }
      });
      this.indLoading = true;

      this.service.get(this.apiEndpoints.BASE_GET_CREDINOTE_ENDPOINT, options)
        .subscribe(c => {
          this._creditNote = c;
          this._creditNote.InvoiceNumber = this.invoiceNumber;
          this.indLoading = false;
          this.msg = "";
          this.creditNoteDate = Common.setDateToControl(this._creditNote.CreditDateStr, "/");
          if (this._creditNote.Status === 3 || this._creditNote.Status === 2) {
            this.isReadOnly = true;
          }
        },
          error => this.msg = <any>error);
    }
  }

  onDateChanged(event: IMyDateModel) {
    this._creditNote.CreditDate = new Date(event.date.year, event.date.month - 1, event.date.day);
    this._creditNote.CreditDateStr = event.formatted;
    if (Common.isFutureDate(event.formatted, "/")) {
      this.msg = "Credit date should not be a future date";
    } else {
      this.msg = "";
    }
  }

  ValidateCreditNote = () => {
    if (Common.isFutureDate(this._creditNote.CreditDateStr, "/")) {
      this.msg = "Credit date should not be a future date";
      return false;
    }

    if (!this._creditNote.CreditNoteAmount && this._creditNote.CreditNoteAmount < 0) {
      this.msg = "Invalid Credit amount";
      return false;
    }

    if (this._creditNote.CreditNoteAmount > this._invoiceDetails.InvoiceAmount) {
      this.msg = "Credit amount should not exceed the invoice amount";
      return false;
    }

    this.msg = "";
    return true;
  }

  onSave() {
    if (!this.ValidateCreditNote()) {
      return;
    }

    if (this.dbOps === DBOperation.insert) {
      this.service.post(this.apiEndpoints.BASE_GET_CREDINOTE_ENDPOINT, this._creditNote).subscribe(
        data => {
          this.msg = data;
          if (this.msg === "Record has been saved successfully"){
            this.router.navigate(['/home/credit-note-summary']);
          }
        },
        error => {
          this.msg = error;
        }
      );
    } if (this.dbOps === DBOperation.update) {
      this.service.put(this.apiEndpoints.BASE_GET_CREDINOTE_ENDPOINT, this._creditNote).subscribe(
        data => {
          this.msg = data;
          if (this.msg === "Record has been updated successfully"){
            this.router.navigate(['/home/credit-note-summary']);
          }
        },
        error => {
          this.msg = error;
        }
      );
    }

  }

  onApproveReject = (status: string) => {
    this.selectedStatus = status;
    this.creditNoteSubmitCnfm.open();
  }

  submitCreditNote = () => {
    this._creditNote.StatusText = this.selectedStatus;
    this._creditNote.Reasons = this.remarks;
    this.service.put(this.apiEndpoints.BASE_GET_CREDINOTE_REVIEW_SUMMARY_ENDPOINT, this._creditNote).subscribe(
      data => {
        this.msg = data;
        this.router.navigate(['/home/credit-note-review']);
      },
      error => {
        this.msg = error;
      }
    );
  }

  isConsultant(roleId: number) {
    return Common.isConsultantsRole(roleId);
  }


  isAccountsTeam(role: string) {
    return Common.isAccountsTeamsRole(role);
  }

}
