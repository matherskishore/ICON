import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { IRFDetail } from '../../model/IRFDetail';
import { IRFMaster } from '../../model/IRFMaster';
import { Location } from '../../model/location';
import { DropDown } from '../../model/DropDown';
import { IRFCandidate } from '../../model/IRFCandidate';
import { IRFRevenueSharing } from '../../model/IRFRevenueSharing';
import { IRFAttachment } from '../../model/IRFAttachment';
import { BusinessPartner } from '../../model/BusinessPartner';
import { CityBusinessPartner } from '../../model/CityBusinessPartner';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { PaginationComponent1 } from '../pagination/pagination.component';
import { NgDataGridModel } from 'angular2-datagrid';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { TabsModule } from "ngx-tabs";
import { FileUploader } from 'ng2-file-upload';
import { Common } from '../../shared/common';
import { ApplicationConfig } from '../../model/ApplicationConfig';
import { GenericCode } from 'app/model/GenericCode';
import { DISABLED } from '@angular/forms/src/model';

@Component({
  selector: 'app-submit-irf',
  templateUrl: './submit-irf.component.html',
  styleUrls: ['./submit-irf.component.css']
})
export class SubmitIrfComponent implements OnInit {
  formAction: string;
  masterData: IRFMaster;
  IRFType_GenericCode = [];
  IRFType_SubCategory = [];
  msg: string;
  indLoading: boolean;
  candidateModalTitle: string;
  candidateModalBtnTitle: string;
  revenueModalTitle: string;
  revenueModalBtnTitle: string;
  @ViewChild('addCandidateModal') addCandidateModal: ModalComponent;
  @ViewChild('candidateDeletemodal') candidateDeletemodal: ModalComponent;
  @ViewChild('addRevenueModal') addRevenueModal: ModalComponent;
  @ViewChild('revenueDeletemodal') revenueDeletemodal: ModalComponent;
  @ViewChild('attachmentDeletemodal') attachmentDeletemodal: ModalComponent;
  @ViewChild('irfSubmissionmodal') irfSubmissionmodal: ModalComponent;
  @ViewChild('irfReviewmodal') irfReviewmodal: ModalComponent;
  @ViewChild('updateRevenueSharing') updateRevenueSharing: ModalComponent;
  dbops: DBOperation;
  apiEndpoints: any;
  sub: any;
  copyAddress: boolean;
  iRFDetail: IRFDetail;
  user: any;
  locations: Array<Location>;
  IRFCandidate: IRFCandidate;
  IRFRevenue: IRFRevenueSharing;
  myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
  };
  candidateops: DBOperation;
  revenueOps: DBOperation;
  selectedIndex: number;
  dobCtrl: Object;
  users: Array<DropDown>;
  sourcingConsultant: DropDown;
  sourcingConsultantRevenue: DropDown;
  sourcingConsultantId: number;
  sourcingRevenueConsultantId: number;
  documentIds: Array<number>;
  businessPartnerId: number;
  cityBusinessPartnerId: number;
  branchId: number;
  inputParams: any;
  iRFId: number;
  iRFOPS: DBOperation;
  uploadEndpointsSessiom = Common.GetEndPoints();
  URL = this.uploadEndpointsSessiom.BASE_URL + this.uploadEndpointsSessiom.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader(
    {
      url: this.URL,
      authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
      maxFileSize: 4 * 1024 * 1024 // 4 MB
    });
  hasAnotherDropZoneOver: boolean;
  selectedAttachmentId: number;
  sourcingConsultantLabel: string;
  sourcingRevenueConsultantLabel: string;
  irfWarningMessage: string;
  currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  isReadOnly: boolean;
  irfReviewerMessage: string;
  canConsultantReviewRearks: boolean;
  isAcceptedIRF: boolean;
  previousPage: string;
  isRevenueSharing: boolean;
  appConfig: any = Common.GetApplicationConfig();
  candidateSourceDropDown: DropDown;
  gpSHaringSourceDropDown: DropDown;
  candidateSourceDropDownArray: Array<DropDown>;
  irfSubmissionMsg: string;
  generalStaffingId: string;
  professionalStaffingId: string;
  selectionId: string;
  technicalKnowHowFeeId: string;
  nAPSId: string;
  rapidFeesId: string;
  isnewIRF: boolean;
  gpSharingErrorMsg: string;
  applicationConfig: ApplicationConfig;
  allowRSEdit: boolean;


  constructor(private service: Service, private configService: ConfigService,
    private route: ActivatedRoute, private router: Router) {
    this.formAction = '';
    this.previousPage = sessionStorage.getItem('irf-home');
    this.inputParams = this.route.queryParams.subscribe(params => {
      this.iRFId = params['id'];
      if (this.iRFId && this.iRFId > 0) {
        this.isnewIRF = false;
      } else {
        this.isnewIRF = true;
      }
      this.formAction = params['action'];
      const rs = params['rs'];
      if (rs != null && rs === 's') {
        this.isRevenueSharing = true;
      } else {
        this.isRevenueSharing = false;
      }
    });
    this.allowRSEdit = true;
    this.masterData = new IRFMaster();
    this.iRFDetail = new IRFDetail();
    this.IRFCandidate = new IRFCandidate();
    this.documentIds = new Array<number>();
    this.IRFRevenue = new IRFRevenueSharing();
    this.getApis();
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status == 200) {
        let attachment = new IRFAttachment();
        attachment.DocumentID = response;
        attachment.RowState = 'I';
        attachment.FileName = item.file.name.split('.').length > 0 ? item.file.name.split('.')[0] : '';
        if (!this.iRFDetail.Attachments) {
          this.iRFDetail.Attachments = new Array<IRFAttachment>();
        }
        this.iRFDetail.Attachments.push(attachment);
      }
    };
  }

  ngOnInit() {
    if (Common.isAccountsTeamsRole(this.currentUser.RoleCode) && this.formAction !== 'revise') {
      this.isReadOnly = true;
    } else {
      this.isReadOnly = false;
    }

    this.user = sessionStorage.getItem('currentUser');
    if (this.user !== null && this.user !== '') {
      const userObject = JSON.parse(this.user);
      this.user = userObject;
    }
    this.iRFDetail.CurrencyDetails = "INR";
    this.iRFDetail.ConsultantID = this.user.UserId;
    this.iRFDetail.ReportingManagerID = this.user.ManagerId;
  }

  onchangeIRFType = (event) => {

    let CodeTypeId = this.masterData.GeneriCodes.find(a=>a.Name.toUpperCase().toString() == event.target.value.toUpperCase().toString()).CodeTypeId;
    this.IRFType_SubCategory =  this.masterData.GeneriCodes.filter(a=>a.CodeTypeId == CodeTypeId && a.ParentId != 0);

    this.iRFDetail.IRFSubType = '';
    const id = event.data.CodeTypeId;
    const name = event.data.IRF_Type;
    switch (name) {
      case "GeneralStaffing":
        this.iRFDetail.IRF_Type = this.generalStaffingId;
        break;
      case "ProfessionalStaffing":
        this.iRFDetail.IRF_Type = this.professionalStaffingId;
        break;
      case "Selection":
        this.iRFDetail.IRF_Type = this.selectionId;
        break;
      case "TechnicalKnowHowFee":
        this.iRFDetail.IRF_Type = this.technicalKnowHowFeeId;
        break;
      case "NAPS":
        this.iRFDetail.IRF_Type = this.nAPSId;
        break;
      case "RapidFees":
        this.iRFDetail.IRF_Type = this.rapidFeesId;
        break;
      default:
        this.iRFDetail.IRF_Type = ''
        break;
    }
    this.loadDropDown(id, name)
  }

  loadDropDown(id: string, name: string){
    switch (name){
      case "GeneralStaffing":
        this.generalStaffingId = id;
        break;
      case "ProfessionalStaffing":
        this.professionalStaffingId = id;
        break;
      case "Selection":
        this.selectionId = id;
        break;
      case "TechnicalKnowHowFee":
        this.technicalKnowHowFeeId = id;
        break;
      case "NAPS":
        this.nAPSId = id;
        break;
      case "RapidFees":
        this.rapidFeesId = id;
        break;
    }
  }

  getApis() {
    this.configService.get()
      .subscribe(c => {
        this.apiEndpoints = c;
        this.getApplicationConfig();
        this.loadIRFMasterData();
      },
        error => { this.msg = <any>error; });
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  getApplicationConfig() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_APP_CONFIG_ENDPOINT, null)
      .subscribe(c => {
        this.applicationConfig = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  loadIRFDetails() {
    if (this.iRFId && this.iRFId > 0) {
      this.iRFOPS = DBOperation.update;
      const options = new RequestOptions({ params: { IRFID: this.iRFId } });
      this.service.get(this.apiEndpoints.BASE_GET_IRF_DETAIL_ENDPOINT, options)
        .subscribe(c => {
          this.iRFDetail = c;
          this.iRFDetail.Id = this.iRFId;
          this.indLoading = false;
          this.loadClientList();
          if (this.iRFDetail.Status === 4) {
            this.canConsultantReviewRearks = true;
          } else {
            this.canConsultantReviewRearks = false;
          }

          if (this.iRFDetail.Status === 3 && this.formAction !== 'revise') {
            this.isAcceptedIRF = true;
            this.isReadOnly = true;
          }
          this.setRevenueSharingEditable();
        },
          error => this.msg = <any>error);
    } else {
      this.iRFOPS = DBOperation.insert;
    }
  }

  setRevenueSharingEditable = () => {
    if (this.iRFDetail.ApprovedOnStr !== '' && this.applicationConfig.CurrentDate !== '') {
      const dateDiff = Common.GetDateDifference(this.iRFDetail.ApprovedOnStr, this.applicationConfig.CurrentDate, 'DD/MM/YYYY');
      this.allowRSEdit = dateDiff <= this.applicationConfig.RevenueSharingEditingDateLimit;
    }
  }

  loadClientList() {
    if (this.iRFDetail.ClientID != null && this.iRFDetail.ClientID > 0) {
      const options = new RequestOptions({ params: { clientId: this.iRFDetail.ClientID } });
      this.indLoading = true;
      this.service.get(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, options)
        .subscribe(c => {
          this.locations = c;
          this.indLoading = false;
        },
          error => this.msg = <any>error);
    }
  }

  loadIRFMasterData() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_IRF_MASTER_ENDPOINT)
      .subscribe(c => {
        this.masterData = c;


        this.IRFType_GenericCode = this.masterData.GeneriCodes.filter(a=>a.ParentId == 0);
        this.indLoading = false;
        this.iRFDetail.InvoiceType = 'Domestic';
        this.loadUsers();
        this.loadIRFDetails();
      },
        error => this.msg = <any>error);
  }

  copyBillingAddress() {
    if (this.copyAddress) {
      this.iRFDetail.InvoiceShippingAddress = this.iRFDetail.InvoiceBillingAddress;
    } else {
      this.iRFDetail.InvoiceShippingAddress = "";
    }
  }

  loadClients() {
    if (this.iRFDetail.ClientID != null && this.iRFDetail.ClientID > 0) {
      const options = new RequestOptions({ params: { clientId: this.iRFDetail.ClientID } });
      this.indLoading = true;
      this.service.get(this.apiEndpoints.BASE_GETLOCATION_ENDPOINT, options)
        .subscribe(c => {
          this.locations = c;
          this.indLoading = false;
          this.setLocationDefaultValue();
        },
          error => this.msg = <any>error);
    }
  }

  setLocationDefaultValue = () => {
    if (this.locations.length === 1) {
      this.iRFDetail.ClientLocationID = this.locations[0].ID;
      this.iRFDetail.InvoiceShippingAddress = this.locations[0].ShippingAddress;
      this.iRFDetail.InvoiceBillingAddress = this.locations[0].BillingAddress;
      this.iRFDetail.ClientSPOC_Name = this.locations[0].LocationSPOC_Name;
      this.iRFDetail.ClientMailID = this.locations[0].SPOC_Email;
      this.iRFDetail.ClientGST_Number = this.locations[0].GST_Number;
      this.iRFDetail.ClientContactNumber = this.locations[0].SPOC_ContactNumber;
      this.iRFDetail.InvoicingCentreID = this.locations[0].InvoiceCentreId;
    } else {
      this.iRFDetail.ClientLocationID = null;
      this.iRFDetail.InvoiceShippingAddress = "";
      this.iRFDetail.InvoiceBillingAddress = "";
      this.iRFDetail.ClientSPOC_Name = "";
      this.iRFDetail.ClientMailID = '';
      this.iRFDetail.ClientGST_Number = '';
      this.iRFDetail.ClientContactNumber = '';
      this.iRFDetail.InvoicingCentreID = null;
    }
  }

  FillAddress = () => {
    for (const location of this.locations) {
      if (this.iRFDetail.ClientLocationID == location.ID) {
        this.iRFDetail.InvoiceShippingAddress = location.ShippingAddress;
        this.iRFDetail.InvoiceBillingAddress = location.BillingAddress;
        this.iRFDetail.ClientSPOC_Name = location.LocationSPOC_Name;
        this.iRFDetail.ClientMailID = location.SPOC_Email;
        this.iRFDetail.ClientGST_Number = location.GST_Number;
        this.iRFDetail.ClientContactNumber = location.SPOC_ContactNumber;
        this.iRFDetail.InvoicingCentreID = location.InvoiceCentreId;
      }
    }

  }

  addAttachments = () => {
    this.iRFDetail.Attachments = new Array<IRFAttachment>();
    for (const documentId of this.documentIds) {
      if (documentId) {
        const attachment = new IRFAttachment();
        attachment.DocumentID = documentId;
        this.iRFDetail.Attachments.push(attachment);
      }
    }
  }

  validateIRF() {
    if (!this.validateSubmit()) {
      return;
    }
    this.service.post(this.apiEndpoints.BASE_GET_IRF_VALIDATE_ENDPOINT, this.iRFDetail).subscribe(
      data => {
        if (data > 0) {
          this.irfWarningMessage = 'The selected IRF already has been submitted. Do you want to resubmit again?';
        } else {
          this.irfWarningMessage = 'Do you want to submit the selected IRF?';
        }


        if (this.formAction === 'revise') {
          this.irfSubmissionMsg = "IRF Revision";
        } else {
          this.irfSubmissionMsg = "IRF Submission";
        }
        this.irfSubmissionmodal.open();
      },
      error => {
        this.msg = error;
      }
    );
  }

  onSubmit() {
    if (!this.validateSubmit()) {
      return;
    }

    this.msg = '';
    if (this.iRFOPS === DBOperation.insert) {
      this.service.post(this.apiEndpoints.BASE_GET_IRF_SUBMIT_ENDPOINT, this.iRFDetail).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/irf-consultant-home']);
        },
        error => {
          this.msg = error;
        }
      );
    } else if (this.iRFOPS === DBOperation.update) {
      if (this.formAction === 'revise') {
        this.service.put(this.apiEndpoints.BASE_GET_IRF_REVISE_ENDPOINT, this.iRFDetail).subscribe(
          data => {
            this.msg = data;
            this.irfSubmissionmodal.dismiss();
            this.router.navigate(['/home/invoice-view']);
          },
          error => {
            this.msg = error;
          }
        );
      } else {
        this.service.put(this.apiEndpoints.BASE_GET_IRF_SUBMIT_ENDPOINT, this.iRFDetail).subscribe(
          data => {
            this.msg = data;
            this.router.navigate(['/home/irf-consultant-home']);
          },
          error => {
            this.msg = error;
          }
        );
      }
    }

  }

  onSave() {
    this.msg = '';
    if (this.iRFOPS === DBOperation.insert) {
      this.service.post(this.apiEndpoints.BASE_GET_IRF_SAVE_ENDPOINT, this.iRFDetail).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/irf-consultant-home']);
        },
        error => {
          this.msg = error;
        }
      );
    } else if (this.iRFOPS === DBOperation.update) {
      this.service.put(this.apiEndpoints.BASE_GET_IRF_SAVE_ENDPOINT, this.iRFDetail).subscribe(
        data => {
          this.msg = data;
          this.router.navigate(['/home/irf-consultant-home']);
        },
        error => {
          this.msg = error;
        }
      );
    }


  }

  editCandidate = (candidate: IRFCandidate, index: number) => {
    this.candidateops = DBOperation.update;
    this.IRFCandidate = JSON.parse(JSON.stringify(this.iRFDetail.Candidates[index]));
    this.sourcingConsultantId = this.IRFCandidate.SourcingConsultantID;
    this.sourcingConsultantLabel = this.IRFCandidate.SourcingConsultant.text;
    const dobObj = new Date(this.IRFCandidate.DateOfJoining);
    this.dobCtrl = {
      date: {
        year: dobObj.getFullYear(),
        month: dobObj.getMonth() + 1,
        day: dobObj.getDate()
      }
    };
    this.candidateModalBtnTitle = "Update";
    this.candidateModalTitle = "Update Candidate";
    this.selectedIndex = index;
    this.addCandidateModal.open();
  }

  editRevenueSharing = (revenue: IRFRevenueSharing, index: number) => {
    this.revenueOps = DBOperation.update;
    this.IRFRevenue = JSON.parse(JSON.stringify(this.iRFDetail.RevenueSharing[index]));
    this.sourcingRevenueConsultantId = this.IRFRevenue.SourcingConsultantId;
    this.sourcingRevenueConsultantLabel = this.IRFRevenue.SourcingConsultant.text;
    this.SetEntityOnEdit(this.IRFRevenue.EntityType, this.IRFRevenue.EntityID);
    this.revenueModalBtnTitle = "Update";
    this.revenueModalTitle = "Update Sharing";
    this.selectedIndex = index;
    this.addRevenueModal.open();
  }

  deleteCandidate = () => {
    //this.iRFDetail.Candidates.splice(this.selectedIndex, 1);
    this.iRFDetail.Candidates[this.selectedIndex].RowState = 'D';
    this.candidateDeletemodal.dismiss();
  }

  deleteRevenue = () => {
    //this.iRFDetail.RevenueSharing.splice(this.selectedIndex, 1);
    this.iRFDetail.RevenueSharing[this.selectedIndex].RowState = 'D';
    this.revenueDeletemodal.dismiss();
  }

  openRevenueDeleteModal = (index: number) => {
    this.selectedIndex = index;
    this.revenueDeletemodal.open();
  }

  openCandidateDeleteModal = (index: number) => {
    this.selectedIndex = index;
    this.candidateDeletemodal.open();
  }

  openCandidatePopup = () => {
    this.dobCtrl = null;
    this.sourcingConsultantLabel = '';
    this.candidateops = DBOperation.insert;
    this.IRFCandidate = new IRFCandidate();
    this.IRFCandidate.RowState = "I";
    this.sourcingConsultant = null;
    this.candidateModalBtnTitle = "Save";
    this.candidateModalTitle = "Add Candidate";
    this.addCandidateModal.open();
  }

  openRevenuePopup = () => {
    this.branchId = null;
    this.businessPartnerId = null;
    this.cityBusinessPartnerId = null;
    this.revenueOps = DBOperation.insert;
    this.IRFRevenue = new IRFRevenueSharing();
    this.IRFRevenue.RowState = 'I';
    this.revenueModalBtnTitle = "Save";
    this.revenueModalTitle = "Add Revenue Sharing";
    this.addRevenueModal.open();
  }

  addRevenue = () => {

    if (!this.validatePercentageGPSharing()) {
      return;
    }

    // if (this.gpSHaringSourceDropDown) {
    //   this.IRFRevenue.SourcingConsultant = this.gpSHaringSourceDropDown;
    // }
    this.IRFRevenue.SourcingConsultantId = this.sourcingRevenueConsultantId;

    if (this.revenueOps === DBOperation.insert) {
      if (!this.iRFDetail.RevenueSharing) {
        this.iRFDetail.RevenueSharing = new Array<IRFRevenueSharing>();
      }
      this.iRFDetail.RevenueSharing.push(this.IRFRevenue);

    } else {
      this.iRFDetail.RevenueSharing[this.selectedIndex] = this.IRFRevenue;
    }
    this.calculateComputedValue();
    this.addRevenueModal.dismiss();
  }

  addCandidate = () => {
    this.IRFCandidate.SourcingConsultantID = this.sourcingConsultantId;
    // if (this.candidateSourceDropDown) {
    //   this.IRFCandidate.SourcingConsultant = this.candidateSourceDropDown;
    // }
    if (this.candidateops === DBOperation.insert) {
      if (!this.iRFDetail.Candidates) {
        this.iRFDetail.Candidates = new Array<IRFCandidate>();
      }
      this.iRFDetail.Candidates.push(this.IRFCandidate);
    } else {
      this.iRFDetail.Candidates[this.selectedIndex] = this.IRFCandidate;
    }
    this.addCandidateModal.dismiss();
  }

  onDateChanged(event: IMyDateModel) {
    this.IRFCandidate.DateOfJoining = new Date(event.date.year, event.date.month - 1, event.date.day);
    this.IRFCandidate.DateOfJoiningStr = event.formatted;
  }

  loadUsers() {
    this.service.get(this.apiEndpoints.BASE_ACTIVE_USER_ENDPOINT)
      .subscribe(c => {
        this.users = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  onUserChange(item: DropDown) {
    this.sourcingConsultantId = Number(item.id);
    this.sourcingConsultantLabel = item.text;
    this.IRFCandidate.SourcingConsultant = item;
  }

  onClientChange(item: DropDown) {
    this.iRFDetail.ClientID = Number(item.id);
    this.loadClients();
  }

  clearUser(item: any) {
    this.sourcingConsultantId = null;
  }

  setEntityId = (entityType: string) => {
    switch (entityType) {
      case "BusinessPartner":
        this.IRFRevenue.EntityID = this.businessPartnerId;
        break;
      case "CityBusinessPartner":
        this.IRFRevenue.EntityID = this.cityBusinessPartnerId;
        break;
      case "CIEL":
        this.IRFRevenue.EntityID = this.branchId;
        break;
      default:
        this.IRFRevenue.EntityID = 0;
        break;
    }
  }

  SetEntityOnEdit(entityType: string, entityId: number) {
    switch (entityType) {
      case "BusinessPartner":
        this.businessPartnerId = entityId;
        break;
      case "CityBusinessPartner":
        this.cityBusinessPartnerId = entityId;
        break;
      case "CIEL":
        this.branchId = entityId;
        break;
    }
  }

  onChangeEntityType = () => {
    this.IRFRevenue.EntityID = null;
    this.branchId = null;
    this.businessPartnerId = null;
    this.cityBusinessPartnerId = null;
  }

  getEntityValue = (type: string, value: number) => {
    if (value) {
      if (type === 'BusinessPartner') {
        for (const item of this.masterData.BusinessPartners) {
          if (item.Id == value) {
            return item.BusinessPartnerCode + ' - ' + item.BusinessPartnerName;
          }
        }
      }
    }

    if (type === 'CityBusinessPartner') {
      for (const item of this.masterData.CityBusinessPartners) {
        if (item.Id == value) {
          return item.CityBusinessPartnerCode + ' - ' + item.CityBusinessPartnerName;
        }
      }
    }

    if (type === 'CIEL') {
      for (const item of this.masterData.Branches) {
        if (item.ID == value) {
          return item.Code + ' - ' + item.Description;
        }
      }
    }
  }

  calculateComputedValue() {
    if (this.iRFDetail.GrossProfit) {
      for (const item of this.iRFDetail.RevenueSharing) {
        if (item.SharingType === 'FixedValue') {
          item.ComputedValue = item.Value;
        }

        if (item.SharingType === 'Percentage') {
          item.ComputedValue = parseFloat(((item.Value / 100) * this.iRFDetail.GrossProfit).toFixed(this.applicationConfig.DecimalRounOffPlaces));
        }
        item.GrossProfit = this.iRFDetail.GrossProfit;
      }
    }
  }

  validateGPSharing = () => {
    if (this.iRFDetail.RevenueSharing == null || this.iRFDetail.RevenueSharing.length === 0) {
      this.msg = "GP sharing cannot be empty";
      return false;
    }

    let totalComputedValue = 0;

    for (const item of this.iRFDetail.RevenueSharing) {
      if (item.EntityType == null || item.EntityType === '') {
        this.msg = "Entity type cannot be empty in Revenue sharing";
        return false;
      }

      if (item.Value == null || item.Value <= 0) {
        this.msg = "Entity value cannot be empty or zero";
        return false;
      }

      if (item.RowState !== 'D') {
        totalComputedValue += item.ComputedValue;
      }
    }

    if (totalComputedValue !== this.iRFDetail.GrossProfit) {
      this.msg = "GP sharing should be equivalent to Gross Profit";
      return false;
    }

    return true;
  }

  validateSubmit = () => {
    if (this.iRFDetail.IRF_Type === 'Selection' && (this.iRFDetail.Candidates == null || this.iRFDetail.Candidates.length === 0)) {
      this.msg = "Candidates cannot be empty for the Selection IRF Type";
      return false;
    }

    if (!this.iRFDetail.ClientID) {
      this.msg = "Client cannot be empty";
      return false;
    }

    if (!this.validateGPSharing()) {
      return false;
    }

    return true;
  }

  openAtatchmentDeleteModal = (index: number) => {
    this.selectedAttachmentId = index;
    this.attachmentDeletemodal.open();
  }


  deleteAttachment = () => {
    this.iRFDetail.Attachments[this.selectedAttachmentId].RowState = "D";
    this.attachmentDeletemodal.dismiss();

  }

  onApprove = () => {
    this.irfReviewerMessage = "Do you want to approve the submitted IRF?"
    this.iRFDetail.Status = 3;
    this.irfReviewmodal.open();
  }

  onReject = () => {
    this.irfReviewerMessage = "Do you want to reject the submitted IRF?"
    this.iRFDetail.Status = 4;
    this.irfReviewmodal.open();
  }

  saveReview = () => {
    this.service.post(this.apiEndpoints.BASE_GET_IRF_REVIEW_ENDPOINT, this.iRFDetail).subscribe(
      data => {
        this.msg = data;
        this.router.navigate(['/home/irf-reviewer-home']);
      },
      error => {
        this.msg = error;
      }
    );
  }

  openConfirmRevenueSharing() {
    if (!this.validateGPSharing()) {
      return;
    }
    this.updateRevenueSharing.open();
  }

  updateRS = () => {
    this.service.put(this.apiEndpoints.BASE_GET_RS_UPDATE_HOME_ENDPOINT, this.iRFDetail).subscribe(
      data => {
        this.msg = data;
        this.updateRevenueSharing.dismiss();
      },
      error => {
        this.msg = error;
      }
    );
  }

  candidateSourcingConsultantChange(item: any) {
    this.candidateSourceDropDown = new DropDown();
    this.candidateSourceDropDown.id = item.id;
    this.candidateSourceDropDown.text = item.text;
    this.candidateSourceDropDownArray = new Array<DropDown>();
    this.candidateSourceDropDownArray.push(this.candidateSourceDropDown);
  }

  gpSharingSourcingConsultantChange(item: any) {
    this.gpSHaringSourceDropDown = new DropDown();
    this.gpSHaringSourceDropDown.id = item.id;
    this.gpSHaringSourceDropDown.text = item.text;
  }

  validatePercentageGPSharing() {
    if (this.IRFRevenue.SharingType === "Percentage") {
      if (this.IRFRevenue.Value > 100 || this.IRFRevenue.Value < 1) {
        this.gpSharingErrorMsg = 'Value should be 1 to 100';
        return false;
      } else {
        this.gpSharingErrorMsg = '';
        return true;
      }
    }
    return true;
  }


  onRevenueUserChange(item: DropDown) {
    this.sourcingRevenueConsultantId = Number(item.id);
    this.sourcingRevenueConsultantLabel = item.text;
    this.IRFRevenue.SourcingConsultant = item;
  }

  onRevenueclearUser(item: any) {
    this.sourcingRevenueConsultantId = null;
  }
}
