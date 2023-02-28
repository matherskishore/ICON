import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProcessedInvoiceComponent } from './import-processed-invoice.component';

describe('ImportProcessedInvoiceComponent', () => {
  let component: ImportProcessedInvoiceComponent;
  let fixture: ComponentFixture<ImportProcessedInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportProcessedInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportProcessedInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
