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
  selector: 'app-suspense-account-summary',
  templateUrl: './suspense-account-summary.component.html',
  styleUrls: ['./suspense-account-summary.component.css']
})
export class SuspenseAccountSummaryComponent implements OnInit {


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
    this.service.get(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_SUMMARY_ENDPOINT)
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
    sessionStorage.setItem('irf-home', '/home/suspense-account-summary');
    if (id >= 0) {
      this.router.navigate(['/home/suspense-account'], { queryParams: { id: id, cid: claimId } });
    }
  }

  openDeleteConfirmation = (index: number) => {
    this.selectedIndex = index;
    this.deleteCnfm.open();
  }

  publishSuspenseAccount = () => {
    let suspAccounts = Array<SuspenseAccount>();
    this.indLoading = true;
    for (const item of this.suspenseAccountSummary.ToBePublished) {
      const suspAccount = new SuspenseAccount();
      suspAccount.Id = item.Id;
      suspAccount.AmountCredited = item.AmountCredited;
      suspAccount.AmountCredited = item.AmountCredited;
      suspAccount.DateOfCredit = item.DateOfCredit;
      suspAccount.BankName = item.BankName;
      suspAccounts.push(suspAccount);
    }
    this.service.put(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_PUBLISH_ENDPOINT, suspAccounts).subscribe(
      data => {
        this.indLoading = false;
        this.msg = data;
        this.loadSuspenseAccountummary();
        this.supAccountubmitCnfm.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  openSubmitConfirm = () => {
    this.supAccountubmitCnfm.open();
  }

  deleteSuspenseAccount = () => {
    const id = this.suspenseAccountSummary.ToBePublished[this.selectedIndex].Id;
    this.service.delete(this.apiEndpoints.BASE_GET_SUSPENSE_ACCOUNT_ENDPOINT, id).subscribe(
      data => {
        this.msg = data;
        this.loadSuspenseAccountummary();
        this.deleteCnfm.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

}
