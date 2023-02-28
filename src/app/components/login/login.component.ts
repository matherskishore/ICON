import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { ILoginUser } from '../../model/userlogin';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { Service } from '../../Service/service';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { IToken } from '../../model/token';
import { ILoginCredential } from '../../model/token';
import { Common } from '../../shared/common';
import { ApplicationConfig } from '../../model/ApplicationConfig';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userForm: FormGroup;
  userId: string;
  password: string;
  msg: string;
  loginDetail: ILoginUser;
  apiEndpoints: any;
  topBar: TopBarComponent;
  _credential: ILoginCredential;
  _token: IToken;
  applicationConfig: ApplicationConfig;

  constructor(private fb: FormBuilder, private _roleService: Service,
    private route: ActivatedRoute, private router: Router, private _configService: ConfigService) {
    this.getApis();
  }

  getApis() {
    this._configService.get()
      .subscribe(c => {
        this.apiEndpoints = c;
        sessionStorage.setItem('api_endpoints', JSON.stringify(this.apiEndpoints));
      },
        error => { this.msg = <any>error; });

    this._configService.getAppConfig()
      .subscribe(c => {
        sessionStorage.setItem('app_config', JSON.stringify(c));
      },
        error => { this.msg = <any>error; });
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  eventHandler(keyCode: number) {
    if (keyCode === 13 && !this.userForm.invalid) {
      this.generateToken();
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

  generateToken() {
    this._credential = new ILoginCredential();
    this._credential.username = this.userId;
    this._credential.password = this.password;
    this._credential.grant_type = 'password';
    let body = new URLSearchParams();
    body.set('username', this.userId);
    body.set('password', this.password);
    body.set('grant_type', 'password');
    this._roleService.postToken(this.apiEndpoints.BASE_GETTOKEN_ENDPOINT, body.toString()).subscribe(
      data => {
        this._token = data;
        sessionStorage.setItem('access_token', this._token.access_token);
        sessionStorage.setItem('token_type', this._token.token_type);
        sessionStorage.setItem('expires_in', this._token.expires_in);
        this.doLogin();
      },
      error => {
        this.msg = error;
      }
    );

  }

  doLogin() {
    const options = new RequestOptions({ params: { userName: this.userId, password: this.password } });
    this._roleService.get(this.apiEndpoints.BASE_GETLOGINUSER_ENDPOINT, options)
      .subscribe(c => {
        this.loginDetail = c;
        if (this.loginDetail != null) {
          sessionStorage.setItem('currentUser', JSON.stringify(this.loginDetail));
          const userStr = sessionStorage.getItem('currentUser');
          const userObject = JSON.parse(userStr);
          if (this.isConsultant(this.loginDetail.RoleId)) {
            this.router.navigate(['/home/irf-consultant-home']);
          } else if (this.isBPM(this.loginDetail.RoleCode)) {
            this.router.navigate(['/home/payout-request-a']);
          } else if (this.isAccountsTeam(this.loginDetail.RoleCode)) {
            this.router.navigate(['/home/mgmt-home']);
          } else if (Common.isAccountsHeadRole(this.loginDetail.RoleCode)) {
            this.router.navigate(['/home/mgmt-home']);
          } else if (this.loginDetail.SystemRole != null && this.loginDetail.SystemRole > 0) {
            this.router.navigate(['/home/clients']);
          } else {
            this.msg = 'Invalid Login';
          }
          this.setApplicationConfig();
        } else {
          this.msg = 'Invalid Login';
        }
      },
        error => this.msg = <any>error);
  }

  setApplicationConfig() {
    this._roleService.get(this.apiEndpoints.BASE_GET_APP_CONFIG_ENDPOINT, null)
      .subscribe(c => {
        this.applicationConfig = c;
        this.applicationConfig.RevenueSharingEditingDateLimit = null;
        sessionStorage.setItem('application-settings', JSON.stringify(this.applicationConfig));
      },
        error => this.msg = <any>error);
  }


}
