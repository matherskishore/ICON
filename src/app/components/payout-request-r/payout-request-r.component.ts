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
import { IMyDateModel, MyDatePicker } from 'mydatepicker';
import { ClaimSheetDetail } from 'app/model/ClaimSheetDetail';

@Component({
  selector: "app-claim-sheet-reviewer-summary",
  templateUrl: "./payout-request-r.component.html",
  styleUrls: ["./payout-request-r.component.css"],
})
export class PayoutRequestComponent1 implements OnInit {
  msg: string;
  errorMessage: string;
  indLoading: boolean;
  _claimSheet: ClaimSheetSummary;
  _claimSheets: ClaimSheetSummary;
  claimSheet: ClaimSheetSummary;
  claimsheets: ClaimSheetDetail;
  user: any;
  document: DocumentRepository;
  modalTitle: string;
  fromDate: string;
  toDate: string;
  selectedCreditNote: Array<number>;
  columnDefs: any;
  modalBtnTitle: string;
  apiEndpoints: any;
  @ViewChild("publishClaim") publishClaim: ModalComponent;
  @ViewChild("revokeClaim") revokeClaim: ModalComponent;
  @ViewChild("confirmPay") confirmPay: ModalComponent;
  documentId: number;
  columnDefsProcess: any;
  gridApiSub: any;
  gridApiProcess: any;
  gridColumnApiProcess: any;
  gridColumnApiSub: any;
  columnDefsPaid: any;
  gridApiPaid: any;
  gridColumnApiPaid: any;
  cid: any;

  constructor(
    private service: Service,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.apiEndpoints = Common.GetEndPoints();
    this.columnDefs = [
      {
        headerName: "CSR ID",
        field: "Id",
        filter: "agNumberColumnFilter",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function(params) {
          return '<a onclick="openCSRDetails(' + params.value + ');">' + params.value + '</a>';
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
        headerName: "Advances",
        field: "Advances",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Finance Cost",
        field: "FinanceCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "License Cost",
        field: "LicenseCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Portal Fee",
        field: "PortalFee",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Miscellaneous Adjustment Amount",
        field: "MiscellaneousAdjustmentAmount",
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
        headerName: "Requested By",
        field: "RequestedBy",
        filter: "agTextColumnFilter"
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
    this.columnDefsProcess = [
      {
        headerName: "CSR ID",
        field: "Id",
        filter: "agNumberColumnFilter",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function(params) {
          return '<a onclick="openCSRDetails(' + params.value + ');">' + params.value + '</a>';
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
        headerName: "Advances",
        field: "Advances",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Finance Cost",
        field: "FinanceCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "License Cost",
        field: "LicenseCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Portal Fee",
        field: "PortalFee",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Miscellaneous Adjustment Amount",
        field: "MiscellaneousAdjustmentAmount",
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
        headerName: "Requested By",
        field: "RequestedBy",
        filter: "agTextColumnFilter"
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
          return '<a onclick="openCSRDetails(' + params.value + ');">' + params.value + '</a>';
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
        headerName: "Advances",
        field: "Advances",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Finance Cost",
        field: "FinanceCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "License Cost",
        field: "LicenseCost",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Portal Fee",
        field: "PortalFee",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Miscellaneous Adjustment Amount",
        field: "MiscellaneousAdjustmentAmount",
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
        headerName: "Requested By",
        field: "RequestedBy",
        filter: "agTextColumnFilter"
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
    this._claimSheets = new ClaimSheetSummary();
    this.getResult();
  }

  openCSRDetails(cid:string) {
    if (sessionStorage.getItem('payout-request-c')) {
      sessionStorage.removeItem('payout-request-c');
    }
    sessionStorage.setItem('irf-home', '/home/payout-request-r');
    if (cid !== '') {
      this.router.navigate(['/home/submit-csr'], { queryParams: { cid: cid }});
    }
  }

  getResult = () => {
    this.indLoading = true;
    this.service
      .get(this.apiEndpoints.BASE_GET_CLAIMSHEET_REVIEWER_SUMMARY_ENDPOINT)
      .subscribe(
        (c) => {
          this._claimSheets = c;
          this.indLoading = false;
        },
        (error) => (this.msg = <any>error)
      );
  }

  openProcessClaim() {
    const selectedItems = this.gridApiSub.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Payout Request";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.Id);
    });
    this.publishClaim.open();
  }

  pubClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApiSub.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheet.IRFRevenueSharingId = item.IRFRevenueSharingId;
      claimSheets.push(claimSheet);
    }

this.service.put(this.apiEndpoints.BASE_GET_PROCESS_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.publishClaim.dismiss();
        this.getResult();
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
  }

  getExcel = () => {
    this.indLoading = true;
    this.service.downloadData(this.apiEndpoints.BASE_GET_PROCESSED_CLAIMSHEETS_DOWNLOAD_ENDPOINT, null)
    .subscribe(
      blob => {
        const fileName = Common.GetUniqueFileName("Claim Sheet Payout Requests", "xlsx");
        Common.downloadExcelFile(fileName, blob);
        this.indLoading = false;
      },
      error => {
        this.msg = <any>error;
        this.indLoading = false;
      }
    );
  }

  openConfirmPay() {
    const selectedItems = this.gridApiProcess.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Payout Request";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.Id);
    });
    this.confirmPay.open();
  }

  confirmPaid() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApiProcess.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheet.IRFRevenueSharingId = item.IRFRevenueSharingId;
      claimSheets.push(claimSheet);
    }

this.service.put(this.apiEndpoints.BASE_GET_CLAIMSHEET_PAYOUT_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.confirmPay.dismiss();
          this.getResult();
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
  }

  openRevokeClaim() {
    const selectedItems = this.gridApiSub.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Payout Request";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.Id);
    });
    this.revokeClaim.open();
  }

  resetClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApiSub.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheet.IRFRevenueSharingId = item.IRFRevenueSharingId;
      claimSheets.push(claimSheet);
    }
    this.service.put(this.apiEndpoints.BASE_GET_REVOKE_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.revokeClaim.dismiss();
        this.getResult();
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
  }

  onGridReady1(params) {
    this.gridApiSub = params.api;
    this.gridColumnApiSub = params.columnApi;
    this.gridApiSub.sizeColumnsToFit();
  }

  onGridReady3(params) {
    this.gridApiPaid = params.api;
    this.gridColumnApiPaid = params.columnApi;
    this.gridApiPaid.sizeColumnsToFit();
  }

  onGridReady2(params) {
    this.gridApiProcess = params.api;
    this.gridColumnApiProcess = params.columnApi;
    this.gridApiProcess.sizeColumnsToFit();
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'Id' && event.value) {
      this.openCSRDetails(event.value);
    }
  }

}
