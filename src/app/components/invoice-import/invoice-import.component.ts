import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Invoice } from '../../model/Invoice';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { PaginationComponent1 } from '../pagination/pagination.component';
import { NgDataGridModel } from 'angular2-datagrid';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { Common } from '../../shared/common';
import { FileUploader } from 'ng2-file-upload';
import { Collection } from '../../model/collection';
import { CreditNote } from '../../model/CreditNote';

@Component({
  selector: 'app-invoice-import',
  templateUrl: './invoice-import.component.html',
  styleUrls: ['./invoice-import.component.css']
})
export class InvoiceImportComponent implements OnInit {
  _invoice: Invoice;
  _invoices: NgDataGridModel<Invoice>;
  _collections: NgDataGridModel<Collection>;
  _creditNotes: NgDataGridModel<CreditNote>;
  uploadTypes: Array<string>;
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  @ViewChild('publishmodal') publishmodal: ModalComponent;
  usrStatusArray: string[];
  roleForm: FormGroup;
  dbops: DBOperation;
  apiEndpoints = Common.GetEndPoints();;
  selectedUploadType: string;
  isUploadDisabled: boolean;
  URL = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GET_UPLAOD_ENDPOINT;
  ispublishenabled: boolean;
  allowedMimeType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  public uploader: FileUploader;
  isValidFile: boolean;

  constructor(private service: Service, private configService: ConfigService) {
    this.setUploaderSetup();
  }

  setUploaderSetup = () => {
    this.uploader = new FileUploader(
      {
        url: this.URL,
        authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
        allowedMimeType: this.allowedMimeType,
        maxFileSize: 4 * 1024 * 1024 // 4 MB
      });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status == 200) {
        this.validateFile(response);
        this.ispublishenabled = true;
      }
    };
  }

  ngOnInit() {
    this._invoices = new NgDataGridModel<Invoice>([]);
    this._collections = new NgDataGridModel<Collection>([]);
    this._creditNotes = new NgDataGridModel<CreditNote>([]);
    this.loadUploadTypes();
  }

  reset = () => {
    this.msg = '';
    this._invoices = new NgDataGridModel<Invoice>([]);
    this._collections = new NgDataGridModel<Collection>([]);
    this._creditNotes = new NgDataGridModel<CreditNote>([]);
    this.setUploaderSetup();
  }

  validateFile = (documetId: number) => {
    this.indLoading = true;
    const options = new RequestOptions({ params: { uploadType: this.selectedUploadType, id: documetId } });
    this.service.get(this.apiEndpoints.BASE_GET_UPLOAD_VALIDATE_FILE_ENDPOINT, options)
      .subscribe(c => {
        this.msg = c;
        if (this.msg === '') {
          this.isValidFile = true;
          this.loadProcessedData(documetId);
        } else {
          this.isValidFile = false;
        }
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  loadProcessedData = (documetId: number) => {
    switch (this.selectedUploadType) {
      case 'Invoices': {
        this.getInvoices(documetId);
        break;
      }
      case 'CollectionAndOutstanding': {
        this.getCollections(documetId);
        break;
      }
      case 'CreditNote': {
        this.getCreditNotes(documetId);
        break;
      }
    }

  }

  getCreditNotes(documetId: number) {
    this.indLoading = true;
    const options = new RequestOptions({ params: { id: documetId } });
    this.service.get(this.apiEndpoints.BASE_GET_UPLOAD_CREDITNOTE_ENDPOINT, options)
      .subscribe(c => {
        this._creditNotes.items = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  loadUploadTypes() {
    this.indLoading = true;
    this.service.get(this.apiEndpoints.BASE_GET_UPLOAD_TYPES_ENDPOINT)
      .subscribe(c => {
        this.uploadTypes = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  getCollections(documetId: number) {
    this.indLoading = true;
    const options = new RequestOptions({ params: { id: documetId } });
    this.service.get(this.apiEndpoints.BASE_GET_UPLOAD_COLLECTION_ENDPOINT, options)
      .subscribe(c => {
        this._collections.items = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  getInvoices(documetId: number) {
    this.indLoading = true;
    const options = new RequestOptions({ params: { id: documetId } });
    this.service.get(this.apiEndpoints.BASE_GET_UPLOAD_INVOICE_ENDPOINT, options)
      .subscribe(c => {
        this._invoices.items = c;
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }


  openPublishConfirmation = () => {
    this.publishmodal.open();
  }

  getMessages = (items: Array<any>) => {
    if (items) {
      let successCount = 0;
      items.forEach(element => {
        if (element.IsPublished) {
          successCount++;
        }
      });

      switch (this.selectedUploadType) {
        case 'Invoices': {
          return successCount.toString() + ' Invoice(s) have been published successfully';
        }
        case 'CollectionAndOutstanding': {
          return successCount.toString() + ' Collection(s) have been published successfully';
        }
        case 'CreditNote': {
          return successCount.toString() + ' CreditNote(s) have been published successfully';
        }
      }


    }
  }

  publish = () => {
    switch (this.selectedUploadType) {
      case 'Invoices': {
        this.service.post(this.apiEndpoints.BASE_GET_UPLOAD_INVOICE_PUBLISH_ENDPOINT, this._invoices.items).subscribe(
          data => {
            this._invoices.items = data;
            this.publishmodal.dismiss();
            this.msg = this.getMessages(this._invoices.items);
            this.ispublishenabled = false;
          },
          error => {
            this.msg = error;
          }
        );
        break;
      }
      case 'CollectionAndOutstanding': {
        this.service.post(this.apiEndpoints.BASE_GET_UPLOAD_COLLECTION_PUBLISH_ENDPOINT, this._collections.items).subscribe(
          data => {
            this._collections.items = data;
            this.publishmodal.dismiss();
            this.msg = this.getMessages(this._collections.items);
            this.ispublishenabled = false;
          },
          error => {
            this.msg = error;
          }
        );
        break;
      }
      case 'CreditNote': {
        this.service.post(this.apiEndpoints.BASE_GET_UPLOAD_CREDITNOTE_PUBLISH_ENDPOINT, this._creditNotes.items).subscribe(
          data => {
            this._creditNotes.items = data;
            this.publishmodal.dismiss();
            this.msg = this.getMessages(this._creditNotes.items);
            this.ispublishenabled = false;
          },
          error => {
            this.msg = error;
          }
        );
        break;
      }
    }

  }

}
