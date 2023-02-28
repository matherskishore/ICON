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
import {
  NgTableComponent,
  NgTableFilteringDirective,
  NgTablePagingDirective,
  NgTableSortingDirective
} from 'ng2-table/ng2-table';
import { Common } from '../../shared/common';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { IRFDetail } from '../../model/IRFDetail';
import * as moment from 'moment';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-invoice-upload',
  templateUrl: './invoice-upload.component.html',
  styleUrls: ['./invoice-upload.component.css']
})
export class InvoiceUploadComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  columnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  apiEndpoints: any;
  @ViewChild('attachInvoice') attachInvoice: ModalComponent;
  uploadEndpointsSessiom = Common.GetEndPoints();
  URL =
    this.uploadEndpointsSessiom.BASE_URL +
    this.uploadEndpointsSessiom.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader({
    url: this.URL,
    allowedMimeType: ['application/pdf'],
    authToken:
      sessionStorage.getItem('token_type') +
      ' ' +
      sessionStorage.getItem('access_token'),
    maxFileSize: 2 * 1024 * 1024 // 2 MB
  });
  hasAnotherDropZoneOver: boolean;
  invoiceData: Array<Invoice>;
  invoiceGridData: Array<Invoice>;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };

    this.invoiceData = new Array<Invoice>();


    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      if (status == 200) {
        const data = new Invoice();
        data.FileName = item.file.name;
        data.InvoiceNumber = data.FileName.split('.')[0];
        data.DocumentId = response;
        this.invoiceData.push(data);
      }
    };

    this.uploader.onCompleteAll = () => {
      this.indLoading = true;
      this.service.post(this.apiEndpoints.BASE_GET_INVOICE_DETAILS_ENDPOINT, this.invoiceData)
        .subscribe(c => {
          this.invoiceGridData = c;
          this.indLoading = false;
        },
          error => this.msg = <any>error);
    };

    this.columnDefs = [
      {
        headerName: 'Invoice #',
        field: 'InvoiceNumber',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true

      },
      {
        headerName: 'Invoice date', field: 'InvoiceDate', filter: 'agDateColumnFilter',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY');
        }
      },
      { headerName: 'Client Name', field: 'ClientName' }
    ];
  }

  ngOnInit() { }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  clearData = () => {
    this.invoiceData = new Array<Invoice>();
    this.invoiceGridData = new Array<Invoice>();
  }

  attachToInvoice = () => {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      this.msg = 'Please select the Invoice(s)';
      this.attachInvoice.dismiss();
      return;
    }
    this.msg = '';
    this.indLoading = true;

    this.service.post(this.apiEndpoints.BASE_GET_INVOICE_ATTACHMENT_ENDPOINT, selectedRows)
      .subscribe(c => {
        this.msg = c;
        this.uploader.clearQueue();
        this.indLoading = false;
        this.attachInvoice.dismiss();
        this.clearData();
      },
        error => this.msg = <any>error);
  }
}
