import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { Common } from '../../shared/common';
import { DispatchDetail } from '../../model/DispatchDetail';
import { DropDown } from '../../model/DropDown';
import { InvoiceDetails } from '../../model/InvoiceDetails';
import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import * as moment from 'moment';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
@Component({
  selector: 'app-disapatch-history',
  templateUrl: './disapatch-history.component.html',
  styleUrls: ['./disapatch-history.component.css']
})
export class DisapatchHistoryComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  invoiceCtrl: DropDown;
  invoiceId: any;
  dispatchDetails: Array<DispatchDetail>;
  invoiceList: Array<DropDown>;
  deliveryTypes: Array<string>;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  dispatchDate: Object;
  isReadOnly: boolean;
  dbOps: DBOperation;
  btnText: string;
  fromDateObj: IMyDate;
  toDateObj: IMyDate;
  fromDateStr: string;
  toDateStr: string;
  columnDefs: any;
  gridData: any;
  gridApi: any;
  gridColumnApi: any;
  rowSelection: any;
  @ViewChild('deletemodal') deletemodal: ModalComponent;
  selectedItemId: number;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.dispatchDetails = new Array<DispatchDetail>();
    this.fromDateStr = '';
    this.toDateStr = '';
    this.selectedItemId = 0;
  }

  ngOnInit() {
    this.columnDefs = [
      { headerName: 'Delivery type', field: 'DeliveryType' },
      {
        headerName: 'Dispatch date', field: 'DispatchDate',
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
      { headerName: 'Consignment #', field: 'ConsignmentNumber' },
      { headerName: 'Invoice #', field: 'InvoiceNumber' },
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
      { headerName: 'Client', field: 'ClientName' }
    ];

    this.loadDispatchDetails();
  }

  loadDispatchDetails = () => {
    const options = new RequestOptions({
      params: {
        fromDate: this.fromDateStr,
        toDate: this.toDateStr,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_DISPATCH_ENDPOINT, options)
      .subscribe(c => {
        this.dispatchDetails = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDateStr = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDateStr = event.formatted;
  }

  getReport() {
    this.loadDispatchDetails();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  openDispatchDetails = (status: number) => {

    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/dispatch-history');
    if (status === 1) {
      if (this.selectedItemId >= 0) {
        this.router.navigate(['/home/dispatch-detail'], { queryParams: { id: this.selectedItemId } });
      }
    } else {
      this.router.navigate(['/home/dispatch-detail']);
    }

  }

  deleteDispatchDetails = () => {
    if (!this.selectedItemId || this.selectedItemId <= 0) {
      return;
    }

    this.service.delete(this.apiEndpoints.BASE_GET_DISPATCH_ENDPOINT, this.selectedItemId).subscribe(
      data => {
        this.msg = data;
        this.loadDispatchDetails();
        this.deletemodal.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  onCellClicked(event: any) {
    this.selectedItemId = event.data.Id;
  }
}
