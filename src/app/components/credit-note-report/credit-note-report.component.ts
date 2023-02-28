import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RequestOptions } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditNoteReport } from 'app/model/creditnote-report';
import { CreditNoteSummary } from 'app/model/CreditNoteSummary';
import { DocumentRepository } from 'app/model/DocumentRepository';
import { LoggedInUser } from 'app/model/loggedinuser';
import { ConfigService } from 'app/Service/config.service';
import { Service } from 'app/Service/service';
import { Common } from 'app/shared/common';
import * as moment from 'moment';
import * as FileSaver from "file-saver";

@Component({
  selector: 'app-credit-note-report',
  templateUrl: './credit-note-report.component.html',
  styleUrls: ['./credit-note-report.component.css']
})
export class CreditNoteReportComponent implements OnInit {

  msg: string;
  fromDate: string;
  toDate: string;
  indLoading: boolean;
  reportType: string;
  isManager: boolean;
  isResultFound: boolean;
  user: string;
  loggedInUser: any;
  iRFNumber: number;
  apiEndpoints = Common.GetEndPoints();
  invoiceNumber: string;
  userName: string;
  dillDownParams: any;
  columnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  rowSelection: any;
  _creditNoteData: Array<CreditNoteReport>;
  selectedIRF: number;
  document: DocumentRepository;
  documentName: string;
  documentId: number;
  invoiceDocumentId: number;
  userSession: any;
  creditNoteNumber: string;
  isAccountsTeamRole: boolean;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    const usr = sessionStorage.getItem('currentUser');
    if (usr !== null && usr !== '') {
      const usrObj = JSON.parse(usr);
      this.userSession = usrObj;
      this.isAccountsTeamRole = this.isAccountsTeam(this.userSession.RoleCode);
    }

    this.columnDefs = [
      { headerName: 'Member Name', field: 'MemberName' },
      { headerName: 'Reporting Manager', field: 'ReportingManager' },
      {
        headerName: 'IRF #', field: 'IrfId', filter: 'agNumberColumnFilter',
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      {
        headername: "Credit Note Number",
        field: "CreditNoteNumber",
        filter: "agTextColumnFilter",
        cellRenderer: function (params) {
          if (params.data.InvoiceDocumentId !== null) {
            return '<a>' + params.value + '</a>';
          } else {
            return '<span>' + params.value + '</span>';
          }
        }
      },
      { headerName: 'IRF Type', field: 'IrfType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Entity Type', field: 'EntityType' },
      { headerName: 'Entity Id', field: 'EntityId', filter: 'agNumberColumnFilter' },
      { headerName: 'Entity Name', field: 'EntityName' },
      { headerName: 'Sharing Type', field: 'SharingType' },
      { headerName: 'Revenue Shared With', field: 'RevenueSharedWith' },
      { headerName: 'Value', field: 'Value' },
      { headerName: 'Client', field: 'ClientName' },
      { headerName: 'Invoice #', field: 'InvoiceNumber' },
      {
        headerName: 'Invoice Date', field: 'InvoiceDate',
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
      { headerName: 'Invoice Amount Before Tax', field: 'InvoiceAmountBeforeTax', filter: 'agNumberColumnFilter' },
      {
        headerName: 'Credit Note Raised On', field: 'CreditNoteRaisedOn',
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
      {
        headerName: 'Credit Note Approved On', field: 'CreditNoteApprovedOn',
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
      { headerName: 'CreditNote Amount', field: 'CreditNoteAmount', filter: 'agNumberColumnFilter' },
      { headerName: 'Actual Gross Profit', field: 'ActualGrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'CreditNote Gross Profit', field: 'CreditNoteGrossProfit', filter: 'agNumberColumnFilter' }
    ];

    const userObj = new LoggedInUser();
    this.loggedInUser = userObj.getLoggedUser();
    if (!this.loggedInUser.IsManager && this.loggedInUser.SystemRole == null) {
      this.reportType = "Self";
    }

    this.loadSavedReport();
  }

  loadResult = () => {
    this.dillDownParams = null;
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_CREDITNOTE_REPORT_ENDPOINT, options)
      .subscribe(c => {
        this._creditNoteData = c;
        this.indLoading = false;
        this.setReportParameters();
        if (this._creditNoteData == null || this._creditNoteData.length == 0) {
          this.msg = "No CreditNote found";
        } else {
          this.msg = '';
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
        reportingUser: this.user
      }
    });

    return options;
  }

  onCellClicked(event: any) {


    this.selectedIRF = event.data.IRFID;
    if (event.colDef.field === 'IrfId' && event.value) {
      this.openIRFDetails(event.value);
    } else if (event.colDef.field === "CreditNoteNumber" && event.value && event.data.InvoiceDocumentId){
      this.GetDocumentDetails(event.data.InvoiceDocumentId);
    }
  }

  GetDocumentDetails(docId: number){
    this.invoiceDocumentId = docId;
    const options = new RequestOptions({ params: { id: this.invoiceDocumentId } });
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
    doc.DocumentId = this.invoiceDocumentId;

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

  isAccountsTeam(role: string) {
    return Common.isAccountsTeamsRole(role) || Common.isAccountsHeadRole(role);
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }

    sessionStorage.setItem('irf-home', '/home/credit-note-report');

    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  loadSavedReport() {
    const reportParams = JSON.parse(sessionStorage.getItem("Credit-Note-Report-Params"));
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

  setReportParameters() {
    const scoreCardReportParameters = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      reportType: this.reportType,
      reportingUserId: this.user,
      reportingUserName: this.userName
    };

    sessionStorage.setItem("Credit-Note-Report-Params", JSON.stringify(scoreCardReportParameters));
  }

  getExcel = () => {
    let params = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      reportType: this.reportType,
      reportingUser: this.user
    }
    this.indLoading = true;

    this.service.downloadData(this.apiEndpoints.BASE_GET_CREDITNOTE_REPORT_DOWNLOAD_ENDPOINT, params)
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName("CreditNote Report", "xlsx");
          Common.downloadExcelFile(fileName, blob);
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
          this.indLoading = false;
        }
      );
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

}
