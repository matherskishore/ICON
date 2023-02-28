import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Invoice } from '../../model/Invoice';
import { Service } from '../../Service/service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgDataGridModel } from 'angular2-datagrid';
import { Common } from '../../shared/common';
import * as moment from 'moment';
import { LoggedInUser } from "../../model/loggedinuser";
import { DocumentRepository } from 'app/model/DocumentRepository';
import * as FileSaver from "file-saver";
@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrls: ['./invoice-report.component.css']
})
export class InvoiceReportComponent implements OnInit {
  msg: string;
  fromDate: string;
  toDate: string;
  indLoading: boolean;
  reportType: string;
  isManager: boolean;
  isResultFound: boolean;
  user: string;
  loggedInUser: any;
  selectedValue: number;
  suspendRemarks: string;
  suspendHeading: string;
  iRFNumber: number;
  _invoice: Invoice;
  _invoices: NgDataGridModel<Invoice>;
  apiEndpoints = Common.GetEndPoints();
  invoiceNumber: string;
  userName: string;
  dillDownParams: any;
  columnDefs: any;
  footercolumnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  rowSelection: any;
  _invoiceData: Array<Invoice>;
  selectedIRF: number;
  totalInvoices: number;
  totalCollection: number;
  totalOtherDeductions: number;
  totalOutstanding: number;
  totalGrossProfit: number;
  trasactionDate: string;
  trasactionRemarks: string;
  collectionAmount: number;
  footerData: any;
  topOptions = { alignedGrids: [] };
  bottomOptions = { alignedGrids: [] };
  @ViewChild('topGrid') topGrid;
  @ViewChild('bottomGrid') bottomGrid;
  document: DocumentRepository;
  documentName: string;
  documentId: number;
  @ViewChild('onAccountDetailModal') onAccountDetailModal: ModalComponent;
  @Input() clientid: string;
  @Input() clientreport: boolean;
  title: string;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.clientid || Number(changes.clientid) <= 0) {
      return;
    }

    this._invoiceData = null;
    // this.footerData = null;
    this.loadResult();
  }

  ngOnInit() {
    this.title = this.clientreport === true ? 'Latest Invoice(s)' : 'Invoices';

    this.columnDefs = [
      {
        headerName: 'IRF #', field: 'IRFID', filter: 'agNumberColumnFilter',
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headerName: 'IRF Type', field: 'IRFType' },
      { headerName: 'Gross Profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
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
      { headerName: 'IRF Type' },
      { headerName: 'Gross Profit', field: 'GrossProfit' },
      { headerName: 'Invoice #' },
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
    this._invoices = new NgDataGridModel<Invoice>([]);
    const userObj = new LoggedInUser();
    this.loggedInUser = userObj.getLoggedUser();
    this.isResultFound = false;
    this.topOptions.alignedGrids.push(this.bottomOptions);
    this.bottomOptions.alignedGrids.push(this.topOptions);

    if (!this.loggedInUser.IsManager && this.loggedInUser.SystemRole == null) {
      this.reportType = "Self";
    }
    this.loadSavedReport();
  }

  onCellClicked(event: any) {


    this.selectedIRF = event.data.IRFID;
    if (event.colDef.field === 'IRFID' && event.value) {
      this.openIRFDetails(event.value);
    } else if (event.colDef.field === 'InvoiceNumber' && event.value && event.data.DocumentId) {
      this.GetDocumentDetails(event.data.DocumentId);
    } else if (event.colDef.field === 'ClientName' && event.data.TransactionDate && event.data.TransactionDate !== '' && !this.clientreport) {
      this.trasactionDate = event.data.TransactionDate;
      this.trasactionRemarks = event.data.OnAccountRemarks;
      this.collectionAmount = event.data.OnAccountCollection;
      this.onAccountDetailModal.open();
    }
  }

  calculateTotals = (onFilter: boolean) => {
    let invoiceTotal = 0;
    let collectionTotal = 0;
    let otherDeductionTotal = 0;
    let outstandingTotal = 0;
    let grossProfit = 0;

    if (onFilter) {
      this.gridApi.forEachNodeAfterFilter(function (rowNode, index) {
        invoiceTotal = invoiceTotal + rowNode.data.InvoiceAmountAfterTax;
        collectionTotal = collectionTotal + rowNode.data.Collection;
        otherDeductionTotal = otherDeductionTotal + rowNode.data.OtherDeductions;
        outstandingTotal = outstandingTotal + rowNode.data.Outstanding;
        grossProfit = grossProfit + rowNode.data.GrossProfit;
      });
    } else {
      for (const data of this._invoiceData) {
        invoiceTotal = invoiceTotal + data.InvoiceAmountAfterTax;
        collectionTotal = collectionTotal + data.Collection;
        otherDeductionTotal = otherDeductionTotal + data.OtherDeductions;
        outstandingTotal = outstandingTotal + data.Outstanding;
        grossProfit = grossProfit + data.GrossProfit;
      }
    }

    this.totalInvoices = Common.ConvertToDecimal(invoiceTotal);
    this.totalCollection = Common.ConvertToDecimal(collectionTotal);
    this.totalOtherDeductions = Common.ConvertToDecimal(otherDeductionTotal);
    this.totalOutstanding = Common.ConvertToDecimal(outstandingTotal);
    this.totalGrossProfit = Common.ConvertToDecimal(grossProfit);


    this.footerData = [
      {
        IRFID: 'Total',
        InvoiceNumber: '',
        IRFType: '',
        GrossProfit: this.totalGrossProfit,
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

  loadSavedReport() {
    const reportParams = JSON.parse(sessionStorage.getItem("invoice-Report-Params"));

    if (this.clientreport) {
      this.loadResult();
    }
    else if (reportParams) {
      this.fromDate = reportParams.fromDate;
      this.toDate = reportParams.toDate;
      if (reportParams.reportType) {
        this.reportType = reportParams.reportType;
      }
      if (reportParams.reportingUserId) {
        this.user = reportParams.reportingUserId;
      }
      this.loadResult();
    }
  }

  loadResult = () => {
    this.dillDownParams = null;
    sessionStorage.removeItem("invoiceDrillDownParams");
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_INVOICE_REPORT_ENDPOINT, options)
      .subscribe(c => {
        this._invoiceData = c;
        this.indLoading = false;
        this.setReportParameters();
        if (this._invoiceData == null || this._invoiceData.length == 0) {
          this.msg = "No invoices found";
        } else {
          this.msg = "";
          this.calculateTotals(false);
        }
      },
        error => this.msg = <any>error);
  }

  getInput = () => {
    if (this.reportType === 'Self') {
      this.user = '';
    }
    const options = new RequestOptions({
      params: {
        fromDate: this.fromDate,
        toDate: this.toDate,
        reportType: this.reportType,
        reportingUser: this.user,
        clientId: this.clientid
      }
    });

    return options;
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }

    if (this.clientreport) {
      sessionStorage.setItem('irf-home', '/home/client-search');
    } else {
      sessionStorage.setItem('irf-home', '/home/invoice-report');
    }

    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  setReportParameters() {
    const scoreCardReportParameters = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      reportType: this.reportType,
      reportingUserId: this.user,
      reportingUserName: this.userName
    };

    sessionStorage.setItem("invoice-Report-Params", JSON.stringify(scoreCardReportParameters));
  }

  getExcel = () => {
    let params = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      reportType: this.reportType,
      reportingUser: this.user
    }
    this.indLoading = true;

    this.service.downloadData(this.apiEndpoints.BASE_GET_INVOICE_REPORT_DOWNLOAD_ENDPOINT, params)
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName("Invoice Report", "xlsx");
          Common.downloadExcelFile(fileName, blob);
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
          this.indLoading = false;
        }
      );
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
