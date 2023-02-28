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
import { SuspenseAccount } from '../../model/SuspenseAccount';
import { DropDown } from '../../model/DropDown';
import { FileUploader } from 'ng2-file-upload';
import { SuspenseAccountClaimDetail } from '../../model/SuspenseAccountClaimDetail';


@Component({
  selector: 'app-suspense-account',
  templateUrl: './suspense-account.component.html',
  styleUrls: ['./suspense-account.component.css']
})
export class SuspenseAccountComponent implements OnInit {
  apiEndpoints = Common.GetEndPoints();
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  previousPage: string;
  isReadOnly: boolean;
  suspenseAccountDate: Object;
  suspeseAccount: SuspenseAccount;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  saveBtnText: string;
  user: any;
  dbOps: DBOperation;
  inputParams: any;
  suspenseAccountId: number;
  invoiceCtrl: DropDown;
  invoiceList: Array<DropDown>;
  invoiceId: number;
  invoiceDetail: InvoiceDetails;
  claimId: number;
  URL = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader(
    {
      url: this.URL,
      authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
      maxFileSize: 4 * 1024 * 1024 // 4 MB
    });
  hasAnotherDropZoneOver: boolean;
  suspenseAccountClaim: SuspenseAccountClaimDetail;
  @ViewChild('ClaimCnfm') ClaimCnfm: ModalComponent;
  @ViewChild('ClaimApproveCnfm') ClaimApproveCnfm: ModalComponent;
  isClaimReadOnly: boolean;
  reviewStatus: number;
  reviewStatusText: string;
  reviewRemarks: string;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.previousPage = sessionStorage.getItem('irf-home');
    this.suspeseAccount = new SuspenseAccount();
    this.suspenseAccountClaim = new SuspenseAccountClaimDetail();
    this.invoiceDetail = new InvoiceDetails();
    this.inputParams = this.route.queryParams.subscribe(params => {
      this.suspenseAccountId = params['id'];
      this.claimId = params['cid'];
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status == 200) {
        this.suspenseAccountClaim.DocumentID = response;
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
    this.saveBtnText = "Save";
    this.dbOps = DBOperation.insert;
    if (this.suspenseAccountId && this.suspenseAccountId > 0) {
      this.loadSuspenseAccountDetails();
    }
    if (this.claimId && this.claimId > 0) {
      this.loadClaimDetails();
      this.isClaimReadOnly = true;
    }
    this.loadInvoices();
  }

  loadClaimDetails() {
    const options = new RequestOptions({
      params: {
        id: this.claimId,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_CLAIM_ENDPOINT, options)
      .subscribe(c => {
        this.suspenseAccountClaim = c;
        this.indLoading = false;
        this.msg = "";
        this.invoiceId = this.suspenseAccountClaim.InvoiceID;
        this.loadInvoiceDetails();
      },
        error => this.msg = <any>error);
  }

  loadSuspenseAccountDetails() {
    const options = new RequestOptions({
      params: {
        id: this.suspenseAccountId,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_ENDPOINT, options)
      .subscribe(c => {
        this.suspeseAccount = c;
        this.suspenseAccountDate = Common.setDateToControl(this.suspeseAccount.DateOfCreditStr, "/");
        this.indLoading = false;
        this.msg = "";
        if (this.suspeseAccount.Status === 1) {
          this.saveBtnText = "Update";
          this.dbOps = DBOperation.update;
        } else if (this.suspeseAccount.Status > 1) {
          this.isReadOnly = true;
        }
      },
        error => this.msg = <any>error);
  }

  loadInvoices = () => {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_INVOICES_ENDPOINT, null)
      .subscribe(c => {
        this.invoiceList = c;
        this.indLoading = false;
        this.msg = "";
      },
        error => this.msg = <any>error);
  }

  onDateChanged(event: IMyDateModel) {
    this.suspeseAccount.DateOfCredit = new Date(event.date.year, event.date.month - 1, event.date.day);
    this.suspeseAccount.DateOfCreditStr = event.formatted;
  }

  ValidateFields = () => {
    if (!this.suspeseAccount.AmountCredited && this.suspeseAccount.AmountCredited < 0) {
      this.msg = "Invalid amount";
      return false;
    }

    if (Common.isFutureDate(this.suspeseAccount.DateOfCreditStr, '/')) {
      this.msg = "Credit date should not be a future date";
      return false;
    }

    this.msg = "";
    return true;
  }

  onSave = () => {
    if (!this.ValidateFields()) {
      return;
    }

    if (this.dbOps === DBOperation.insert) {
      this.service.post(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_ENDPOINT, this.suspeseAccount).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/suspense-account-summary']);
        },
        error => {
          this.msg = error;
        }
      );
    } if (this.dbOps === DBOperation.update) {
      this.service.put(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_ENDPOINT, this.suspeseAccount).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/suspense-account-summary']);
        },
        error => {
          this.msg = error;
        }
      );
    }
  }

  onInvoiceChange(item: DropDown) {
    this.invoiceId = Number(item.id);
    this.loadInvoiceDetails();
  }

  loadInvoiceDetails = () => {
    const options = new RequestOptions({
      params: {
        id: this.invoiceId,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACC_INVOICES_DETAIL_ENDPOINT, options)
      .subscribe(c => {
        this.invoiceDetail = c;
        this.suspenseAccountClaim.SuspenseAccountID = this.suspenseAccountId;
        this.suspenseAccountClaim.InvoiceID = this.invoiceDetail.InvoiceId;
        this.suspenseAccountClaim.ClientID = this.invoiceDetail.ClientId;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  validateClaim = () => {
    if (!this.suspenseAccountClaim.InvoiceID || this.suspenseAccountClaim.InvoiceID <= 0) {
      this.msg = "Please select appropriate invoice";
      return false;
    }

    if (!this.suspenseAccountClaim.ClientID || this.suspenseAccountClaim.ClientID <= 0) {
      this.msg = "Please select appropriate invoice";
      return false;
    }

    this.msg = "";
    return true;
  }

  onClaim = () => {

    if (!this.validateClaim()) {
      this.ClaimCnfm.close();
      return;
    }

    this.service.post(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_CLAIM_ENDPOINT, this.suspenseAccountClaim).subscribe(
      data => {
        this.ClaimCnfm.close();
        this.msg = data;
        this.router.navigate(['/home/suspense-account-review']);
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

  openReviewConfirm = (status: number) => {
    this.reviewStatus = status;
    if (status == 1) {
      this.reviewStatusText = "Approve";
    } else {
      this.reviewStatusText = "Reject";
    }
    this.ClaimApproveCnfm.open();
  }

  onClaimReview = () => {
    if (this.reviewStatus == 1) {
      this.suspenseAccountClaim.Status = 2;
    } else {
      this.suspenseAccountClaim.Status = 3;
    }

    this.service.post(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_CLAIM_REVIEW_ENDPOINT, this.suspenseAccountClaim).subscribe(
      data => {
        this.ClaimApproveCnfm.close();
        this.msg = data;
        this.router.navigate(['/home/suspense-account-summary']);
      },
      error => {
        this.msg = error;
      }
    );
  }
}
