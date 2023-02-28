import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspenseAccountSummaryComponent } from './suspense-account-summary.component';

describe('SuspenseAccountSummaryComponent', () => {
  let component: SuspenseAccountSummaryComponent;
  let fixture: ComponentFixture<SuspenseAccountSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuspenseAccountSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuspenseAccountSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
