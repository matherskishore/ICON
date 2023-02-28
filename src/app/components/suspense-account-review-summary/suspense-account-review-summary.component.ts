import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import 'rxjs/add/observable/throw';
import { Service } from '../../Service/service';
import { Common } from '../../shared/common';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SuspenseAccountSummary } from '../../model/SuspenseAccountSummary';
import { CreditNote } from '../../model/CreditNote';
import { SuspenseAccount } from '../../model/SuspenseAccount';

@Component({
  selector: 'app-suspense-account-review-summary',
  templateUrl: './suspense-account-review-summary.component.html',
  styleUrls: ['./suspense-account-review-summary.component.css']
})
export class SuspenseAccountReviewSummaryComponent implements OnInit {

  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: any;
  suspenseAccountSummary: SuspenseAccountSummary;
  @ViewChild('deleteCnfm') deleteCnfm: ModalComponent;
  @ViewChild('supAccountubmitCnfm') supAccountubmitCnfm: ModalComponent;
  selectedIndex: number;
  inputParams: any;
  suspenseAccountId: number;

  constructor(private service: Service, private route: ActivatedRoute, private router: Router) {
    this.apiEndpoints = Common.GetEndPoints();
    this.suspenseAccountSummary = new SuspenseAccountSummary();
  }

  ngOnInit() {
    this.loadSuspenseAccountummary();
  }

  loadSuspenseAccountummary() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_CLAIM_SUMMARY_ENDPOINT)
      .subscribe(c => {
        this.suspenseAccountSummary = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  openSuspenseAccountDetails(id: number, claimId: number) {
    if (sessionStorage.getItem('irf-home')) {
      sessionStorage.removeItem('irf-home');
    }
    sessionStorage.setItem('irf-home', '/home/suspense-account-review');
    if (id >= 0) {
      this.router.navigate(['/home/suspense-account'], { queryParams: { id: id, cid: claimId } });
    }
  }


}
