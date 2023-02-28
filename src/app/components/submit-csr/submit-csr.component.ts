import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/observable/throw';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Service } from '../../Service/service';
import { RequestOptions } from '@angular/http';
import { Common } from '../../shared/common';
import * as moment from 'moment';
import { CreditNoteSummary } from '../../model/CreditNoteSummary';
import { CreditNote } from '../../model/CreditNote';
import { BalancedColumnTreeBuilder } from 'ag-grid';
import { CreditNoteDetail } from 'app/model/CreditNoteDetail';
import { ClaimSheetReport } from '../../model/ClaimSheetReport';
import { ClaimSheet } from '../../model/ClaimSheet';
import { ClaimSheetSummary } from 'app/model/ClaimSheetSummary';
import { IMyDateModel, IMyDpOptions, MyDatePicker } from 'mydatepicker';
import { ClaimSheetDetail } from 'app/model/ClaimSheetDetail';
import { DBOperation } from 'app/types/types';
import { FileUploader } from '../../../../node_modules/ng2-file-upload';
import { element } from 'protractor';
import { Input, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: "app-submit-csr",
  templateUrl: "./submit-csr.component.html",
  styleUrls: ["./submit-csr.component.css"]
})

export class SubmitCSRComponent implements OnInit {
  msg: string;
  errorMessage: string;
  indLoading: boolean;
  user: any;
  dbOps: DBOperation;
  modalBtnTitle: string;
  @ViewChild("submitClaim") submitClaim: ModalComponent;
  @ViewChild("approveClaim") approveClaim: ModalComponent;
  @ViewChild("dismissClaim") dismissClaim: ModalComponent;
  apiEndpoints = Common.GetEndPoints();
  dateCreatedOn: Object;
  claimSheets: ClaimSheetDetail;
  claimSheetRequest: ClaimSheetReport;
  claimSheet: ClaimSheet;
  claimSheetsArray = Array<ClaimSheetDetail>();
  _claimSheets: ClaimSheetSummary;
  selectedStatus: string;
  myDatePickerOptions: IMyDpOptions = { dateFormat: 'dd/mm/yyyy' };
  remarks: string;
  saveBtnText: string;
  previousPage: string;
  inputParams: any;
  requestedAmount: number;
  isReadOnly: boolean;
  necessary: boolean;
  preventTyping: boolean;
  selectedIRF: any;
  columnDefs: any;
  RequestedAmount: number = 0;
  RequestedValue: number;
  cid: number;
  IRFS: any;
  number: number;
  URL = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader(
    {
      url: this.URL,
      authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
      maxFileSize: 5 * 1024 * 1024
    });
  hasAnotherDropZoneOver: boolean;

  constructor(
    private service: Service,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.apiEndpoints = Common.GetEndPoints();
    this.previousPage = sessionStorage.getItem("irf-home");
    this.claimSheet = new ClaimSheet();
    this.claimSheets = new ClaimSheetDetail();
    this.inputParams = this.route.queryParams.subscribe(params => {
      this.cid = params['cid'];

      if (this.cid != null && this.cid > 0) {
        this.dbOps = DBOperation.update;
        this.saveBtnText = "Update";
      } else {
        this.dbOps = DBOperation.insert;
        this.saveBtnText = "Save";
      }

    });

    this.columnDefs = [
      {
        headerName: "IRF #",
        field: "IRFID",
        filter: "agNumberColumnFilter",
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      {
        headername: "Invoice Number",
        field: "InvoiceNumber",
        filter: "agTextColumnFilter",
      },
      {
        headername: "Client Name",
        field: "ClientName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Invoice Amount",
        field: "InvoiceAmountAfterTax",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Gross Profit",
        field: "GrossProfit",
        filter: "agNumberColumnFilter",
      },
      { headerName: "Sharing Type", field: "SharingType" },
      { headerName: "Sharing Value", field: "Value", filter: "agNumberColumnFilter" },
      {
        headerName: "Computed Value",
        field: "ComputedValue",
        filter: "agNumberColumnFilter",
      },
    ];

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status === 200) {
        this.claimSheets.SupportingDocumentId = response;
      }
    };
  }
  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }


  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem("currentUser"));

    try {
      let claimedrecords = JSON.parse(sessionStorage.getItem('claimSheetForCSR'));
      this.RequestedAmount = 0;
      if (claimedrecords != null && claimedrecords.length > 0) {
        this.claimSheetsArray = claimedrecords;
        let RequestedValue = 0;
        claimedrecords.forEach(element => {
          RequestedValue += Number(element.ComputedValue);
          this.RequestedValue = RequestedValue;
        });
        this.claimSheets.RequestedAmount = RequestedValue;
        this.claimSheets.NetClaimAmount = RequestedValue;
        if (!(this.cid)) {
          this.claimSheets.MiscellaneousAdjustmentAmount = Number(0);
          this.claimSheets.Advances = Number(0);
          this.claimSheets.PortalFee = Number(0);
          this.claimSheets.FinanceCost = Number(0);
          this.claimSheets.LicenseCost = Number(0);
        }
      }


    } catch (error) {
      console.warn('ERROR EXE >>>>>>>>>>', error);
    }
    if (this.cid > 0) {
      this.getCSR();
    }

    if ((this.claimSheets.Status == "ApprovedUnpaid" || this.claimSheets.Status == "Paid")) {
      this.preventTyping = false;
    }
  }

  getCSR = () => {
    const options = new RequestOptions({
      params: {
        Id: this.cid,
      }
    });
    this.indLoading = true;

    this.service.get(this.apiEndpoints.BASE_GET_PAYOUT_REQUEST_DETAILS_ENDPOINT, options)
      .subscribe(c => {
        this.claimSheets = c;
        this.RequestedValue = this.claimSheets.RequestedAmount;
        if (this.claimSheets.Status === "Paid" || this.claimSheets.Status === "ReturnedForReview" || this.claimSheets.Status === "Submitted" || this.claimSheets.Status === "Processed" || this.claimSheets.Status === "ApprovedUnpaid") {
          this.isReadOnly = true;
        }
        if (!(this.cid)) {
          this.necessary = true;
        } else {
          this.necessary = false;
        }
        this.indLoading = false;
        this.msg = "";
        const dobObj = new Date(this.claimSheets.CreatedOn);
        this.dateCreatedOn = {
          date: {
            year: dobObj.getFullYear(),
            month: dobObj.getMonth() + 1,
            day: dobObj.getDate()
          }
        }
      },
        error => this.msg = <any>error);

    if (this.user !== null && this.user !== '') {
      const userObject = this.user;
      this.user = userObject;
    }
    if (sessionStorage.getItem('clm')) {
      sessionStorage.removeItem('clm');
    }
    this.getIRFDetails();
  }

  getIRFDetails = () => {
    const options = new RequestOptions({
      params: {
        Id: this.cid,
      }
    });
    this.indLoading = true;

    this.service.get(this.apiEndpoints.BASE_GET_CSR_IRFDETAILS_ENDPOINT, options)
      .subscribe(data => {
        this.claimSheetsArray = data;
      })
  }

  downloadExcel = () => {
    let Id = this.cid;
    this.indLoading = true;
    this.service
      .downloadData(
        this.apiEndpoints.BASE_GET_CSR_DETAILS_DOWNLOAD_ENDPOINT,
        Id
      )
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName("ClaimSheetRequest Break-up Details", "xlsx");
          Common.downloadExcelFile(fileName, blob);
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
          this.indLoading = false;
        }
      );
  }

  onDateChanged(event: IMyDateModel) {
    this.claimSheets.CreatedOn = new Date(event.date.year, event.date.month - 1, event.date.day);
    this.claimSheets.CreatedOnString = event.formatted;
    if (Common.isFutureDate(event.formatted, "/")) {
      this.msg = "Payout Request Date should not be a future date";
    } else {
      this.msg = "";
    }
  }

  validateRequest = () => {
    if (Common.isFutureDate(this.claimSheets.CreatedOnString, "/")) {
      this.msg = "Payout Request Date should not be a future date";
      return false;
    }

    if (this.claimSheets.NetClaimAmount > this.claimSheets.RequestedAmount) {
      this.msg = "Payout Requested amount should not exceed the Total Claimable Amount";
      return false;
    }

    if (this.claimSheets.NetClaimAmount < 0) {
      this.msg = "The Net Claimable Amount cannot be negative";
      return false;
    }

    this.msg = "";
    return true;
  }


  openSaveModal() {
    this.claimSheets.CreatedOn = new Date(this.claimSheets.CreatedOn);
    var datePipe = new DatePipe('en-US');
    this.claimSheets.CreatedOnString = datePipe.transform(this.claimSheets.CreatedOn, 'dd/MM/yyyy');
    this.claimSheets.NetClaimAmount = this.RequestedValue - Number(this.claimSheets.MiscellaneousAdjustmentAmount + this.claimSheets.LicenseCost + this.claimSheets.Advances + this.claimSheets.FinanceCost + this.claimSheets.PortalFee);
    this.submitClaim.open();
  }

  onSave() {

    if (!this.validateRequest()) {
      return;
    }

    if (this.dbOps === DBOperation.insert) {
      this.submitPayoutRequest();
    }

    else if (this.dbOps === DBOperation.update) {
      this.updatePayoutRequest();
    }

  }

  onApprove() {
    console.log
    if (this.isBPMTeam(this.user.RoleCode)) {
      let claimSheetsArray = Array<ClaimSheetDetail>();
      this.indLoading = true;
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = this.cid;
      claimSheet.ApproverRemarks = this.claimSheets.ApproverRemarks;
      claimSheetsArray.push(claimSheet);

      this.service.put(this.apiEndpoints.BASE_GET_APPROVE_CLAIMSHEET_ENDPOINT, claimSheetsArray)
      .subscribe(
        data => {
          this.indLoading = false;
          this.msg = data;
          this.approveClaim.dismiss();
          this.router.navigate(['/home/payout-request-a']);
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
    }

    if (this.isAccountsTeam(this.user.RoleCode)) {
      let claimSheetsArray = Array<ClaimSheetDetail>();
      this.indLoading = true;
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = this.cid;
      claimSheet.ApproverRemarks = this.claimSheets.ApproverRemarks;
      claimSheetsArray.push(claimSheet);

      this.service.put(this.apiEndpoints.BASE_GET_PROCESS_CLAIMSHEET_ENDPOINT, claimSheetsArray)
      .subscribe(
        data => {
          this.indLoading = false;
          this.msg = data;
          this.approveClaim.dismiss();
          this.router.navigate(['/home/payout-request-r']);
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
    }
  }

  onDismiss() {
    if (this.isBPMTeam(this.user.RoleCode)){
      let claimSheetsArray = Array<ClaimSheetDetail>();
      this.indLoading = true;
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = this.cid;
      claimSheet.ApproverRemarks = this.claimSheets.ApproverRemarks;
      claimSheetsArray.push(claimSheet);

      this.service.put(this.apiEndpoints.BASE_GET_REJECT_CLAIMSHEET_ENDPOINT, claimSheetsArray)
      .subscribe(
        data => {
          this.indLoading = false;
          this.msg = data;
          this.dismissClaim.dismiss();
          this.router.navigate(['/home/payout-request-a']);
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
    }

    if (this.isAccountsTeam(this.user.RoleCode)){
      let claimSheetsArray = Array<ClaimSheetDetail>();
      this.indLoading = true;
      const claimsheet = new ClaimSheetDetail();
      claimsheet.Id = this.cid;
      claimsheet.ApproverRemarks = this.claimSheets.ApproverRemarks;
      claimSheetsArray.push(claimsheet);

      this.service.put(this.apiEndpoints.BASE_GET_REVOKE_CLAIMSHEET_ENDPOINT, claimSheetsArray)
      .subscribe(
        data => {
          this.indLoading = false;
          this.msg = data;
          this.dismissClaim.dismiss();
          this.router.navigate(['/home/payout-request-r']);
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
    }
  }

  submitPayoutRequest = () => {
    this.claimSheets.IRFList = JSON.stringify(this.claimSheets);
    this.claimSheets.IRFArray = this.claimSheetsArray;
    this.service.post(this.apiEndpoints.BASE_GET_SUBMIT_PAYOUT_REQUEST_ENDPOINT, this.claimSheets).subscribe(
      data => {
        this.msg = data;
      },
      error => {
        this.msg = error;
      }
    );
    this.onCancel();
  }

  updatePayoutRequest = () => {
    this.claimSheets.Id = this.cid;
    this.dateCreatedOn = this.claimSheets.CreatedOn;
    this.claimSheets.IRFList = JSON.stringify(this.claimSheetsArray);
    this.claimSheets.IRFArray = this.claimSheetsArray;

    this.service.put(this.apiEndpoints.BASE_GET_EDIT_PAYOUT_REQUEST_ENDPOINT, this.claimSheets).subscribe(
      data => {
        this.msg = data;
      },
      error => {
        this.msg = error;
      }
    );
    this.onCancel();
  }

  onCancel() {
    if (sessionStorage.getItem('claimSheetForCSR')) {
      sessionStorage.removeItem('claimSheetForCSR')
    }
    this.router.navigate([this.previousPage]);
  }

  isConsultant(roleId: number) {
    return Common.isConsultantsRole(roleId);
  }

  onApproveReject = (status: string) => {
    this.selectedStatus = status;
    if (this.selectedStatus === 'Approve'){
      this.approveClaim.open();
    }
    if (this.selectedStatus === 'Reject'){
      this.dismissClaim.open();
    }
  }

  isAccountsTeam(role: string) {
    return Common.isAccountsTeamsRole(role);
  }

  isBPMTeam(role: string) {
    return Common.isBPMTeamsRole(role);
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'IRFID' && event.value) {
      this.openIRFDetails(event.value);
    }
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/submit-csr');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  onChange(event: any, fieldName) {

    if (fieldName == 'LicenseCost') {
      let tempNumber = this.claimSheets.RequestedAmount - Number(this.claimSheets.MiscellaneousAdjustmentAmount + this.claimSheets.Advances + this.claimSheets.FinanceCost + this.claimSheets.PortalFee);
      this.claimSheets.NetClaimAmount = Number(tempNumber - event.target.value);
    }
    else if (fieldName == 'PortalFee') {
      let tempNumber = this.claimSheets.RequestedAmount - Number(this.claimSheets.MiscellaneousAdjustmentAmount + this.claimSheets.LicenseCost + this.claimSheets.Advances + this.claimSheets.FinanceCost);
      this.claimSheets.NetClaimAmount = Number(tempNumber - event.target.value);
    }
    else if (fieldName == 'Advances') {
      let tempNumber = this.claimSheets.RequestedAmount - Number(this.claimSheets.MiscellaneousAdjustmentAmount + this.claimSheets.LicenseCost + this.claimSheets.PortalFee + this.claimSheets.FinanceCost);
      this.claimSheets.NetClaimAmount = Number(tempNumber - event.target.value);
    }
    else if (fieldName == 'FinanceCost') {
      let tempNumber = this.claimSheets.RequestedAmount - Number(this.claimSheets.MiscellaneousAdjustmentAmount + this.claimSheets.LicenseCost + this.claimSheets.Advances + this.claimSheets.PortalFee);
      this.claimSheets.NetClaimAmount = Number(tempNumber - event.target.value);
    }
    else if (fieldName == 'MiscellaneousAdjustmentAmount') {
      let tempNumber = this.claimSheets.RequestedAmount - Number(this.claimSheets.PortalFee + this.claimSheets.LicenseCost + this.claimSheets.Advances + this.claimSheets.FinanceCost);
      this.claimSheets.NetClaimAmount = Number(tempNumber - event.target.value);
    }
  }

}
