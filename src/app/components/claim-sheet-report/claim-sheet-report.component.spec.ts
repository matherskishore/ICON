import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSheetReportComponent } from './claim-sheet-report.component';

describe('ClaimSheetReportComponent', () => {
  let component: ClaimSheetReportComponent;
  let fixture: ComponentFixture<ClaimSheetReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimSheetReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimSheetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
