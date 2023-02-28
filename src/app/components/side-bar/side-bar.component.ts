import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { ILoginUser } from '../../model/userlogin';
import {
  ActivatedRoute, Router, CanDeactivate, NavigationStart, NavigationEnd, NavigationError,
  NavigationCancel, RoutesRecognized
} from '@angular/router';
import { Service } from '../../Service/service';
import { Common } from '../../shared/common';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  user: any;
  role: string;

  constructor(private fb: FormBuilder, private _roleService: Service,
    private route: ActivatedRoute, private router: Router, private _configService: ConfigService) {
    this.user = '';
    // router.events
    //   .filter(event => event instanceof NavigationStart)
    //   .subscribe((event: NavigationStart) => {
    //     const user = sessionStorage.getItem('currentUser');
    //     if (user === null || user === undefined || user === '') {
    //       this.onLogout();
    //     }
    //   });
  }

  ngOnInit() {
    this.user = sessionStorage.getItem('currentUser');
    if (this.user !== null && this.user !== '') {
      const userObject = JSON.parse(this.user);
      this.user = userObject;
    }
  }

  isConsultant(roleId: number) {
    return Common.isConsultantsRole(roleId);
  }

  isBPM(role: string) {
    return Common.isBPMTeamsRole(role);
  }

  isAccountsTeam(role: string) {
    return Common.isAccountsTeamsRole(role);
  }

  isAccountsHead(role: string) {
    return Common.isAccountsHeadRole(role);
  }

  onLogout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

}
