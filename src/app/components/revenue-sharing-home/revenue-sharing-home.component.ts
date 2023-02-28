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
import { RevenueSharingHome } from '../../model/RevenueSharingHome';
import { ConsultantIRFStatus } from '../../model/ConsultantIRFStatus';

@Component({
  selector: 'app-revenue-sharing-home',
  templateUrl: './revenue-sharing-home.component.html',
  styleUrls: ['./revenue-sharing-home.component.css']
})
export class RevenueSharingHomeComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  irfStatus: RevenueSharingHome;

  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
  }

  ngOnInit() {
    this.irfStatus = new RevenueSharingHome();
    this.loadIRFStatus();
  }

  loadIRFStatus() {
    this.indLoading = true;
    const options = new RequestOptions({ params: { invoiceNumber: '', irfNumber: null } });
    this.service.get(this.apiEndpoints.BASE_GET_IRF_RS_HOME_ENDPOINT, options)
      .subscribe(c => {
        this.irfStatus = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  openIRFDetails(id: number) {
    if (id >= 0) {
      if (sessionStorage.getItem('irf-home')) {
        sessionStorage.removeItem('irf-home')
      }
      sessionStorage.setItem('irf-home', '/home/revenue-sharing');

      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id, rs: 's' } });
    }
  }
}
