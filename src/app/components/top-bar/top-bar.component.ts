import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigService } from '../../Service/config.service';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import { ILoginUser } from '../../model/userlogin';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { Service } from '../../Service/service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  user: any;

  constructor(private fb: FormBuilder, private _roleService: Service,
    private route: ActivatedRoute, private router: Router, private _configService: ConfigService) {
    this.user = '';
  }

  ngOnInit() {
    this.user = sessionStorage.getItem('currentUser');
    if (this.user !== null && this.user !== '') {
      const userObject = JSON.parse(this.user);
      this.user = userObject;
    }

  }

  onLogout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }


}
