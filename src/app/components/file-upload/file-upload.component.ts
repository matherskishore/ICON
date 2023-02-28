import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { Service } from '../../Service/service';
import { Status, DBOperation } from '../../types/types';
import { Common } from '../../shared/common';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { PaginationComponent1 } from "../pagination/pagination.component";
import { NgDataGridModel } from 'angular2-datagrid';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input("documentIds") documentIds: Array<number>;
  @Input("allowMultiple") allowMultiple: Array<number>;
  @Input("disabled") disabled: boolean;
  @Output() documentIdsChange = new EventEmitter<Array<number>>();
  uploadEndpoints = Common.GetEndPoints();
  msg: string;
  URL = this.uploadEndpoints.BASE_URL + this.uploadEndpoints.BASE_GET_UPLAOD_ENDPOINT;
  public uploader: FileUploader = new FileUploader(
    {
      url: this.URL,
      authToken: sessionStorage.getItem("token_type") + " " + sessionStorage.getItem("access_token"),
    });
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;


  constructor(private service: Service, private configService: ConfigService) {
    this.documentIds = new Array<number>();
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (status == 200) {
        this.documentIds.push(response);
        this.documentIdsChange.emit(this.documentIds);
      }
    };
  }

  ngOnInit() {

  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

}
