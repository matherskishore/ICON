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
import { CreditNoteProcessedDetail } from "../../model/CreditNoteProcessedDetail";

@Component({
  selector: "app-import-processed-credit-note",
  templateUrl: "./import-processed-credit-note.component.html",
  styleUrls: ["./import-processed-credit-note.component.css"]
})
export class ImportProcessedCreditNoteComponent implements OnInit {
  iRFS: Array<CreditNoteProcessedDetail>;
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
        headerName: "CN ID", field: "ReferenceNumber",
        filter: "agNumberColumnFilter",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true
      },
      { headerName: "Invoice #", field: "OriginalInvoiceId" },
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
    this.iRFS = new Array<CreditNoteProcessedDetail>();
    this.getResult();
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
  }

  getResult = () => {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_PROCESSED_CN_ENDPOINT).subscribe(
      c => {
        this.iRFS = c;
        this.indLoading = false;
        if (this.iRFS.length == 0) {
          this.errorMessage = "No data found";
        } else {
          this.errorMessage = "";
        }
      },
      error => (this.msg = <any>error)
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
      this.msg = "Please select the Credit Note";
      return;
    }

    for (let index = 0; index < selectedRows.length; index++) {
      const id = selectedRows[index].ReferenceNumber;
      Ids.push(id);
    }

    this.msg = "";
    this.service
      .post(this.apiEndpoints.BASE_GET_IMPORT_CN_ENDPOINT, Ids)
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
