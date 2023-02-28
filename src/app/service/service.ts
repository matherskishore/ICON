import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { LoggedInUser } from "../model/loggedinuser";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/catch";
import { Json } from "angular2-datagrid/node_modules/@angular/core/src/facade/lang";

@Injectable()
export class Service {
  api_endpoints: any;
  loggedInUser = LoggedInUser;

  constructor(private _http: Http) {}

  getFullUrl(endpoint: string) {
    return (
      JSON.parse(sessionStorage.getItem("api_endpoints")).BASE_URL + endpoint
    );
  }

  getRequestHeader() {
    const userId = this.getLoggedInUser();
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append(
      "Authorization",
      sessionStorage.getItem("token_type") +
        " " +
        sessionStorage.getItem("access_token")
    );
    return headers;
  }

  get(url: string, options?: RequestOptions): Observable<any> {
    url = this.getFullUrl(url);
    const userId = this.getLoggedInUser();
    if (options == null || options === undefined) {
      options = new RequestOptions();
    }
    options.headers = this.getRequestHeader();
    return this._http
      .get(url, options)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return Observable.throw(error.json().error || "Server error");
  }

  post(url: string, model: any): Observable<any> {
    url = this.getFullUrl(url);
    const body = JSON.stringify(model);
    const options = new RequestOptions({ headers: this.getRequestHeader() });
    return this._http
      .post(url, body, options)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  put(url: string, model: any): Observable<any> {
    url = this.getFullUrl(url);
    let body = JSON.stringify(model);
    const userId = this.getLoggedInUser();
    let options = new RequestOptions({ headers: this.getRequestHeader() });
    return this._http
      .put(url, body, options)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  delete(url: string, id: number): Observable<any> {
    url = this.getFullUrl(url);
    const userId = this.getLoggedInUser();
    let options = new RequestOptions({ headers: this.getRequestHeader() });
    return this._http
      .delete(url + "?Id=" + id.toString(), options)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  getLoggedInUser() {
    const loggedInUser = new LoggedInUser();
    const user = loggedInUser.getLoggedUser();
    if (user != null) {
      return loggedInUser.getLoggedUser().UserId;
    } else {
      return 0;
    }
  }

  postToken(url: string, model: any): Observable<any> {
    url = this.getFullUrl(url);
    return this._http
      .post(url, model)
      .map((response: Response) => <any>response.json())
      .catch(this.handleError);
  }

  downloadData(url: string, model: any): Observable<Object[]> {
    url = this.getFullUrl(url);
    return Observable.create(observer => {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader(
        "Authorization",
        sessionStorage.getItem("token_type") +
          " " +
          sessionStorage.getItem("access_token")
      );
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.responseType = "blob";
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var contentType =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var blob = new Blob([xhr.response], { type: contentType });
            observer.next(blob);
            observer.complete();
          } else {
            if (xhr.status === 0) {
              observer.error("Server is unreachable");
            } else if (xhr.status === 404) {
              // tslint:disable-next-line:one-line
              observer.error("Data not available");
            } else if (xhr.status === 401) {
              observer.error("The caller is not authenticated");
            } else {
              // tslint:disable-next-line:one-line
              const errorMsg = xhr.response();
              observer.error(errorMsg);
            }
          }
        }
      };
      xhr.send(Json.stringify(model));
    });
  }
}
