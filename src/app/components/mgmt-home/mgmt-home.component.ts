import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
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
import { LoggedInUser } from "../../model/loggedinuser";
import { DashboardData, InvoiceData, EnititySharing } from "../../model/DashboardData";
import { BaseChartDirective } from "ng2-charts/ng2-charts";
import { NgxLocalizedNumbersService } from 'ngx-localized-numbers';

@Component({
  selector: 'app-mgmt-home',
  templateUrl: './mgmt-home.component.html',
  styleUrls: ['./mgmt-home.component.css']
})
export class MgmtHomeComponent implements OnInit {
  msg: string;
  apiEndpoints = Common.GetEndPoints();
  dashboardData: DashboardData;
  fromDate: string;
  toDate: string;
  indLoading: boolean;
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
  heading: string;
  public doughnutChartLabels: string[];
  public doughnutChartData: number[];
  public doughnutChartType: string = 'doughnut';
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  fromDateCtrl: any;
  toDateCtrl: any;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router, private localizedNumbersService: NgxLocalizedNumbersService) {
    this.fromDate = '';
    this.toDate = '';
    this.dashboardData = new DashboardData();
    this.dashboardData.InvoiceData = new InvoiceData();
    this.dashboardData.EntitySharing = new Array<EnititySharing>();
    this.heading = 'Invoice data for the current month';
    this.loadResult();
  }

  ngOnInit() {
    this.localizedNumbersService.setLocale("en_GB");
  }


  loadResult = () => {
    if (this.fromDate !== '' && this.toDate !== '') {
      this.heading = 'Invoice data from ' + this.fromDate + ' to ' + this.toDate;
    }
    this.dashboardData.EntitySharing = null;
    var options = this.getInput();
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_MGMT_DASHBOARD_ENDPOINT, options)
      .subscribe(c => {
        this.dashboardData = c;
        this.setRevenuSharingData();
        this.indLoading = false;
        this.msg = "";
      },
        error => this.msg = <any>error);
  }

  setRevenuSharingData = () => {
    const revenueSharingChartLabels = new Array<string>();
    const revenueSharingChartData = new Array<number>();

    for (let _i = 0; _i < this.dashboardData.EntitySharing.length; _i++) {
      revenueSharingChartLabels.push(this.dashboardData.EntitySharing[_i].EntityType);
      revenueSharingChartData.push(this.dashboardData.EntitySharing[_i].ComputedValue);
    }
    this.doughnutChartLabels = revenueSharingChartLabels;
    this.doughnutChartData = revenueSharingChartData;
  }

  getInput = () => {

    const options = new RequestOptions({
      params: {
        fromDate: this.fromDate,
        toDate: this.toDate
      }
    });

    return options;
  }

  public chartClicked(e: any): void {
    //console.log(e);
  }

  public chartHovered(e: any): void {
    //console.log(e);
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
  }
}
