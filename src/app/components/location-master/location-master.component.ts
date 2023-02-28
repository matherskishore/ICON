import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Location } from '../../model/location';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { Common } from 'app/shared/common';
import { Branch } from 'app/model/Branch';

@Component({
  selector: 'app-location-master',
  templateUrl: './location-master.component.html',
  styleUrls: ['./location-master.component.css']
})
export class LocaionMasterComponent implements OnInit {
  _location: Location;
  _locations: Array<Location>;
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  @ViewChild('addmodal') addmodal: ModalComponent;
  @ViewChild('deletemodal') deletemodal: ModalComponent;
  usrStatusArray: string[];
  roleForm: FormGroup;
  dbops: DBOperation;
  apiEndpoints: any;
  clientId: number;
  sub: any;
  copyAddress: boolean;
  clientName: string;
  private gridApi;
  private gridColumnApi;
  gridData: any;
  columnDefs: any;
  branches: Array<Branch>;

  constructor(private _configService: ConfigService, private _service: Service, private route: ActivatedRoute, private router: Router) {
    this._locations = new Array<Location>();
    this.apiEndpoints = Common.GetEndPoints();
    this.columnDefs = [
      { headerName: 'Code', field: 'LocationCode', checkboxSelection: true },
      { headerName: 'Location Name', field: 'LocationName' },
      { headerName: 'Invoice Centre', field: 'InvoiceCentre' },
      { headerName: 'Client SPOC Name', field: 'LocationSPOC_Name' },
      { headerName: 'Email', field: 'SPOC_Email' },
      { headerName: 'Contact #', field: 'SPOC_ContactNumber' },
      { headerName: 'Location SPOC Name', field: 'LocationSPOC_Name' },
      { headerName: 'Billing Address', field: 'BillingAddress' },
      { headerName: 'Shipping Address', field: 'ShippingAddress' },
      { headerName: 'GST #', field: 'GST_Number' },
      {
        headerName: 'Status', field: 'Status', cellRenderer: function(params) {
          return Status[params.value];
        }
      }
    ];
  }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.clientId = params['id'];
    });
    this._location = new Location();
    this.loadInvoiceCentres();
    this.loadClients();
    this.populateStatus();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: any) {
    // if (event.colDef.headerName === 'Location') {
    //   this.openLocationPage(event.data.Id);
    // }
  }

  populateStatus() {
    this.usrStatusArray = new Array<string>();
    for (const item in Status) {
      if (isNaN(Number(item))) {
        this.usrStatusArray.push(item);
      }
    }
  }

  loadClients() {
    if (this.clientId != null && this.clientId > 0) {
      const options = new RequestOptions({ params: { clientId: this.clientId } });
      this.indLoading = true;
      this._service.get(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, options)
        .subscribe(c => {
          this._locations = c;
          this.indLoading = false;
          if (this._locations.length > 0) {
            this.clientName = this._locations[0].ClientName;
          } else {
            this.clientName = '';
          }
        },
          error => this.msg = <any>error);
    }

  }

  loadInvoiceCentres() {
    this.indLoading = true;
    this._service.get(this.apiEndpoints.BASE_GETBRANCHES_ENDPOINT)
      .subscribe(c => {
        this.branches = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }


  getStatus(value: number) {
    return Status[value];
  }

  editLocation() {
    const selectedRow = this.gridApi.getSelectedRows();
    if (selectedRow.length === 0) {
      this.msg = 'Please select record to edit';
      return;
    }
    this.msg = '';

    this.copyAddress = false;
    this._location = selectedRow[0];
    this.modalTitle = 'Update Location';
    this.modalBtnTitle = 'Update';
    this.dbops = DBOperation.update;
    this.addmodal.open();
  }

  addLocation() {
    this.copyAddress = false;
    this.dbops = DBOperation.insert;
    this.modalTitle = 'Add New Location';
    this.modalBtnTitle = 'Save';
    this._location = new Location();
    this._location.Status = 1;
    this.addmodal.open();
  }

  deleteLocation() {
    const selectedRow = this.gridApi.getSelectedRows();
    if (selectedRow.length === 0) {
      this.msg = 'Please select record to delete';
      return;
    }
    this.msg = '';

    this._location = new Location();
    this._location.ID = selectedRow[0].ID;
    this.dbops = DBOperation.delete;
    this.modalTitle = 'Confirm to Delete?';
    this.modalBtnTitle = 'Delete';
    this.deletemodal.open();
  }

  hideMessages() {
    setTimeout(function() {
      this.msg = '';
    }.bind(this), 5000);
  }

  onSubmit() {
    this.msg = '';
    this._location.ClientID = this.clientId;
    switch (this.dbops) {
      case DBOperation.insert:
        this._service.post(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, this._location).subscribe(
          data => {
            this.msg = data;
            this.loadClients();
            this.addmodal.dismiss();
          },
          error => {
            this.msg = error;
          }
        );
        break;
      case DBOperation.update:
        this._service.put(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, this._location).subscribe(
          data => {
            this.msg = data;
            this.loadClients();
            this.addmodal.dismiss();
          },
          error => {
            this.msg = error;
          }
        );
        break;
      case DBOperation.delete:
        this._service.delete(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, this._location.ID).subscribe(
          data => {
            this.msg = data;
            this.loadClients();
            this.deletemodal.dismiss();
            this.hideMessages();
          },
          error => {
            this.msg = error;
            this.hideMessages();
          }
        );
        break;
    }

  }

  copyShippingAddress() {
    if (this.copyAddress) {
      this._location.ShippingAddress = this._location.BillingAddress;
    } else {
      this._location.ShippingAddress = "";
    }

  }

  updateLocationCode = () => {
    const location = this.branches.find(a => a.ID == this._location.InvoiceCentreId);
    this._location.InvoiceCentre = location ? location.Code : '';
  }
}
