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
  selector: "app-claim-sheet-approver-summary",
  templateUrl: "./payout-request-a.component.html",
  styleUrls: ["./payout-request-a.component.css"],
})
export class PayoutRequestComponent2 implements OnInit {
  msg: string;
  errorMessage: string;
  indLoading: boolean;
  _claimSheet: ClaimSheetSummary;
  _claimSheets: ClaimSheetSummary;
  claimSheet: ClaimSheetSummary;
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
  @ViewChild("rejectClaim") rejectClaim: ModalComponent;
  documentId: number;
  gridApi: any;
  claimSheets2 = Array<ClaimSheetReport>();
  gridColumnApi: any;

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
    this.user = JSON.parse(sessionStorage.getItem("currentUser"));
    this._claimSheets = new ClaimSheetSummary();
    this.getResult();
  }

  getResult = () => {
    this.indLoading = true;
    this.service
      .get(this.apiEndpoints.BASE_GET_CLAIMSHEET_APPROVER_SUMMARY_ENDPOINT)
      .subscribe(
        (c) => {
          this._claimSheets = c;
          this.indLoading = false;
        },
        error => this.msg = <any>error
      );
  };

  openApproveClaim() {
    const selectedItems = this.gridApi.getSelectedRows();
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

  approveClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApi.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheets.push(claimSheet);
    }

this.service.put(this.apiEndpoints.BASE_GET_APPROVE_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
          this.getResult();
          this.publishClaim.dismiss();
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
  }

  openRejectClaim() {
    const selectedItems = this.gridApi.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Payout Request";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.Id);
    });
    this.rejectClaim.open();
  }

  rejClaim() {
    let claimSheets = Array<ClaimSheetDetail>();
    this.indLoading = true;
    for (const item of this.gridApi.getSelectedRows()) {
      const claimSheet = new ClaimSheetDetail();
      claimSheet.Id = item.Id;
      claimSheets.push(claimSheet);
    }
    this.service.put(this.apiEndpoints.BASE_GET_REJECT_CLAIMSHEET_ENDPOINT, claimSheets).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
          this.getResult();
          this.rejectClaim.dismiss();
        },
        (error) => {
          this.msg = error;
          this.indLoading = false;
        }
      );
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  openCSRDetails(cid:string) {
    if (sessionStorage.getItem('payout-request-c')) {
      sessionStorage.removeItem('payout-request-c');
    }
    sessionStorage.setItem('irf-home', '/home/payout-request-a');
    if (cid !== '') {
      this.router.navigate(['/home/submit-csr'], { queryParams: { cid: cid }});
    }
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'Id' && event.value) {
      this.openCSRDetails(event.value);
    }
  }

}
