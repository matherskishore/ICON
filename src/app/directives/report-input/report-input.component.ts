import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IMyDpOptions, IMyDateModel, IMyDate } from "mydatepicker";
import { LoggedInUser } from "../../model/loggedinuser";
import { IUser } from "../../model/user";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs/Rx";
import { ConfigService } from "../../Service/config.service";
import { RequestOptions } from "@angular/http";
import { Service } from "../../Service/service";
import { ActivatedRoute, Router, CanDeactivate } from "@angular/router";
import { SelectModule } from "ng2-select";
import { Common } from "app/shared/common";

@Component({
  selector: "app-report-input",
  templateUrl: "./report-input.component.html",
  styleUrls: ["./report-input.component.css"]
})
export class ReportInputComponent implements OnInit {
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: "dd/mm/yyyy"
  };

  @Input("fromDate") fromDate: string;
  @Input("toDate") toDate: string;
  @Input("reportType") reportType: string;
  @Input("user") user: string;
  @Output() fromDateChange = new EventEmitter<string>();
  @Output() toDateChange = new EventEmitter<string>();
  @Output() reportTypeChange = new EventEmitter<string>();
  @Output() userChange = new EventEmitter<string>();
  fromDateObj: IMyDate = { year: 0, month: 0, day: 0 };
  toDateObj: IMyDate = { year: 0, month: 0, day: 0 };
  reportingMembers: string[];
  isManager: boolean;
  loggedInUser: any;
  isResultFound: boolean;
  userName: string;
  indLoading: boolean;
  apiEndpoints: any;
  reportingUsers: Array<any>;
  msg: string;
  isAccountsTeamRole: boolean;
  userSession: any;

  constructor(
    private _dashBoardService: Service,
    private _configService: ConfigService
  ) {
    this.getApis();
  }

  ngOnInit() {
    const usr = sessionStorage.getItem('currentUser');
    if (usr !== null && usr !== '') {
      const usrObj = JSON.parse(usr);
      this.userSession = usrObj;
      this.isAccountsTeamRole = this.isAccountsTeam(this.userSession.RoleCode);
    }

    const userObj = new LoggedInUser();
    this.loggedInUser = userObj.getLoggedUser();
    this.isResultFound = false;
    if (!this.loggedInUser.IsManager && this.loggedInUser.SystemRole == null) {
      this.reportType = "Self";
    }
  }

  isAccountsTeam(role: string) {
    return Common.isAccountsTeamsRole(role) || Common.isAccountsHeadRole(role);
  }

  getApis() {
    this._configService.get().subscribe(
      c => {
        this.apiEndpoints = c;
        this.loadReportingUsers();
        this.getReportParameters();
        this.fromDateChange.emit(this.fromDate);
        this.toDateChange.emit(this.toDate);
        this.reportTypeChange.emit(this.reportType);
        this.userChange.emit(this.user);
      },
      error => {
        this.msg = <any>error;
      }
    );
  }

  onUserChange(item: any) {
    this.user = item.id;
    this.userName = item.text;
    this.userChange.emit(this.user);
  }

  clearUser(item: any) {
    this.user = "";
    this.userChange.emit(this.user);
  }

  onFromDateChanged(event: IMyDateModel) {
    this.fromDate = event.formatted;
    this.fromDateChange.emit(this.fromDate);
  }

  onToDateChanged(event: IMyDateModel) {
    this.toDate = event.formatted;
    this.toDateChange.emit(this.toDate);
  }

  onTypeChange(value: string) {
    if (value == "Self") {
      this.user = "";
      this.reportingMembers = [];
    }
    this.reportType = value;
    this.reportTypeChange.emit(this.reportType);
  }

  SetDate(value: string) {
    let dateCtrl: any;
    const dateArray = value.split("/");
    if (dateArray.length < 2) {
      return;
    }
    let month = dateArray[1];
    if (dateArray[1].substring(0, 1) === "0") {
      month = dateArray[1].substring(1, 2);
    }

    let day = dateArray[0];
    if (dateArray[0].substring(0, 1) === "0") {
      day = dateArray[0].substring(1, 2);
    }
    dateCtrl = { year: dateArray[2], month: month, day: day };

    return dateCtrl;
  }

  getReportParameters() {
    const scoreCardReportParameters = JSON.parse(
      sessionStorage.getItem("scoreCardReportParameters")
    );
    if (
      scoreCardReportParameters !== null &&
      scoreCardReportParameters !== undefined
    ) {
      this.fromDate = scoreCardReportParameters.fromDate;
      this.toDate = scoreCardReportParameters.toDate;
      if (
        scoreCardReportParameters.reportType !== null &&
        scoreCardReportParameters.reportType !== undefined
      ) {
        this.reportType = scoreCardReportParameters.reportType;
      }
      if (
        scoreCardReportParameters.reportingUserId !== null &&
        scoreCardReportParameters.reportingUserId !== undefined
      ) {
        this.user = scoreCardReportParameters.reportingUserId;
        this.reportingMembers = [
          scoreCardReportParameters.reportingUserName,
          scoreCardReportParameters.reportingUserId
        ];
      }

      this.fromDateObj = this.SetDate(this.fromDate);
      this.toDateObj = this.SetDate(this.toDate);
    } else {
      let currentDate = new Date();
      let dd = currentDate.getDate();
      let mm = currentDate.getMonth() + 1;
      let yyyy = currentDate.getFullYear();

      this.fromDateObj = { year: yyyy, month: mm, day: dd };
      this.toDateObj = { year: yyyy, month: mm, day: dd };

      this.fromDate =
        dd.toString() + "/" + mm.toString() + "/" + yyyy.toString();
      this.toDate = dd.toString() + "/" + mm.toString() + "/" + yyyy.toString();
    }
  }

  loadReportingUsers() {
    this.indLoading = true;
    this._dashBoardService
      .get(this.apiEndpoints.BASE_GET_REPORTING_USERS_ENDPOINT)
      .subscribe(
        c => {
          this.reportingUsers = c;
          this.indLoading = false;
        },
        error => {
          this.msg = <any>error;
        }
      );
  }
}
