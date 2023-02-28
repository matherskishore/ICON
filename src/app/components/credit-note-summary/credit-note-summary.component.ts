import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/throw';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { Common } from '../../shared/common';
import { ConsultantIRFHome } from '../../model/ConsultantIRFHome';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { CreditNoteSummary } from '../../model/CreditNoteSummary';
import { CreditNote } from '../../model/CreditNote';
import * as moment from "moment";
import { DocumentRepository } from 'app/model/DocumentRepository';
import * as FileSaver from "file-saver";
import { Component, OnInit, ViewChild } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-credit-note-summary',
  templateUrl: './credit-note-summary.component.html',
  styleUrls: ['./credit-note-summary.component.css']
})
export class CreditNoteSummaryComponent implements OnInit {

  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  columnDefs: any;
  columnDefsPublished: any;
  columnDefsSubmitted: any;
  creditNoteSummary: CreditNoteSummary;
  documentId: number;
  creditNotes: any;
  @ViewChild('creditNoteCnfm') creditNoteCnfm: ModalComponent;
  @ViewChild('creditNoteSubmitCnfm') creditNoteSubmitCnfm: ModalComponent;
  document: DocumentRepository;
  gridApiToBePublished: any;
  gridColumnApiToBePublished: any;
  gridApiPublished: any;
  gridColumnApiPublished: any;
  gridApiToBeSubmitted: any;
  gridColumnApiToBeSubmitted: any;

  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.columnDefs = [

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
    ],

      this.columnDefsSubmitted = [


        {
          headername: "Invoice Number", field: "InvoiceNumber", filter: "agNumberColumnFilter", headerCheckboxSelection: true,
          checkboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true
        },
        { headername: "IRF Number", field: "IRFID", filter: "agNumberColumnFilter" },
        { headername: "IRF Type", field: "IRFType" },
        { headername: "Invoice Amount", field: "InvoiceAmount", filter: "agNumberColumnFilter" },
        {
          headername: "Invoice Date", field: "InvoiceDate",
          cellFormatter: function (data) {
            return moment(data.value).format('DD/MM/YYYY HH:MM');
          }
        },
        { headername: "Client Name", field: "ClientName" },
        { headername: "Credit Amount", field: "CreditAmount", filter: "agNumberColumnFilter" },
        {
          headername: "Credit Date", field: "CreditDate",
          cellFormatter: function (data) {
            return moment(data.value).format('DD/MM/YYYY HH:MM');
          }
        },
        { headername: "Status", field: "Status" }
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
  }

  ngOnInit() {
    this.creditNoteSummary = new CreditNoteSummary();
    this.loadCreditNoteSummary();
  }

  loadCreditNoteSummary() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_CREDINOTE_SUMMARY_ENDPOINT)
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
    sessionStorage.setItem('irf-home', '/home/credit-note-summary');
    if (id !== '' && creditNoteId >= 0) {
      this.router.navigate(['/home/raise-credit-note'], { queryParams: { id: id, cid: creditNoteId } });
    }
  }

  onGridReadyToBePublished(params) {
    this.gridApiToBePublished = params.api;
    this.gridColumnApiToBePublished = params.columnApi;
    this.gridApiToBePublished.sizeColumnsToFit();
  }

  onGridReadyToBeSubmitted(params) {
    this.gridApiToBeSubmitted = params.api;
    this.gridColumnApiToBeSubmitted = params.columnApi;
    this.gridApiToBeSubmitted.sizeColumnsToFit();
  }

  onGridReadyPublished(params) {
    this.gridApiPublished = params.api;
    this.gridColumnApiPublished = params.columnApi;
    this.gridApiPublished.sizeColumnsToFit();
  }

  onCellClicked(event: any) {
    if (event.colDef.field === "InvoiceNumber" && event.value) {
      this.openCreditNoteDetails(event.value, event.value);
    } else if (event.colDef.field === "CrNoteNumber" && event.value && event.data.DocumentId) {
      this.GetDocumentDetails(event.data.DocumentId);
    }
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

  openWithdrawConfirmation = () => {
    const selectedItems = this.gridApiToBeSubmitted.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Credit Note";
      return;
    }
    else if (selectedItems.length > 0) {
      this.msg = "";
      this.creditNoteCnfm.open();
    }
  }

  withdrawCreditNote = () => {
    let creditNotes = Array<CreditNote>();
    this.indLoading = true;
    for (const item of this.gridApiToBeSubmitted.getSelectedRows()) {
      const creditNote = new CreditNote();
      creditNote.Id = item.CreditNoteId;
      creditNote.InvoiceNumber = item.InvoiceNumber;
      creditNotes.push(creditNote);
    }
    this.service.put(this.apiEndpoints.BASE_GET_CREDINOTE_WITHDRAW_ENDPOINT, creditNotes).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.loadCreditNoteSummary();
        this.creditNoteCnfm.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  openSubmitConfirm = () => {
    const selectedItems = this.gridApiToBeSubmitted.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one Credit Note";
      return;
    }
    else if (selectedItems.length > 0) {
      this.msg = "";
      this.creditNoteSubmitCnfm.open();
    }
  }

  SubmitCreditNote = () => {
    let creditNotes = Array<CreditNote>();
    this.indLoading = true;
    for (const item of this.gridApiToBeSubmitted.getSelectedRows()) {
      const creditNote = new CreditNote();
      creditNote.Id = item.CreditNoteId;
      creditNote.InvoiceNumber = item.InvoiceNumber;
      creditNotes.push(creditNote);
    }

this.service.put(this.apiEndpoints.BASE_GET_CREDINOTE_SUBMIT_ENDPOINT, creditNotes).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.loadCreditNoteSummary();
        this.creditNoteSubmitCnfm.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }
}
