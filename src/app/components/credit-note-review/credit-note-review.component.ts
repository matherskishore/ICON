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

@Component({
  selector: 'app-credit-note-review',
  templateUrl: './credit-note-review.component.html',
  styleUrls: ['./credit-note-review.component.css']
})
export class CreditNoteReviewComponent implements OnInit {
  msg: string;
  errorMessage: string;
  indLoading: boolean;
  document: DocumentRepository;
  modalTitle: string;
  fromDate: string;
  toDate: string;
  selectedCreditNote: Array<number>;
  columnDefs: any;
  modalBtnTitle: string;
  apiEndpoints: any;
  creditNoteSummary: CreditNoteSummary;
  @ViewChild('revokeCredit') revokeCredit: ModalComponent;
  @ViewChild('publishCredit') publishCredit: ModalComponent;
  pendingForApprovalcolumnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  documentId: number;
  columnDefsPublished: any;
  gridApiToBePublished: any;
  gridColumnApiToBePublished: any;
  gridApiPublished: any;
  gridColumnApiPublished: any;

  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();

    this.columnDefs = [

      {
        headername: "Invoice Number", field: "InvoiceNumber", filter: "agNumberColumnFilter", headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function(params) {
          return '<a onclick="openCreditNoteDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headername: "Credit Note ID", field: "CreditNoteId", filter: "agNumberColumnFilter" },
      { headername: "Credit Amount", field: "CreditAmount", filter: "agNumberColumnFilter" },
      { headername: "IRF Type", field: "IRFType" },
      { headername: "Invoice Amount", field: "InvoiceAmount", filter: "agNumberColumnFilter" },
      {
        headername: "Invoice Date", field: "InvoiceDate",
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        }
      },
      { headername: "Client Name", field: "ClientName" },
      {
        headername: "Credit Date", field: "CreditDate",
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        }
      }
    ],

      this.columnDefsPublished = [

        {
          headername: "Credit Note ID",
          field: "CreditNoteId",
          filter: "agNumberColumnFilter",
          headerCheckboxSelection: true,
          checkboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          cellRenderer: function (params) {
            if (params.data.DocumentId) {
              return '<a>' + params.value + '</a>';
            } else {
              return '<span>' + params.value + '</span>';
            }
          }
        },
        { headername: "Invoice Number", field: "InvoiceNumber" },
        { headername: "Credit Amount", field: "CreditAmount", filter: "agNumberColumnFilter" },
        { headername: "IRF ID", field: "IRFID" },
        { headername: "IRF Type", field: "IRFType" },
        { headername: "Invoice Amount", field: "InvoiceAmount", filter: "agNumberColumnFilter" },
        {
          headername: "Invoice Date", field: "InvoiceDate",
          cellFormatter: function (data) {
            return moment(data.value).format('DD/MM/YYYY HH:MM');
          }
        },
        { headername: "Client Name", field: "ClientName" },
        {
          headername: "Credit Date", field: "CreditDate",
          cellFormatter: function (data) {
            return moment(data.value).format('DD/MM/YYYY HH:MM');
          }
        }
      ];

    this.pendingForApprovalcolumnDefs = [
      { headerName: 'IRF #', field: 'IRFID', filter: 'agNumberColumnFilter' },
      { headerName: 'IRF Type', field: 'IRFType' },
      { headerName: 'Invoice #', field: 'InvoiceNumber', filter: 'agNumberColumnFilter' },
      { headerName: 'Invoice amount', field: 'InvoiceAmount', filter: 'agNumberColumnFilter' },
      {
        headerName: 'Invoice date', field: 'InvoiceDate',
        filter: 'agDateColumnFilter',
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY');
        },
        filterParams: {
          comparator: Common.formatDate,
          browserDatePicker: true,
          clearButton: true
        }
      },
      { headerName: 'Client', field: 'ClientName' },
      {
        headerName: 'Credit date', field: 'CreditDate',
        filter: 'agDateColumnFilter',
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY');
        },
        filterParams: {
          comparator: Common.formatDate,
          browserDatePicker: true,
          clearButton: true
        }
      },
      { headerName: 'Credit amount', field: 'CreditAmount', filter: 'agNumberColumnFilter' },
      { headerName: 'Consultant', field: 'Consultant' },
      {
        headerName: 'Submitted on', field: 'SubmittedOn',
        filter: 'agDateColumnFilter',
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        },
        filterParams: {
          comparator: Common.formatDate,
          browserDatePicker: true,
          clearButton: true
        }
      },
      {
        headerName: 'view', cellRenderer: function (params) {
          return '<li class=\'fa fa-eye\' onclick="openCreditNoteDetails(' + params.value + ');"></li>';
        }
      }
    ];
  }

  ngOnInit() {
    this.creditNoteSummary = new CreditNoteSummary();
    this.loadPendingCreditNotes();
  }


  loadPendingCreditNotes() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_CREDINOTE_REVIEW_SUMMARY_ENDPOINT)
      .subscribe(c => {
        this.creditNoteSummary = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  openCreditNoteDetails(id: string, creditNoteId: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/credit-note-review');
    if (id !== '' && creditNoteId >= 0) {
      this.router.navigate(['/home/raise-credit-note'], { queryParams: { id: id, cid: creditNoteId } });
    }
  }

  onGridReadyToBePublished(params) {
    this.gridApiToBePublished = params.api;
    this.gridColumnApiToBePublished = params.columnApi;
    this.gridApiToBePublished.sizeColumnsToFit();
  }

  onGridReadyPublished(params) {
    this.gridApiPublished = params.api;
    this.gridColumnApiPublished = params.columnApi;
    this.gridApiPublished.sizeColumnsToFit();
  }

  GetDocumentDetails(docId: number) {
    this.documentId = docId;
    const options = new RequestOptions({ params: { id: this.documentId } });
    this.service.get(this.apiEndpoints.BASE_GET_FILE_DETAIL_ENDPOINT, options)
      .subscribe(c => {
        this.document = c;
        this.downloadAttachment();
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  downloadAttachment() {
    var doc = new DocumentRepository();
    doc.DocumentId = this.documentId;

    this.indLoading = true;
    this.service
      .downloadData(
        this.apiEndpoints.BASE_GET_FILE_DOWNLOAD_ENDPOINT,
        doc
      )
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName(this.document.DocumentName, this.document.FileExtenstion);
          this.downloadFile(fileName, blob);
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
          this.indLoading = false;
        }
      );
  }

  downloadFile(fileName: string, data: any) {
    const downloadUrl = URL.createObjectURL(data);
    const blob = new Blob([data], {
      type: this.document.ContentType
    });
    FileSaver.saveAs(blob, fileName);
  }

  publishCreditNote() {

    const selectedRows = this.gridApiToBePublished.getSelectedRows();
    if (selectedRows.length === 0) {
      this.msg = 'Please select the Credit Note';
      this.publishCredit.dismiss();
      return;
    }
    this.msg = '';
    this.indLoading = true;
    let selectedIds = new Array<number>();

    selectedRows.forEach(element => {
      selectedIds.push(element.CreditNoteId);
    });

    this.service.post(this.apiEndpoints.BASE_GET_CREDINOTE_PUBLISH_ENDPOINT, selectedIds).subscribe(
      data => {
        this.msg = data;
        this.indLoading = false;
        this.loadPendingCreditNotes();
        this.publishCredit.dismiss();
        this.indLoading = false;
      },
      error => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }

  openRevokePopup() {
    const selectedItems = this.gridApiToBePublished.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Credit Note";
      return;
    }
    this.msg = "";
    this.selectedCreditNote = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedCreditNote.push(element.CreditNoteId);
    });
    this.revokeCredit.open();
  }

  resetCredit() {
    this.indLoading = true;
    this.service.post(this.apiEndpoints.BASE_GET_CREDINOTE_REVOKE_ENDPOINT, this.selectedCreditNote).subscribe(
      data => {
        this.msg = data;
        this.indLoading = false;
        this.loadPendingCreditNotes();
        this.revokeCredit.dismiss();
      },
      error => {
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

  onCellClicked(event: any) {
    if (event.colDef.headerName === 'view') {
      this.openCreditNoteDetails(event.data.InvoiceNumber, event.data.CreditNoteId);
    } else if (event.colDef.field === "InvoiceNumber" && event.value) {
      this.openCreditNoteDetails(event.data.InvoiceNumber, event.data.CreditNoteId);
    } else if (event.colDef.field === "CrNoteNumber" && event.value) {
      this.GetDocumentDetails(event.data.DocumentId);
    }
  }
}
