import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceImportComponent } from './invoice-import.component';

describe('InvoiceImportComponent', () => {
  let component: InvoiceImportComponent;
  let fixture: ComponentFixture<InvoiceImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
