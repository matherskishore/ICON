import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, CanDeactivate } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs/Rx";
import { ConfigService } from "../../Service/config.service";
import { RequestOptions } from "@angular/http";
import "rxjs/add/observable/throw";
import { Service } from "../../Service/service";
import { Status, DBOperation } from "../../types/types";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import { PaginationComponent1 } from "../pagination/pagination.component";
import { NgDataGridModel } from "angular2-datagrid";
import { Ng2TableModule } from "ng2-table/ng2-table";
import {
  NgTableComponent,
  NgTableFilteringDirective,
  NgTablePagingDirective,
  NgTableSortingDirective
} from "ng2-table/ng2-table";
import { Common } from "../../shared/common";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";
import { ProcessedInvoice } from "../../model/ProcessedInvoice";
import { forEach } from "@angular/router/src/utils/collection";
import { InvoiceProcessedDetail } from "../../model/InvoiceProcessedDetail";

@Component({
  selector: "app-import-processed-invoice",
  templateUrl: "./import-processed-invoice.component.html",
  styleUrls: ["./import-processed-invoice.component.css"]
})
export class ImportProcessedInvoiceComponent implements OnInit {
  _irfs: Array<InvoiceProcessedDetail>;
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
    dateFormat: "dd/mm/yyyy"
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

  constructor(
    private service: Service,
    private configService: ConfigService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.columnDefs = [
      {
        headerName: "IRF #",
        field: "ReferenceNumber",
        filter: "agNumberColumnFilter",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function(params) {
          return (
            '<a onclick="openIRFDetails(' +
            params.value +
            ');">' +
            params.value +
            "</a>"
          );
        }
      },
      { headerName: "Invoice #", field: "InvoiceNumber" },
      { headerName: "Invoice date", field: "InvoiceDate" },
      {
        headerName: "Invoice amount before tax",
        field: "InvoiceAmountBeforeTax"
      },
      {
        headerName: "Invoice amount after tax",
        field: "InvoiceAmountAfterTax"
      },
      { headerName: "Narration", field: "Narration" },
      { headerName: "Remarks", field: "Remarks" },
      { headerName: "Status Code", field: "StatusCode" },
      { headerName: "StatusCode Description", field: "StatusCodeDescription" }
    ];
  }

  ngOnInit() {
    this.user = JSON.parse(sessionStorage.getItem("currentUser"));
    this.fromDate = "";
    this.toDate = "";
    this.errorMessage = "";
    this._irfs = new Array<InvoiceProcessedDetail>();
    this.getResult();
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem("irf-home")) {
      sessionStorage.removeItem("irf-home");
    }
    sessionStorage.setItem("irf-home", "/home/import-invoice");
    if (id >= 0) {
      this.router.navigate(["/home/submit-irf"], { queryParams: { id: id } });
    }
  }

  onCellClicked(event: any) {
    if (event.colDef.field === "ReferenceNumber" && event.value) {
      this.openIRFDetails(event.value);
    }
  }

  getResult = () => {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_PROCESSED_ENDPOINT).subscribe(
      c => {
        this._irfs = c;
        this.indLoading = false;
        if (this._irfs.length == 0) {
          this.errorMessage = "No data found";
        } else {
          this.errorMessage = "";
        }
      },
      error => (this.msg = <any>error)
    );
  };

  getExcel = () => {
    let params = {
      fromDate: this.fromDate,
      toDate: this.toDate
    };
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
  };

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  import() {
    this.indLoading = true;
    let Ids = Array<number>();
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      this.msg = "Please select the IRF";
      return;
    }

    for (let index = 0; index < selectedRows.length; index++) {
      const id = selectedRows[index].Id;
      Ids.push(id);
    }

    this.msg = "";
    this.service
      .post(this.apiEndpoints.BASE_GET_IMPORT_IRF_ENDPOINT, Ids)
      .subscribe(
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
