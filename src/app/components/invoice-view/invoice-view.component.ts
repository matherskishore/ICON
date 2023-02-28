import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Invoice } from '../../model/Invoice';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { PaginationComponent1 } from '../pagination/pagination.component';
import { NgDataGridModel } from 'angular2-datagrid';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { Common } from '../../shared/common';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { IRFDetail } from '../../model/IRFDetail';
import * as moment from 'moment';
import { DocumentRepository } from 'app/model/DocumentRepository';
import * as FileSaver from "file-saver";

@Component({
  selector: 'app-invoice-view',
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.css']
})
export class InvoiceViewComponent implements OnInit {
  _invoice: Invoice;
  _invoiceData: Array<Invoice>;
  _invoices: NgDataGridModel<Invoice>;
  uploadTypes: Array<string>;
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  usrStatusArray: string[];
  roleForm: FormGroup;
  dbops: DBOperation;
  apiEndpoints = Common.GetEndPoints();
  selectedUploadType: string;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  fromDateCtrl: any;
  toDateCtrl: any;
  fromDate: string;
  toDate: string;
  iRFNumber: number;
  invoiceNumber: string;
  errorMessage: string;
  @ViewChild('suspenIRFmodal') suspenIRFmodal: ModalComponent;
  @ViewChild('onAccountDetailModal') onAccountDetailModal: ModalComponent;
  selectedIRF: number;
  suspendRemarks: string;
  user: any;
  suspendHeading: string;
  columnDefs: any;
  footercolumnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  rowSelection: any;
  selectedInvoice: string;
  totalInvoices: number;
  totalCollection: number;
  totalOtherDeductions: number;
  totalOutstanding: number;

  footerData: any;
  topOptions = { alignedGrids: [] };
  bottomOptions = { alignedGrids: [] };
  @ViewChild('topGrid') topGrid;
  @ViewChild('bottomGrid') bottomGrid;
  document: DocumentRepository;
  documentName: string;
  documentId: number;
  trasactionDate: string;
  trasactionRemarks: string;
  collectionAmount: number;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.totalInvoices = 0;
  }

  ngOnInit() {
    this.columnDefs = [
      {
        headerName: 'IRF #', field: 'IRFID', filter: 'agNumberColumnFilter',
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      {
        headerName: 'Invoice #', field: 'InvoiceNumber',
        cellRenderer: function (params) {
          if (params.data.DocumentId) {
            return '<a>' + params.value + '</a>';
          } else {
            return '<span>' + params.value + '</span>';
          }
        }
      },
      { headerName: 'IRF Type', field: 'IRFType' },
      {
        headerName: 'Invoice date',
        field: 'InvoiceDate',
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
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Invoice Centre', field: 'InvoiceCentre' },
      { headerName: 'Invoice amount', field: 'InvoiceAmountAfterTax', filter: 'agNumberColumnFilter' },
      { headerName: 'Collection', field: 'Collection', filter: 'agNumberColumnFilter' },
      { headerName: 'Other deduction', field: 'OtherDeductions', filter: 'agNumberColumnFilter' },
      { headerName: 'Outstanding', field: 'Outstanding', filter: 'agNumberColumnFilter' },
      { headerName: 'Narration', field: 'InvoiceNarration' },
      {
        headerName: 'Client', field: 'ClientName',
        cellRenderer: function (params) {
          if (params.data.TransactionDate && params.data.TransactionDate !== ''
            && params.data.OnAccountCollection && params.data.OnAccountCollection > 0) {
            return "<span><a><i class='fa fa-rupee'></i></a>&nbsp" + params.value + "</span>";
          } else {
            return "<span>" + params.value + "</span>";
          }
        },
      },
      { headerName: 'Client Type', field: 'ClientType' },
      { headerName: 'Consultant', field: 'ConsultantName' },
      {
        headerName: 'Published On', field: 'LastUpdatedOn',
        filter: 'agDateColumnFilter',
        cellFormatter: function (data) {
          return moment(data.value).format('DD/MM/YYYY');
        },
        filterParams: {
          comparator: Common.formatDate,
          browserDatePicker: true,
          clearButton: true
        }
      }
    ];

    this.footercolumnDefs = [
      { headerName: 'IRF #', field: 'IRFID' },
      { headerName: 'Invoice #' },
      { headerName: 'IRF Type' },
      { headerName: 'Invoice date' },
      { headerName: 'Invoice Centre', field: 'InvoiceCentre' },
      { headerName: 'Invoice amount', field: 'InvoiceAmountAfterTax' },
      { headerName: 'Collection', field: 'Collection' },
      { headerName: 'Other deduction', field: 'OtherDeductions' },
      { headerName: 'Outstanding', field: 'Outstanding' },
      { headerName: 'Narration' },
      { headerName: 'Client' },
      { headerName: 'Client Type' },
      { headerName: 'Consultant' },
      { headerName: 'Published On' }
    ];

    this.rowSelection = 'single';
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
    this.fromDate = '';
    this.toDate = '';
    this.invoiceNumber = '';
    this.errorMessage = '';
    this._invoices = new NgDataGridModel<Invoice>([]);
    this.topOptions.alignedGrids.push(this.bottomOptions);
    this.bottomOptions.alignedGrids.push(this.topOptions);


  }

  calculateTotals = (onFilter: boolean) => {
    let invoiceTotal = 0;
    let collectionTotal = 0;
    let otherDeductionTotal = 0;
    let outstandingTotal = 0;

    if (onFilter) {
      this.gridApi.forEachNodeAfterFilter(function (rowNode, index) {
        invoiceTotal = invoiceTotal + rowNode.data.InvoiceAmountAfterTax;
        collectionTotal = collectionTotal + rowNode.data.Collection;
        otherDeductionTotal = otherDeductionTotal + rowNode.data.OtherDeductions;
        outstandingTotal = outstandingTotal + rowNode.data.Outstanding;
      });
    } else {
      for (const data of this._invoiceData) {
        invoiceTotal = invoiceTotal + data.InvoiceAmountAfterTax;
        collectionTotal = collectionTotal + data.Collection;
        otherDeductionTotal = otherDeductionTotal + data.OtherDeductions;
        outstandingTotal = outstandingTotal + data.Outstanding;
      }
    }

    this.totalInvoices = Common.ConvertToDecimal(invoiceTotal);
    this.totalCollection = Common.ConvertToDecimal(collectionTotal);
    this.totalOtherDeductions = Common.ConvertToDecimal(otherDeductionTotal);
    this.totalOutstanding = Common.ConvertToDecimal(outstandingTotal);

    this.footerData = [
      {
        IRFID: 'Total',
        InvoiceNumber: '',
        IRFType: '',
        InvoiceDate: '',
        InvoiceAmountAfterTax: this.totalInvoices,
        Collection: this.totalCollection,
        OtherDeductions: this.totalOtherDeductions,
        Outstanding: this.totalOutstanding,
        InvoiceNarration: '',
        ClientName: '',
        ConsultantName: '',
        LastUpdatedOn: null
      }
    ];
    this.gridApi.sizeColumnsToFit();
  }

  getInvoices() {
    this.selectedIRF = null;
    this.selectedInvoice = '';
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_GET_INVOICES_ENDPOINT, options)
      .subscribe(c => {
        this._invoiceData = c;
        this.indLoading = false;
        if (this._invoiceData.length == 0) {
          this.errorMessage = "No invoices found";
        } else {
          this.errorMessage = "";
          this.calculateTotals(false);
        }
      },
        error => {
          this.indLoading = false;
          this.msg = <any>error
        });
  }

  onCellClicked(event: any) {
    this.selectedIRF = event.data.IRFID;
    this.selectedInvoice = event.data.InvoiceNumber;
    if (event.colDef.field === 'IRFID' && event.value) {
      this.openIRFDetails(event.value);
    } else if (event.colDef.field === 'InvoiceNumber' && event.value && event.data.DocumentId) {
      this.GetDocumentDetails(event.data.DocumentId);
    } else if (event.colDef.field === 'ClientName' && event.data.TransactionDate && event.data.TransactionDate !== '') {
      this.trasactionDate = event.data.TransactionDate;
      this.trasactionRemarks = event.data.OnAccountRemarks;
      this.collectionAmount = event.data.OnAccountCollection;
      this.onAccountDetailModal.open();
    }
  }
  onGridReadyFooter(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterChange = (event: any) => {
    this.calculateTotals(true);
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/invoice-view');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
    this.invoiceNumber = '';
    this.iRFNumber = null;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
    this.invoiceNumber = '';
    this.iRFNumber = null;
  }

  getInput = () => {
    this.fromDate = this.fromDate == null ? '' : this.fromDate;
    this.toDate = this.toDate == null ? '' : this.toDate;
    this.invoiceNumber = this.invoiceNumber == null ? '' : this.invoiceNumber;
    this.iRFNumber = this.iRFNumber == null ? null : this.iRFNumber;
    const options = new RequestOptions({
      params: {
        fromDate: this.fromDate,
        toDate: this.toDate,
        invoiceNumber: this.invoiceNumber,
        irfNumber: this.iRFNumber
      }
    });

    return options;
  }

  getResult = () => {
    this.getInvoices();
  }

  getExcel = () => {
    this.fromDate = this.fromDate == null ? '' : this.fromDate;
    this.toDate = this.toDate == null ? '' : this.toDate;
    this.invoiceNumber = this.invoiceNumber == null ? '' : this.invoiceNumber;
    this.iRFNumber = this.iRFNumber == null ? null : this.iRFNumber;

    let params = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      invoiceNumber: this.invoiceNumber,
      irfNumber: this.iRFNumber
    }
    this.indLoading = true;

    this.service
      .downloadData(
        this.apiEndpoints.BASE_GET_GET_INVOICES_DOWNLOAD_ENDPOINT,
        params
      )
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName("Invoice Details", "xlsx");
          Common.downloadExcelFile(fileName, blob);
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
          this.indLoading = false;
        }
      );
  }

  openSuspendModal = (id: number, index: number) => {
    this.suspendRemarks = '';
    this.suspendHeading = "Suspend IRF - #" + this.selectedIRF.toString();
    this.suspenIRFmodal.open();
  }

  suspend = () => {
    let iRFDetail = new IRFDetail();
    iRFDetail.Id = this.selectedIRF;
    iRFDetail.ApproverRemarks = this.suspendRemarks;
    this.service.put(this.apiEndpoints.BASE_GET_IRF_SUSPEND_ENDPOINT, iRFDetail).subscribe(
      data => {
        this.msg = data;
        this.suspenIRFmodal.dismiss();
        this.getResult();
      },
      error => {
        this.msg = error;
      }
    );
  }

  isAccountsTeam = () => {
    return Common.isAccountsTeamsRole(this.user.RoleCode);
  }

  isConsultantTeam = () => {
    return Common.isConsultantsRole(this.user.RoleId);
  }


  reviseIRF() {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/invoice-view');
    if (this.selectedIRF >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: this.selectedIRF, action: 'revise' } });
    }
  }

  openRaiseCreditNote() {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/invoice-view');
    if (this.selectedInvoice !== '') {
      this.router.navigate(['/home/raise-credit-note'], { queryParams: { id: this.selectedInvoice } });
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

}
