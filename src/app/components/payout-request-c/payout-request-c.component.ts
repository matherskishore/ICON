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
import { DocumentRepository } from 'app/model/DocumentRepository';
import * as FileSaver from "file-saver";
import { CreditNoteDetail } from 'app/model/CreditNoteDetail';
import { element } from 'protractor';
import { ClaimSheetReport } from '../../model/ClaimSheetReport';
import { ClaimSheet } from '../../model/ClaimSheet';
import { ClaimSheetSummary } from 'app/model/ClaimSheetSummary';
import { IMyDateModel, IMyDpOptions, MyDatePicker } from 'mydatepicker';
import { enumHelper } from 'app/directives/enumHelper';
import { ClaimSheetStatus } from 'app/model/ClaimSheetStatus';
import { MyDatePickerModule } from 'mydatepicker';
import { ClaimSheetDetail } from 'app/model/ClaimSheetDetail';
import { DBOperation } from 'app/types/types';

@Component({
  selector: "app-claim-sheet-summary",
  templateUrl: "./payout-request-c.component.html",
  styleUrls: ["./payout-request-c.component.css"]
})


export class PayoutRequestComponent implements OnInit {
  msg: string;
  errorMessage: string;
  indLoading: boolean;
  _claimSheet: ClaimSheetDetail;
  _claimSheets: ClaimSheetSummary;
  claimSheet: ClaimSheetSummary;
  claimSheetRequest: ClaimSheetReport;
  user: any;
  toDateCtrl: any;
  fromDateCtrl: any;
  document: DocumentRepository;
  modalTitle: string;
  fromDate: string;
  toDate: string;
  selectedCreditNote: Array<number>;
  columnDefs: any;
  columnDefsPaid: any;
  columnDefsNew: any;
  modalBtnTitle: string;
  apiEndpoints: any;
  id: number;
  cid: any;
  @ViewChild("withdrawClaim") withdrawClaim: ModalComponent;
  @ViewChild("submitClaim") submitClaim: ModalComponent;
  @ViewChild("createClaim") createClaim: ModalComponent;
  documentId: number;
  columnDefsProcess: any;
  gridApiSub: any;
  gridApiPaid: any;
  gridApiProcess: any;
  gridColumnApiProcess: any;
  gridColumnApiSub: any;
  gridColumnApiPaid: any;
  claimSheets: Array<ClaimSheetReport>;
  gridApiNew: any;
  gridColumnApiNew: any;
  myDatePickerOptions: IMyDpOptions = { dateFormat: 'dd/mm/yyyy' };
  selectedIRF: any;
  claimSheets2 = Array<ClaimSheetReport>();
  dbOps: any;
  dateCreatedOn: { date: { year: string; month: string; day: string; }; };
  isReadOnly: boolean;
  constructor(
    private service: Service,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.apiEndpoints = Common.GetEndPoints();

    this.columnDefs = [
      {
        headerName: "IRF #",
        field: "IRFID",
        filter: "agNumberColumnFilter",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      {
        headername: "Invoice Number",
        field: "InvoiceNumber",
        filter: "agTextColumnFilter",
      },
      { headername: "Gross Profit", field: "GrossProfit" },
      { headerName: "Sharing Type", field: "SharingType" },
      { headerName: "Value", field: "Value", filter: "agNumberColumnFilter" },
      {
        headername: "Computed Value",
        field: "ComputedValue",
        filter: "agNumberColumnFilter",
      },
      { headername: "Invoice Date", field: "InvoiceDate" },
      {
        headerName: "Invoice Amount",
        field: "InvoiceAmountAfterTax",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Credit Note Amount",
        field: "CreditNoteAmount",
        filter: "agNumberColumnFilter",
      },
      { headerName: "IRF Type", field: "IRFType" },
      { headerName: "IRF Sub-Type", field: "IRFSubType" },
      { headerName: "Client", field: "ClientName" },
      { headerName: "Consultant", field: "ConsultantName" },
    ],
      this.columnDefsProcess = [
        {
          headerName: "CSR ID",
          field: "Id",
          filter: "agNumberColumnFilter",
          headerCheckboxSelection: true,
          checkboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          cellRenderer: function(params) {
            return '<a onclick="openCSR(' + params.value + ');">' + params.value + '</a>';
          }
        },
        {
          headerName: "Requested Amount",
          field: "RequestedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Net Claimable Amount",
          field: "NetClaimAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Approved Amount",
          field: "ApprovedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Created On",
          field: "CreatedOn",
        },
        {
          headerName: "Status",
          field: "Status",
          filter: "agTextColumnFilter",
        },
        {
          headerName: "Requester Remarks",
          field: "RequesterRemarks"
        },
        {
          headerName: "Reviewer Remarks",
          field: "ApproverRemarks"
        }
      ],
      this.columnDefsPaid = [
        {
          headerName: "CSR ID",
          field: "Id",
          filter: "agNumberColumnFilter",
          cellRenderer: function(params) {
            return '<a onclick="openCSR(' + params.value + ');">' + params.value + '</a>';
          }
        },
        {
          headerName: "Requested Amount",
          field: "RequestedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Net Claimable Amount",
          field: "NetClaimAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Approved Amount",
          field: "ApprovedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Created On",
          field: "CreatedOn",
        },
        {
          headerName: "Status",
          field: "Status",
          filter: "agTextColumnFilter",
        },
        {
          headerName: "Requester Remarks",
          field: "RequesterRemarks"
        },
        {
          headerName: "Reviewer Remarks",
          field: "ApproverRemarks"
        }
      ],
      this.columnDefsNew = [
        {
          headerName: "CSR ID",
          field: "Id",
          filter: "agNumberColumnFilter",
          headerCheckboxSelection: true,
          checkboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          cellRenderer: function(params) {
            return '<a onclick="openCSR(' + params.value + ');">' + params.value + '</a>';
          }
        },
        {
          headerName: "Requested Amount",
          field: "RequestedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Net Claimable Amount",
          field: "NetClaimAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Approved Amount",
          field: "ApprovedAmount",
          filter: "agNumberColumnFilter",
        },
        {
          headerName: "Created On",
          field: "CreatedOn",
        },
        {
          headerName: "Status",
          field: "Status",
          filter: "agTextColumnFilter",
        },
        {
          headerName: "Requester Remarks",
          field: "RequesterRemarks"
        },
        {
          headerName: "Reviewer Remarks",
          field: "ApproverRemarks"
        }
      ];
  }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem("currentUser"));
    this.fromDate = "";
    this.toDate = "";
    this.errorMessage = "";
    this._claimSheets = new ClaimSheetSummary();
    this.getClaimSheetSummary();
  }

  loadSavedReport() {
    const reportParams = JSON.parse(
      sessionStorage.getItem("claim-sheet-Report-Params")
    );
    if (reportParams) {
      this.fromDate = reportParams.fromDate;
      this.toDate = reportParams.toDate;
      this.getResult();
    }
    this._claimSheets = new ClaimSheetSummary();
  }

  getClaimSheetSummary = () => {
    this.indLoading = true;
    this.service
      .get(this.apiEndpoints.BASE_GET_CLAIMSHEET_SUMMARY_ENDPOINT)
      .subscribe(
        (c) => {
          this._claimSheets = c;
          this.indLoading = false;
        },
        (error) => (this.msg = <any>error)
      );
  }

  getResult = () => {
    this.selectedIRF = 0;
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_GET_CLAIMSHEET_FOR_PAYOUTS_ENDPOINT, options)
      .subscribe(c => {
        this.claimSheets = c;
        this.indLoading = false;
        this.setReportParameters();
        this.getClaimSheetSummary();
        if (this.claimSheets.length == 0) {
          this.errorMessage = "No Claim Sheets for the given dates";
        } else {
          this.errorMessage = "";
        };
      },
        error => this.msg = <any>error);
  }

  getInput = () => {
    this.fromDate = this.fromDate == null ? "" : this.fromDate;
    this.toDate = this.toDate == null ? "" : this.toDate;
    const options = new RequestOptions({
      params: {
        fromDate: this.fromDate,
        toDate: this.toDate,
      },
    });

    return options;
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/payout-request-c');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'IRFID' && event.value) {
      this.openIRFDetails(event.value);
    }
    else if (event.colDef.field === 'Id' && event.value) {
      this.openCSR(event.data.Id);
    }
  }

  openCSR = (cid:number) => {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/payout-request-c');
    if (cid > 0) {
      this.router.navigate(['/home/submit-csr'], { queryParams: {cid: cid} });
    }
  }

  setReportParameters() {
    const reportParams = {
      fromDate: this.fromDate,
      toDate: this.toDate,
    };
    sessionStorage.setItem(
      "claim-sheet-Report-Params",
      JSON.stringify(reportParams)
    );
  }

  openCSRModal = () => {
    const selectedItems = this.gridApiSub.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one claimsheet to request a Payout";
      return;
    }
    else if (selectedItems.length > 0) {
      this.msg = "";
      this.createClaim.open();
    }
  }

  createPayoutRequest() {
    this.claimSheets2 = [];
    this.indLoading = true;
    for (const item of this.gridApiSub.getSelectedRows()) {
      const claimSheet = new ClaimSheetReport();
      claimSheet.ComputedValue = item.ComputedValue;
      this.claimSheets2.push(item);
    }

    this.indLoading = false;
    this.createClaim.dismiss();
    sessionStorage.removeItem('irf-home');
    sessionStorage.setItem('irf-home', '/home/payout-request-c');
    sessionStorage.removeItem('claimSheetForCSR');
    sessionStorage.setItem('claimSheetForCSR', JSON.stringify(this.claimSheets2));
    this.router.navigate(['/home/submit-csr']);
  }

  openSubmitConfirm = () => {
    const selectedItems = this.gridApiNew.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Payout Request";
      return;
    }
    else if (selectedItems.length > 0) {
      this.msg = "";
      this.submitClaim.open();
    }
  }

  subClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApiNew.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheet.IRFRevenueSharingId = item.IRFRevenueSharingId;
      claimSheets.push(claimSheet);
    }

    this.service.put(this.apiEndpoints.BASE_GET_SUBMIT_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.submitClaim.dismiss();
        this.getClaimSheetSummary();
      },
      (error) => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }

  openWithdrawClaim() {
    const selectedItems = this.gridApiProcess.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select a Claim that is Submitted";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.Id);
    });
    this.withdrawClaim.open();
  }

  wdClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApiProcess.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheet.IRFRevenueSharingId = item.IRFRevenueSharingId;
      claimSheets.push(claimSheet);
    }
    this.service.put(this.apiEndpoints.BASE_GET_WITHDRAW_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.withdrawClaim.dismiss();
        this.getClaimSheetSummary();
      },
      (error) => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
  }

  onGridReadySub(params) {
    this.gridApiSub = params.api;
    this.gridColumnApiSub = params.columnApi;
    this.gridApiSub.sizeColumnsToFit();
  }

  onGridReadyNew(params) {
    this.gridApiNew = params.api;
    this.gridColumnApiNew = params.columnApi;
    this.gridApiNew.sizeColumnsToFit();
  }

  onGridReadyPaid(params) {
    this.gridApiPaid = params.api;
    this.gridColumnApiPaid = params.columnApi;
    this.gridApiPaid.sizeColumnsToFit();
  }

  onGridReadyProcess(params) {
    this.gridApiProcess = params.api;
    this.gridColumnApiProcess = params.columnApi;
    this.gridApiProcess.sizeColumnsToFit();
  }

  openWithdrawConfirmation = () => {
    const selectedItems = this.gridApiProcess.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Claim";
      return;
    }
    else if (selectedItems.length > 0) {
      this.msg = "";
      this.withdrawClaim.open();
    }
  }

  getExcel1 = () => {
    this.indLoading = true;
    this.service.downloadData(this.apiEndpoints.BASE_GET_SUBMITTED_CLAIMSHEETS_DOWNLOAD_ENDPOINT, null)
    .subscribe(
      blob => {
        const fileName = Common.GetUniqueFileName("Submitted Claim Sheet Payout Requests", "xlsx");
        Common.downloadExcelFile(fileName, blob);
        this.indLoading = false;
      },
      error => {
        this.msg = <any>error;
        this.indLoading = false;
      }
    );
  }

  getExcel2 = () => {
    this.indLoading = true;
    this.service.downloadData(this.apiEndpoints.BASE_GET_APPROVED_CLAIMSHEETS_DOWNLOAD_ENDPOINT, null)
    .subscribe(
      blob => {
        const fileName = Common.GetUniqueFileName("Approved and/or Paid Claim Sheet Payout Requests", "xlsx");
        Common.downloadExcelFile(fileName, blob);
        this.indLoading = false;
      },
      error => {
        this.msg = <any>error;
        this.indLoading = false;
      }
    );
  }

}
