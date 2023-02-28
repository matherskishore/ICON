import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteUploadComponent } from './credit-note-upload.component';

describe('CreditNoteUploadComponent', () => {
  let component: CreditNoteUploadComponent;
  let fixture: ComponentFixture<CreditNoteUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditNoteUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
