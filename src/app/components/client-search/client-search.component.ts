import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Jsonp } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from 'app/Service/config.service';
import { Service } from 'app/Service/service';
import { Common } from 'app/shared/common';
import { Status } from 'app/types/types';
import { IMyDateModel, IMyDpOptions } from 'mydatepicker';

@Component({
  selector: 'app-client-search',
  templateUrl: './client-search.component.html',
  styleUrls: ['./client-search.component.css']
})
export class ClientSearchComponent implements OnInit {

  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  from
  fromDateCtrl: any;
  toDateCtrl: any;
  apiEndpoints = Common.GetEndPoints();
  msg: string;
  indLoading: boolean;
  results: any;
  fromDateText: string;
  toDateText: string;
  searchText: string;
  private gridApi;
  private gridColumnApi;
  gridData: any;
  columnDefs: any;
  showInvoices: boolean = false;
  selectedClientId: string;
  showPopup: boolean;

  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.showPopup = false;
    this.searchText = '';
    this.fromDateText = '';
    this.toDateText = '';

    this.columnDefs = [
      {
        headerName: 'Client Name', field: 'ClientName', cellRenderer: function (params) {
          return '<a>' + params.value + '</a>';
        }
      },
      {
        headerName: 'Alias Name', field: 'AliasName'
      },
      { headerName: 'Group Company', field: 'GroupCompany' },
      {
        headerName: 'Rating', field: 'Rating', cellRenderer: function (params) {
          switch (params.value) {
            case 1:
              return "<img src='assets/images/star_rating/1-star.png' width='auto' height='20' />"
            case 2:
              return "<img src='assets/images/star_rating/2-star.png' width='auto' height='20' />"
            case 3:
              return "<img src='assets/images/star_rating/3-star.png' width='auto' height='20' />"
            case 4:
              return "<img src='assets/images/star_rating/4-star.png' width='auto' height='20' />"
            case 5:
              return "<img src='assets/images/star_rating/5-star.png' width='auto' height='20' />"
            default:
              return "<img src='assets/images/star_rating/0-star.png' width='auto' height='20' />"
          }
        }, filter: 'agNumberColumnFilter', tooltip: function (params) {
          switch (params.value) {
            case 1:
              return "GP value is less than 1,00,000"
            case 2:
              return "GP value is between 1,00,001 and 3,00,000"
            case 3:
              return "GP value is between 3,00,001 and 5,00,000"
            case 4:
              return "GP value is between 5,00,001 and 10,00,000"
            case 5:
              return "GP value is greater than 10,00,000"
            default:
              return "GP value is 0"
          }
        }
      },
      { headerName: 'Industry', field: 'IndustryName' },
      {
        headerName: 'Status', field: 'Status', cellRenderer: function (params) {
          return Status[params.value];
        }
      },
      { headerName: 'Assignment', field: 'AssignmentOneLiner' },
      { headerName: 'Sign-up Date', field: 'SignUpDateStr' },
      { headerName: 'Signed by', field: 'SignedUserName' },
    ];

    const reportParam = sessionStorage.getItem('Client-Search');

    if (reportParam) {
      const inputs = JSON.parse(reportParam);
      this.searchText = inputs.searchText === undefined ? '' : inputs.searchText;
      this.fromDateText = inputs.fromDateText === undefined ? '' : inputs.fromDateText;
      this.toDateText = inputs.toDateText === undefined ? '' : inputs.toDateText;

      this.getResult();
    }

  }

  getResult = () => {

    if (this.indLoading)
      return;

    this.msg = '';
    const searchInput = {
      searchText: this.searchText,
      SignUpDateFrom: this.fromDateText,
      SignUpDateTo: this.toDateText
    };

    const reportParam = sessionStorage.getItem('Client-Search');

    if (reportParam) {
      sessionStorage.removeItem('Client-Search');
    }

    sessionStorage.setItem('Client-Search', JSON.stringify(searchInput));

    this.indLoading = true;
    this.service.post('api/client/search', searchInput)
      .subscribe(c => {
        this.results = c;
        this.indLoading = false;
      },
        error => {
          this.indLoading = false;
          this.msg = <any>error
        });
  }

  onFromDateChanged = (event: IMyDateModel) => {
    this.fromDateText = event.formatted;
  }

  onToDateChanged = (event: IMyDateModel) => {
    this.toDateText = event.formatted;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  showInviceDetails = () => {
    this.showInvoices = !this.showInvoices;
  }

  expandPopup = () => {
    const element = document.getElementById('expand');

    if (!element)
      return;

    element.classList.add('fullscreen');
  }

  closePopup = () => {
    const element = document.getElementById('expand');

    if (!element)
      return;

    element.classList.remove('fullscreen');
    this.showPopup = false;
  }

  onCellClicked(event: any) {
    if (event.colDef.field !== 'ClientName')
      return;

    this.selectedClientId = event.data.Id;
    this.showPopup = true;
    this.expandPopup();
  }
}
