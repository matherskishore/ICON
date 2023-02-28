import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MgmtHomeComponent } from './mgmt-home.component';

describe('MgmtHomeComponent', () => {
  let component: MgmtHomeComponent;
  let fixture: ComponentFixture<MgmtHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MgmtHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MgmtHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
