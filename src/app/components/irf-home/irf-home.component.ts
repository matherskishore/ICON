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
import { ConsultantIRFHome } from '../../model/ConsultantIRFHome';
import { ConsultantIRFStatus } from '../../model/ConsultantIRFStatus';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-irf-home',
  templateUrl: './irf-home.component.html',
  styleUrls: ['./irf-home.component.css']
})
export class IrfHomeComponent implements OnInit {
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  irfStatus: ConsultantIRFHome;
  @ViewChild('deleteIRF') deleteIRF: ModalComponent;
  @ViewChild('copyIRF') copyIRF: ModalComponent;
  selectedIndex: number;

  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
  }

  ngOnInit() {
    this.irfStatus = new ConsultantIRFHome();
    this.loadIRFStatus();
  }

  loadIRFStatus() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_IRF_CONSULTANT_HOME_ENDPOINT)
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
    sessionStorage.setItem('irf-home', '/home/irf-consultant-home');
    if (id >= 0) {
      this.router.navigate(['/home/submit-irf'], { queryParams: { id: id } });
    }
  }

  openDeleteIRF = (index: number) => {
    this.selectedIndex = index;
    this.deleteIRF.open();
  }

  deleteIRFDetails = () => {
    const iRFID = this.irfStatus.ToBeSubmitted[this.selectedIndex].Id;
    this.service.delete(this.apiEndpoints.BASE_GET_IRF_DELETE_ENDPOINT, iRFID).subscribe(
      data => {
        this.msg = data;
        this.loadIRFStatus();
        this.deleteIRF.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  openCopyConfirmation = (id: number) => {
    this.selectedIndex = id;
    this.copyIRF.open();
  }

  copyIRFDetails = () => {
    const options = new RequestOptions({ params: { id: this.selectedIndex } });
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_IRF_COPY_ENDPOINT, options)
      .subscribe(c => {
        this.indLoading = false;
        this.openIRFDetails(c);
      },
        error => this.msg = <any>error);
  }
}

