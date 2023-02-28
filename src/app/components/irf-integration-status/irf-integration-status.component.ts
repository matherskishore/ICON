import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
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
import { IRFIntegrationStatus } from '../../model/IRFIntegrationStatus';

@Component({
  selector: 'app-irf-integration-status',
  templateUrl: './irf-integration-status.component.html',
  styleUrls: ['./irf-integration-status.component.css']
})
export class IrfIntegrationStatusComponent implements OnInit {

  _irfs: Array<IRFIntegrationStatus>;
  uploadTypes: Array<string>;
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  usrStatusArray: string[];
  roleForm: FormGroup;
  dbops: DBOperation;
  apiEndpoints = Common.GetEndPoints();;
  selectedUploadType: string;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  fromDateCtrl: any;
  toDateCtrl: any;
  fromDate: string;
  toDate: string;
  errorMessage: string;
  selectedIndex: number;
  user: any;
  columnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.columnDefs = [
      {
        headerName: 'IRF #', field: 'IRFID',
        filter: 'agNumberColumnFilter',
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }

      },
      { headerName: 'IRF Type', field: 'IRFType' },
      { headerName: 'Invoice amount', field: 'InvoiceAmount', filter: 'agNumberColumnFilter' },
      { headerName: 'Gross Profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'Client Type', field: 'ClientType' },
      { headerName: 'Client', field: 'ClientName' },
      { headerName: 'Status', field: 'Status' },
      { headerName: 'Remarks', field: 'Remarks' }
    ];

  }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
    this.fromDate = '';
    this.toDate = '';
    this.errorMessage = '';
    this._irfs = new Array<IRFIntegrationStatus>();
    this.loadSavedReport();
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
  }


  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/irf-invoice-status');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'IRFID' && event.value) {
      this.openIRFDetails(event.value);
    }
  }

  getInput = () => {
    this.fromDate = this.fromDate == null ? '' : this.fromDate;
    this.toDate = this.toDate == null ? '' : this.toDate;
    const options = new RequestOptions({
      params: {
        fromDate: this.fromDate,
        toDate: this.toDate
      }
    });

    return options;
  }

  loadSavedReport() {
    const reportParams = JSON.parse(sessionStorage.getItem("irf-status-Report-Params"));
    if (reportParams) {
      this.fromDate = reportParams.fromDate;
      this.toDate = reportParams.toDate;
      this.getResult();
    }
  }


  getResult = () => {
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_IRF_INT_STATUS_ENDPOINT, options)
      .subscribe(c => {
        this._irfs = c;
        this.indLoading = false;
        this.setReportParameters();
        if (this._irfs.length == 0) {
          this.errorMessage = "No data found";
        } else {
          this.errorMessage = "";
        }
      },
        error => this.msg = <any>error);
  }


  setReportParameters() {
    const reportParams = {
      fromDate: this.fromDate,
      toDate: this.toDate
    };
    sessionStorage.setItem("irf-status-Report-Params", JSON.stringify(reportParams));
  }

  getExcel = () => {

    let params = {
      fromDate: this.fromDate,
      toDate: this.toDate
    }
    this.indLoading = true;

    this.service
      .downloadData(
        this.apiEndpoints.BASE_GET_GET_CLAIMSHEET_DOWNALOD_ENDPOINT,
        params
      )
      .subscribe(
        blob => {
          const fileName = Common.GetUniqueFileName("Claim Details", "xlsx");
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

  publish() {
    this.indLoading = true;
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      this.msg = 'Please select the IRF';
      return;
    }
    this.msg = '';
    this.service.post(this.apiEndpoints.BASE_GET_PUBLISH_IRF_ENDPOINT, selectedRows).subscribe(
      data => {
        this.msg = data;
        this.getResult();
        this.indLoading = false;
      },
      error => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }
}
