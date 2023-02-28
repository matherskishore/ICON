import * as FileSaver from "file-saver";
import * as moment from 'moment';
import { ApplicationConfig } from "../model/ApplicationConfig";

export class Common {
  public static GetUniqueFileName(fileName: string, fileExtension: string) {
    const today = new Date();
    let newFileName =
      fileName +
      today.getFullYear().toString() +
      today.getMonth().toString() +
      1 +
      today.getDate().toString() +
      today.getHours().toString() +
      today.getMinutes().toString() +
      today.getMilliseconds().toString() +
      "." +
      fileExtension;

    return newFileName;
  }

  public static downloadExcelFile(fileName: string, data: any) {
    const downloadUrl = URL.createObjectURL(data);
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    FileSaver.saveAs(blob, fileName);
  }

  public static GetEndPoints() {
    return JSON.parse(sessionStorage.getItem("api_endpoints"));
  }

  public static GetApplicationConfig() {
    return JSON.parse(sessionStorage.getItem("app_config"));
  }

  public static GetAccountsTeamRoles() {
    const roles = this.GetApplicationConfig();
    return roles.ACCOUNTS_TEAM_ROLES.split(',');
  }

  public static isAccountsTeamsRole(role: String): boolean {
    if (role == null) {
      return false;
    }

    const roles = this.GetAccountsTeamRoles();
    return roles.indexOf(role) > -1;
  }

  public static GetBPMRoles() {
    const roles = this.GetApplicationConfig();
    return roles.BUSINESS_PARTNER_MANAGER_ROLES.split(',');
  }

  public static isBPMTeamsRole(role: String): boolean {
    if (role == null) {
      return false;
    }

    const roles = this.GetBPMRoles();
    return roles.indexOf(role) > -1;
  }

  public static GetConsultantRoles() {
    const roles = this.GetApplicationConfig();
    return roles.CONSULTANT_ROLES.split(',');
  }

  public static isConsultantsRole(role: number): boolean {
    if (role == null) {
      return false;
    }
    const roles = this.GetConsultantRoles();
    return roles.indexOf(role.toString()) > -1;
  }

  public static GetAccountsHeadRoles() {
    const roles = this.GetApplicationConfig();
    return roles.ACCOUNTS_HEAD_ROLES.split(',');
  }

  public static isAccountsHeadRole(role: string): boolean {
    if (role == null) {
      return false;
    }
    const roles = this.GetAccountsHeadRoles();
    return roles.indexOf(role.toString()) > -1;
  }

  public static formatDate(filterLocalDateAtMidnight, cellValue) {
    var dateAsString = moment(cellValue).format('DD/MM/YYYY');
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split("/");
    var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
    if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
  }

  public static setDateToControl(value: string, splitCharacter: string) {
    const dateArray = value.split(splitCharacter);
    if (dateArray.length < 2) {
      return;
    }
    let month = dateArray[1];
    if (dateArray[1].substring(0, 1) === '0') {
      month = dateArray[1].substring(1, 2);
    }

    let day = dateArray[0];
    if (dateArray[0].substring(0, 1) === '0') {
      day = dateArray[0].substring(1, 2);
    }

    return { date: { year: dateArray[2], month: month, day: day } };
  }

  public static isFutureDate(idate: any, splitCharacter: string) {
    const today = new Date().getTime();
    const dateArr = idate.split(splitCharacter);

    idate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]).getTime();
    return (today - idate) < 0;
  }

  public static GetDateDifference(fromDate: string, toDate: string, format: string) {
    const from = moment(fromDate, format);
    const to = moment(toDate, format);
    const days = to.diff(from, 'days');
    return days;
  }

  public static GetApplicationSettings() {
    return <ApplicationConfig>JSON.parse(sessionStorage.getItem('application-settings'));
  }

  public static ConvertToDecimal(input: number) {
    const applicationSettings = this.GetApplicationSettings();
    return parseFloat(Number(input).toFixed(applicationSettings.DecimalRounOffPlaces));
  }

}
