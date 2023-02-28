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
import { ReviewerIRFHome } from '../../model/ReviewerIRFHome';
import { ConsultantIRFStatus } from '../../model/ConsultantIRFStatus';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import * as moment from 'moment';

@Component({
  selector: 'app-irf-reviewer-home',
  templateUrl: './irf-reviewer-home.component.html',
  styleUrls: ['./irf-reviewer-home.component.css']
})
export class IrfReviewerHomeComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  irfStatus: ReviewerIRFHome;
  selectedIRFs: Array<number>;
  @ViewChild('revokeIRF') revokeIRF: ModalComponent;
  @ViewChild('publishIRF') publishIRF: ModalComponent;
  columnDefs: any;
  columnDefsToBeApproved: any;
  columnDefsToBeInvoiced: any;
  gridData: any;
  gridApiToBeApproved: any;
  gridApiToBeIntegrated: any;
  gridApiToBeInvoiced: any;
  gridColumnApiToBeApproved: any;
  gridColumnApiToBeIntegrated: any;
  gridColumnApiToBeInvoiced: any;



  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.columnDefs = [
      {
        headerName: 'IRF #', field: 'Id',
        filter: 'agNumberColumnFilter',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: function(params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headerName: 'IRF type', field: 'IRFType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Client name', field: 'ClientName' },
      { headerName: 'Clien type', field: 'ClienType' },
      { headerName: 'Invoice centre', field: 'InvoiceCentre' },
      { headerName: 'Invoice type', field: 'InvoiceType' },
      { headerName: 'Invoice amout', field: 'InvoiceAmout', filter: 'agNumberColumnFilter' },
      { headerName: 'Gross profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'GST #', field: 'ClientGSTNumber' },
      { headerName: 'Submitted by', field: 'SubmittedBy' },
      {
        headerName: 'Submitted on', field: 'SubmittedDate',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        }
      },
      {
        headerName: 'Approved on', field: 'ApprovedOn',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        },
      },
      {
        headerName: '', field: 'IsRevisedIRF',
        cellRenderer: function(data) {
          return !data.value ? '' : "<img src='assets/images/flag.png' width='20' height='20' />"
        },
      }
    ];

    this.columnDefsToBeApproved = [
      {
        headerName: 'IRF #', field: 'Id',
        filter: 'agNumberColumnFilter',
        cellRenderer: function(params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headerName: 'IRF type', field: 'IRFType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Client name', field: 'ClientName' },
      { headerName: 'Clien type', field: 'ClienType' },
      { headerName: 'Invoice centre', field: 'InvoiceCentre' },
      { headerName: 'Invoice type', field: 'InvoiceType' },
      { headerName: 'Invoice amout', field: 'InvoiceAmout', filter: 'agNumberColumnFilter' },
      { headerName: 'Gross profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'GST #', field: 'ClientGSTNumber' },
      { headerName: 'Submitted by', field: 'SubmittedBy' },
      {
        headerName: 'Submitted on', field: 'SubmittedDate',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        }
      },
      {
        headerName: 'Approved on', field: 'ApprovedOn',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        },
      },
      {
        headerName: '', field: 'IsRevisedIRF',
        cellRenderer: function(data) {
          return !data.value ? '' : "<img src='assets/images/flag.png' width='20' height='20' />"
        },
      }
    ];

    this.columnDefsToBeInvoiced = [
      {
        headerName: 'IRF #', field: 'Id',
        filter: 'agNumberColumnFilter',
        cellRenderer: function(params) {
          return '<a onclick="openIRFDetails(' + params.value + ');">' + params.value + '</a>';
        }
      },
      { headerName: 'IRF type', field: 'IRFType' },
      { headerName: 'IRF Sub-Type', field: 'IRFSubType' },
      { headerName: 'Client name', field: 'ClientName' },
      { headerName: 'Clien type', field: 'ClienType' },
      { headerName: 'Invoice centre', field: 'InvoiceCentre' },
      { headerName: 'Invoice type', field: 'InvoiceType' },
      { headerName: 'Invoice amout', field: 'InvoiceAmout', filter: 'agNumberColumnFilter' },
      { headerName: 'Gross profit', field: 'GrossProfit', filter: 'agNumberColumnFilter' },
      { headerName: 'GST #', field: 'ClientGSTNumber' },
      { headerName: 'Submitted by', field: 'SubmittedBy' },
      {
        headerName: 'Submitted on', field: 'SubmittedDate',
        cellFormatter: function(data) {
          return moment(data.value).format('DD/MM/YYYY HH:MM');
        }
      },
      {
        headerName: '', field: 'IsRevisedIRF',
        cellRenderer: function(data) {
          return !data.value ? '' : "<img src='assets/images/flag.png' width='20' height='20' />"
        },
      }
    ];
  }

  ngOnInit() {
    this.irfStatus = new ReviewerIRFHome();
    this.loadIRFStatus();
  }

  loadIRFStatus() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_IRF_REVIEWER_HOME_ENDPOINT)
      .subscribe(c => {
        this.irfStatus = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  openIRFDetails(id: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/irf-reviewer-home');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  openRevokePopup() {
    const selectedItems = this.gridApiToBeIntegrated.getSelectedRows();
    if (selectedItems.length === 0) {
      this.msg = "Please select at least one IRF";
      return;
    }
    this.msg = "";
    this.selectedIRFs = new Array<number>();
    selectedItems.forEach(element => {
      this.selectedIRFs.push(element.Id);
    });
    //this.selectedIRFs = id;
    this.revokeIRF.open();
  }

  onGridReadyToBeApproved(params) {
    this.gridApiToBeApproved = params.api;
    this.gridColumnApiToBeApproved = params.columnApi;
    this.gridApiToBeApproved.sizeColumnsToFit();
  }

  onGridReadyToBeIntegrated(params) {
    this.gridApiToBeIntegrated = params.api;
    this.gridColumnApiToBeIntegrated = params.columnApi;
    this.gridApiToBeIntegrated.sizeColumnsToFit();
  }

  onGridReadyToBeInvoiced(params) {
    this.gridApiToBeInvoiced = params.api;
    this.gridColumnApiToBeInvoiced = params.columnApi;
    this.gridApiToBeInvoiced.sizeColumnsToFit();
  }

  onCellClicked(event: any) {
    if (event.colDef.field === 'Id' && event.value) {
      this.openIRFDetails(event.value);
    }
  }

  resetIRF() {
    this.indLoading = true;
    this.service.post(this.apiEndpoints.BASE_GET_IRF_REVOKE_ENDPOINT, this.selectedIRFs).subscribe(
      data => {
        this.msg = data;
        this.indLoading = false;
        this.loadIRFStatus();
        this.revokeIRF.dismiss();
      },
      error => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }

  publish() {

    const selectedRows = this.gridApiToBeIntegrated.getSelectedRows();
    if (selectedRows.length === 0) {
      this.msg = 'Please select the IRF';
      this.publishIRF.dismiss();
      return;
    }
    this.msg = '';
    this.indLoading = true;
    let selectedIds = new Array<number>();

    selectedRows.forEach(element => {
      selectedIds.push(element.Id);
    });

    this.service.post(this.apiEndpoints.BASE_GET_PUBLISH_IRF_ENDPOINT, selectedIds).subscribe(
      data => {
        this.msg = data;
        this.indLoading = false;
        this.loadIRFStatus();
        this.publishIRF.dismiss();
      },
      error => {
        this.msg = error;
        this.indLoading = false;
      }
    );
  }
}
