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
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

@Component({
  selector: 'app-disapatch-entry',
  templateUrl: './disapatch-entry.component.html',
  styleUrls: ['./disapatch-entry.component.css']
})
export class DisapatchEntryComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  dispatchDetail: DispatchDetail;
  invoiceCtrl: DropDown;
  invoiceId: any;
  invoiceDetail: InvoiceDetails;
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
  dispatchId: number;
  inputParams: any;
  previousPage: string;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.previousPage = sessionStorage.getItem('irf-home');
    this.apiEndpoints = Common.GetEndPoints();
    this.dbOps = DBOperation.insert;
    this.btnText = "Save";
    this.dispatchDetail = new DispatchDetail();
    this.invoiceDetail = new InvoiceDetails();
    this.inputParams = this.route.queryParams.subscribe(params => {
      this.dispatchId = params['id'];
    });
    if (this.dispatchId && this.dispatchId > 0) {
      this.btnText = "Update";
      this.dbOps = DBOperation.update;
    }
  }

  ngOnInit() {
    this.loadDeliveryTpes();
    this.loadInvoices();
    if (this.dbOps === DBOperation.update) {
      this.loadDispatchDetails();
    }
  }

  loadDispatchDetails = () => {
    const options = new RequestOptions({
      params: {
        id: this.dispatchId,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_DISPATCH_ENDPOINT, options)
      .subscribe(c => {
        this.dispatchDetail = c;
        this.invoiceId = this.dispatchDetail.InvoiceID;
        this.dispatchDate = Common.setDateToControl(this.dispatchDetail.DispatchDateStr, "/");
        this.loadInvoiceDetails();
        this.indLoading = false;
        this.msg = "";
      },
        error => this.msg = <any>error);
  }

  loadDeliveryTpes = () => {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_DISPATCH_DELIVERY_ENDPOINT, null)
      .subscribe(c => {
        this.deliveryTypes = c;
        this.indLoading = false;
        this.msg = "";
      },
        error => this.msg = <any>error);
  }

  onInvoiceChange(item: DropDown) {
    this.invoiceId = Number(item.id);
    this.loadInvoiceDetails();
  }

  loadInvoiceDetails = () => {
    const options = new RequestOptions({
      params: {
        id: this.invoiceId,
      }
    });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACC_INVOICES_DETAIL_ENDPOINT, options)
      .subscribe(c => {
        this.invoiceDetail = c;
        this.dispatchDetail.InvoiceID = this.invoiceDetail.InvoiceId;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  loadInvoices = () => {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_INVOICES_ENDPOINT, null)
      .subscribe(c => {
        this.invoiceList = c;
        this.indLoading = false;
        this.msg = "";
      },
        error => this.msg = <any>error);
  }

  onDateChanged(event: IMyDateModel) {
    this.dispatchDetail.DispatchDate = new Date(event.date.year, event.date.month - 1, event.date.day);
    this.dispatchDetail.DispatchDateStr = event.formatted;
  }

  validate = () => {
    if (!this.invoiceDetail.InvoiceId || this.invoiceDetail.InvoiceId <= 0) {
      this.msg = "Please select invoice";
      return false;
    }

    this.msg = "";
    return true;
  }

  onSave = () => {
    if (!this.validate()) {
      return;
    }

    if (this.dbOps === DBOperation.insert) {
      this.service.post(this.apiEndpoints.BASE_GET_DISPATCH_ENDPOINT, this.dispatchDetail).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/dispatch-history']);
        },
        error => {
          this.msg = error;
        }
      );
    } if (this.dbOps === DBOperation.update) {
      this.service.put(this.apiEndpoints.BASE_GET_DISPATCH_ENDPOINT, this.dispatchDetail).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/dispatch-history']);
        },
        error => {
          this.msg = error;
        }
      );
    }
  }
}
