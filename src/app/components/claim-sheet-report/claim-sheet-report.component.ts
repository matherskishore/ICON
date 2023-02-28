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
import { ClaimSheetReport } from '../../model/ClaimSheetReport';


@Component({
  selector: 'app-claim-sheet-report',
  templateUrl: './claim-sheet-report.component.html',
  styleUrls: ['./claim-sheet-report.component.css']
})
export class ClaimSheetReportComponent implements OnInit {
  _claimSheet: ClaimSheetReport;
  _claimSheets: Array<ClaimSheetReport>;
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
  totalGrossProfit: number;
  totalValue: number;
  totalComputedValue: number;

  footercolumnDefs: any;
  footerData: any;
  topOptions = { alignedGrids: [] };
  bottomOptions = { alignedGrids: [] };
  @ViewChild('topGrid') topGrid;
  @ViewChild('bottomGrid') bottomGrid;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.columnDefs = [
      {
        headerName: 'IRF #', field: 'IRFID', filter: 'agNumberColumnFilter',
        cellRenderer: function (params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headerName: 'IRF Type', field: 'IRFType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Invoice #', field: 'InvoiceNumber' },
      { headerName: 'Client', field: 'ClientName' },
      { headerName: 'Business Unit', field: 'BusinessUnit', filter: 'agTextColumnFilter' },
      { headerName: 'Client Type', field: 'ClientType' },
      { headerName: 'Gross Profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'Entity Type', field: 'EntityType' },
      { headerName: 'Entity', field: 'EntityName' },
      { headerName: 'Consultant', field: 'ConsultantName' },
      { headerName: 'Sharing Type', field: 'SharingType' },
      { headerName: 'Value', field: 'Value', filter: 'agNumberColumnFilter' },
      { headerName: 'Credit Note Amount', field: 'CreditNoteAmount' },
      { headerName: 'Computed Value', field: 'ComputedValue', filter: 'agNumberColumnFilter' },
    ];

    this.footercolumnDefs = [
      {
        headerName: 'IRF #', field: 'IRFID'
      },
      { headerName: 'IRF Type', field: 'IRFType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Client', field: 'ClientName' },
      { headerName: 'Client Type', field: 'ClientType' },
      { headerName: 'Gross Profit', field: 'GrossProfit' },
      { headerName: 'Entity Type', field: 'EntityType' },
      { headerName: 'Entity', field: 'EntityName' },
      { headerName: 'Consultant', field: 'ConsultantName' },
      { headerName: 'Sharing Type', field: 'SharingType' },
      { headerName: 'Value', field: 'Value' },
      { headerName: 'Computed Value', field: 'ComputedValue' },
    ];
    this.topOptions.alignedGrids.push(this.bottomOptions);
    this.bottomOptions.alignedGrids.push(this.topOptions);

  }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
    this.fromDate = '';
    this.toDate = '';
    this.errorMessage = '';
    this._claimSheets = new Array<ClaimSheetReport>();
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
    sessionStorage.setItem('irf-home', '/home/claim-sheet');
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
    const reportParams = JSON.parse(sessionStorage.getItem("claim-sheet-Report-Params"));
    if (reportParams) {
      this.fromDate = reportParams.fromDate;
      this.toDate = reportParams.toDate;
      this.getResult();
    }
  }


  getResult = () => {
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_GET_CLAIMSHEET_ENDPOINT, options)
      .subscribe(c => {
        this._claimSheets = c;
        this.indLoading = false;
        this.setReportParameters();
        if (this._claimSheets.length == 0) {
          this.errorMessage = "No data found";
        } else {
          this.errorMessage = "";
          this.calculateTotals(false);
        }
      },
        error => this.msg = <any>error);
  }


  setReportParameters() {
    const reportParams = {
      fromDate: this.fromDate,
      toDate: this.toDate
    };
    sessionStorage.setItem("claim-sheet-Report-Params", JSON.stringify(reportParams));
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

  calculateTotals = (onFilter: boolean) => {

    let gpTotal = 0;
    let valueTotal = 0;
    let computedValueTotal = 0;

    if (onFilter) {
      this.gridApi.forEachNodeAfterFilter(function (rowNode, index) {
        gpTotal = gpTotal + rowNode.data.GrossProfit;
        valueTotal = valueTotal + rowNode.data.Value;
        computedValueTotal = computedValueTotal + rowNode.data.ComputedValue;
      });
    } else {
      for (const data of this._claimSheets) {
        gpTotal = gpTotal + data.GrossProfit;
        valueTotal = valueTotal + data.Value;
        computedValueTotal = computedValueTotal + data.ComputedValue;
      }
    }

    this.totalGrossProfit = Common.ConvertToDecimal(gpTotal);
    this.totalValue = Common.ConvertToDecimal(valueTotal);
    this.totalComputedValue = Common.ConvertToDecimal(computedValueTotal);

    this.footerData = [
      {
        IRFID: 'Total',
        IRFType: '',
        ClientName: '',
        ClientType: '',
        GrossProfit: this.totalGrossProfit,
        EntityType: '',
        Consultant: '',
        SharingType: '',
        Value: this.totalValue,
        ComputedValue: this.totalComputedValue
      }
    ];
    this.gridApi.sizeColumnsToFit();
  }

  onFilterChange = (event: any) => {
    this.calculateTotals(true);
  }
}



