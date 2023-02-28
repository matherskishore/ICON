import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteReportComponent } from './credit-note-report.component';

describe('CreditNoteReportComponent', () => {
  let component: CreditNoteReportComponent;
  let fixture: ComponentFixture<CreditNoteReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditNoteReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
