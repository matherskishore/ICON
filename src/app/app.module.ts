import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { AppComponent } from './app.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { AppRoute } from './app.routing';
import { RouterModule } from '@angular/router';
import { Service } from './Service/service';
import { ConfigService } from './Service/config.service';
import { MomentModule } from 'angular2-moment';
import { MyDatePickerModule } from 'mydatepicker';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ChartsModule } from 'ng2-charts';
import { ConsultantHomeComponent } from './components/consultant-home/consultant-home.component';
import { ClientMasterComponent } from './components/client-master/client-master.component';
import { LocaionMasterComponent } from './components/location-master/location-master.component';
import { SubmitIrfComponent } from './components/submit-irf/submit-irf.component';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { TabsModule } from "ngx-tabs";
import { IrfHomeComponent } from './components/irf-home/irf-home.component';
import { FileDownloadComponent } from './components/file-download/file-download.component';
import { IrfReviewerHomeComponent } from './components/irf-reviewer-home/irf-reviewer-home.component';
import { InvoiceImportComponent } from './components/invoice-import/invoice-import.component';
import { InvoiceViewComponent } from './components/invoice-view/invoice-view.component';
import { RevenueSharingHomeComponent } from './components/revenue-sharing-home/revenue-sharing-home.component';
import { ClaimSheetReportComponent } from './components/claim-sheet-report/claim-sheet-report.component';
import { SelectModule } from 'ng2-select';
import { InvoiceReportComponent } from './components/invoice-report/invoice-report.component';
import { ReportInputComponent } from './directives/report-input/report-input.component';
import { MgmtHomeComponent } from './components/mgmt-home/mgmt-home.component';
import { NgxLocalizedNumbers } from "ngx-localized-numbers";
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { RaiseCreditNoteComponent } from './components/raise-credit-note/raise-credit-note.component';
import { CreditNoteSummaryComponent } from './components/credit-note-summary/credit-note-summary.component';
import { CreditNoteReviewComponent } from './components/credit-note-review/credit-note-review.component';
import { SuspenseAccountComponent } from './components/suspense-account/suspense-account.component';
import { SuspenseAccountSummaryComponent } from './components/suspense-account-summary/suspense-account-summary.component';
// tslint:disable-next-line:max-line-length
import { SuspenseAccountReviewSummaryComponent } from './components/suspense-account-review-summary/suspense-account-review-summary.component';
import { DisapatchEntryComponent } from './components/disapatch-entry/disapatch-entry.component';
import { DisapatchHistoryComponent } from './components/disapatch-history/disapatch-history.component';
import { PublishIrfComponent } from './components/publish-irf/publish-irf.component';
import { IrfIntegrationStatusComponent } from './components/irf-integration-status/irf-integration-status.component';
import { ImportProcessedInvoiceComponent } from './components/import-processed-invoice/import-processed-invoice.component';
import { InvoiceUploadComponent } from './components/invoice-upload/invoice-upload.component';
import { ClientSearchComponent } from './components/client-search/client-search.component';
import { CreditNoteReportComponent } from './components/credit-note-report/credit-note-report.component';
import { PaginationComponent1 } from './components/pagination/pagination.component';
import { PaginationComponent } from 'angular2-datagrid';
import { CreditNoteUploadComponent } from './components/credit-note-upload/credit-note-upload.component';
import { PayoutRequestComponent1 } from './components/payout-request-r/payout-request-r.component';
import { PayoutRequestComponent } from './components/payout-request-c/payout-request-c.component';
import { PayoutRequestComponent2 } from './components/payout-request-a/payout-request-a.component';
import { ImportProcessedCreditNoteComponent } from './components/import-processed-credit-note/import-processed-credit-note.component';
import { SubmitCSRComponent } from './components/submit-csr/submit-csr.component';
import { enumHelper } from './directives/enumHelper';

@NgModule({

  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(AppRoute),
    Ng2Bs3ModalModule,
    MyDatePickerModule,
    ChartsModule,
    MomentModule,
    FileUploadModule,
    TabsModule,
    SelectModule,
    NgxLocalizedNumbers.forRoot(),
    HttpClientModule,
    AgGridModule.withComponents([])
  ],
  declarations: [
    AppComponent,
    SideBarComponent,
    TopBarComponent,
    LoginComponent,
    HomeComponent,
    ConsultantHomeComponent,
    ClientMasterComponent,
    LocaionMasterComponent,
    SubmitIrfComponent,
    FileUploadComponent,
    IrfHomeComponent,
    FileDownloadComponent,
    IrfReviewerHomeComponent,
    PayoutRequestComponent1,
    InvoiceImportComponent,
    InvoiceViewComponent,
    RevenueSharingHomeComponent,
    ClaimSheetReportComponent,
    InvoiceReportComponent,
    ReportInputComponent,
    MgmtHomeComponent,
    RaiseCreditNoteComponent,
    CreditNoteSummaryComponent,
    CreditNoteReviewComponent,
    SuspenseAccountComponent,
    SuspenseAccountSummaryComponent,
    SuspenseAccountReviewSummaryComponent,
    DisapatchEntryComponent,
    DisapatchHistoryComponent,
    PublishIrfComponent,
    IrfIntegrationStatusComponent,
    ImportProcessedInvoiceComponent,
    InvoiceUploadComponent,
    CreditNoteUploadComponent,
    ClientSearchComponent,
    CreditNoteReportComponent,
    PaginationComponent,
    PaginationComponent1,
    PayoutRequestComponent,
    PayoutRequestComponent2,
    ImportProcessedCreditNoteComponent,
    SubmitCSRComponent
  ],
  exports: [
    PaginationComponent,
    PaginationComponent1
  ],
  providers: [{ provide: LocationStrategy, useValue: '/ciel', useClass: HashLocationStrategy }, Service, ConfigService, enumHelper],
  bootstrap: [AppComponent]
})
export class AppModule { }
