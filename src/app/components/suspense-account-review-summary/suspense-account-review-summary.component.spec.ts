import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspenseAccountReviewSummaryComponent } from './suspense-account-review-summary.component';

describe('SuspenseAccountReviewSummaryComponent', () => {
  let component: SuspenseAccountReviewSummaryComponent;
  let fixture: ComponentFixture<SuspenseAccountReviewSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuspenseAccountReviewSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuspenseAccountReviewSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
