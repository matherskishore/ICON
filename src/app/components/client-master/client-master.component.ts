import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Client } from '../../model/client';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Common } from 'app/shared/common';
import { Router } from '@angular/router';
import { OnAccountDetails } from 'app/model/OnAccountDetail';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { DropDown } from 'app/model/DropDown';

@Component({
  selector: 'app-client-master',
  templateUrl: './client-master.component.html',
  styleUrls: ['./client-master.component.css']
})
export class ClientMasterComponent implements OnInit {
  _client: Client;
  _clients: Client[];
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  @ViewChild('addmodal') addmodal: ModalComponent;
  @ViewChild('deletemodal') deletemodal: ModalComponent;
  @ViewChild('onAccountModal') onAccountModal: ModalComponent;
  usrStatusArray: string[];
  roleForm: FormGroup;
  dbops: DBOperation;
  apiEndpoints: any;
  private gridApi;
  private gridColumnApi;
  gridData: any;
  columnDefs: any;
  onAccountDetail: OnAccountDetails;
  transactionDate: Object;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  users: any;
  selectedSignedUser: any;
  branches: any;
  signupDate: any;
  isUserSelectionDropdownVisible: boolean;
  signedByName: string;
  targetIndustries: any;
  saveErrorMsg: string;

  constructor(private _configService: ConfigService, private _service: Service, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.columnDefs = [
      { headerName: 'Code', field: 'ClientCode', checkboxSelection: true },
      { headerName: 'Client Name', field: 'ClientName' },
      { headerName: 'Alias Name', field: 'AliasName' },
      { headerName: 'Group Company', field: 'GroupCompany' },
      { headerName: 'Industry', field: 'IndustryName' },
      {
        headerName: 'Status', field: 'Status', cellRenderer: function (params) {
          return Status[params.value];
        }
      },
      { headerName: 'Reference #', field: 'TallyReferenceId' },
      { headerName: 'Assignment', field: 'AssignmentOneLiner' },
      { headerName: 'Transaction Date', field: 'TransactionDate' },
      { headerName: 'Collection', field: 'CollectionAmount', filter: 'agNumberColumnFilter' },
      { headerName: 'Sign-up Date', field: 'SignUpDateStr' },
      { headerName: 'Signed by', field: 'SignedByUser' },
      {
        headerName: 'Location', cellRenderer: function (params) {
          return '<i class="fa fa-eye"></i>';
        }
      }
    ];

    this.onAccountDetail = new OnAccountDetails();
  }

  ngOnInit() {
    this.loadTragetIndustries();
    this.loadClients();
    this.loadUsers();
    this.loadBranches();
    this.populateStatus();
    this._client = new Client();
  }

  onSignupDateChange(event: IMyDateModel) {
    this._client.SignUpDateStr = event.formatted;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onUserChange(item: DropDown) {
    this.signedByName = item.text;
    this._client.SignedBy = Number(item.id);
    this.isUserSelectionDropdownVisible = false;
  }

  onCellClicked(event: any) {
    if (event.colDef.headerName === 'Location') {
      this.openLocationPage(event.data.Id);
    }
  }

  allowUserToSelect = () => {
    this.isUserSelectionDropdownVisible = true;
  }

  loadBranches() {
    this.indLoading = true;
    this._service.get(this.apiEndpoints.BASE_GETBRANCHES_ENDPOINT)
      .subscribe(c => {
        this.branches = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  openLocationPage = (clientId: number) => {
    this.router.navigate(['/home/locations'], { queryParams: { id: clientId } });
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
    this.indLoading = true;
    this._service.get(this.apiEndpoints.BASE_GETCLIENT_ENDPOINT)
      .subscribe(c => {
        this._clients = c;
        this.populateOtherFields();
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  populateOtherFields = () => {
    for (let index = 0; index < this._clients.length; index++) {
      const client = this._clients[index];
      client.IndustryName = this.getTargetIndustryById(client.Industry);
      const user = this.getUserById(client.SignedBy);
      client.SignedByUser = user ? user.text : '';
    }
  }

  loadTragetIndustries() {
    this.indLoading = true;
    this._service.get(this.apiEndpoints.BASE_GETCLIENT_ENDPOINT + '/target-industry')
      .subscribe(c => {
        this.targetIndustries = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  getStatus(value: number) {
    return Status[value];
  }

  editClient(client: Client) {
    const selectedRow = this.gridApi.getSelectedRows();
    if (selectedRow.length === 0) {
      this.msg = 'Please select record to edit';
      return;
    }
    this.signupDate = null;
    this.msg = '';
    this.signedByName = '';
    this._client = selectedRow[0];
    
    if (this._client.SignUpDate !== null) {
      const dobObj = new Date(this._client.SignUpDate);
      this.signupDate = {
        date: {
          year: dobObj.getFullYear(),
          month: dobObj.getMonth() + 1,
          day: dobObj.getDate()
        }
      };
    }

    this.selectedSignedUser = this.getUserById(this._client.SignedBy);
    this.signedByName = this.selectedSignedUser ? this.selectedSignedUser.text : '';
    this.modalTitle = 'Update Client';
    this.modalBtnTitle = 'Update';
    this.dbops = DBOperation.update;
    this.addmodal.open();
  }

  getUserById = (userId: number): any => {
    if (!this.users) {
      return;
    }
    return this.users.find(a => a.id === userId);
  }

  getTargetIndustryById = (id: string): any => {
    if (!this.targetIndustries) {
      return;
    }

    const industry = this.targetIndustries.find(a => a.id == id);
    return industry ? industry.text : '';
  }

  addOnAccount(client: Client) {
    const selectedRow = this.gridApi.getSelectedRows();
    if (selectedRow.length === 0) {
      this.msg = 'Please select record to edit';
      return;
    }
    this.msg = '';
    this._client = selectedRow[0];
    this.onAccountDetail = new OnAccountDetails();
    this.transactionDate = null;
    this.onAccountDetail.ClientId = this._client.Id;
    this.onAccountModal.open();
  }

  addClient() {
    this.signupDate = null;
    this.signedByName = '';
    this.signupDate = null;
    this.isUserSelectionDropdownVisible = true;
    this.dbops = DBOperation.insert;
    this.modalTitle = 'Add New Client';
    this.modalBtnTitle = 'Save';
    this._client = new Client();
    this._client.Status = 1;
    this.addmodal.open();
  }

  loadUsers() {
    this._service.get(this.apiEndpoints.BASE_ACTIVE_USER_ENDPOINT)
      .subscribe(c => {
        this.users = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  deleteClient() {
    const selectedRow = this.gridApi.getSelectedRows();
    if (selectedRow.length === 0) {
      this.msg = 'Please select record to delete';
      return;
    }
    this.msg = '';

    this._client.Id = selectedRow[0].Id;
    this.dbops = DBOperation.delete;
    this.modalTitle = 'Confirm to Delete?';
    this.modalBtnTitle = 'Delete';
    this.deletemodal.open();
  }

  hideMessages() {
    setTimeout(function () {
      this.msg = '';
    }.bind(this), 5000);
  }

  onDateChanged(event: IMyDateModel) {
    this.onAccountDetail.TransactionDate = event.formatted;
  }

  submitOnAccountDetails = () => {
    const endpoint = 'api/client/on-account'
    this._service.post(endpoint, this.onAccountDetail).subscribe(
      data => {
        this.msg = data;
        this.loadClients();
        this.onAccountModal.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  onSubmit() {
    this.msg = '';
    if (this.dbops !== DBOperation.delete && this.signedByName === '') {
      this.saveErrorMsg = 'Please Select Signed User'
      return;
    }
    this.saveErrorMsg = '';
    switch (this.dbops) {
      case DBOperation.insert:
        this._service.post(this.apiEndpoints.BASE_GETCLIENT_ENDPOINT, this._client).subscribe(
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
        this._service.put(this.apiEndpoints.BASE_GETCLIENT_ENDPOINT, this._client).subscribe(
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
        this._service.delete(this.apiEndpoints.BASE_GETCLIENT_ENDPOINT, this._client.Id).subscribe(
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

}
