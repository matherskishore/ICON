import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteReviewComponent } from './credit-note-review.component';

describe('CreditNoteReviewComponent', () => {
  let component: CreditNoteReviewComponent;
  let fixture: ComponentFixture<CreditNoteReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditNoteReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
