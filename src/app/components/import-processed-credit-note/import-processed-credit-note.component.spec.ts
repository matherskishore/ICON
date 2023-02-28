import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProcessedCreditNoteComponent } from './import-processed-credit-note.component';

describe('ImportProcessedCreditNoteComponent', () => {
  let component: ImportProcessedCreditNoteComponent;
  let fixture: ComponentFixture<ImportProcessedCreditNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportProcessedCreditNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportProcessedCreditNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
