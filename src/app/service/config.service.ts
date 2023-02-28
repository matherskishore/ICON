import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';


@Injectable()
export class ConfigService {
  constructor(private _http: Http) { }

  get(): Observable<any> {
    return this._http.get('assets/config.json')
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    let errorMsg: string;
    if (error.status === 0) {
      errorMsg = 'Server is unreachable';
    }
    else {
      errorMsg = error.json();
    }
    return Observable.throw(errorMsg);
  }

  getAppConfig(): Observable<any> {
    return this._http.get('assets/app.config.json')
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

}
