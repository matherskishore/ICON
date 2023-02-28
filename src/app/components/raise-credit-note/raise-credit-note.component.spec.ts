import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseCreditNoteComponent } from './raise-credit-note.component';

describe('RaiseCreditNoteComponent', () => {
  let component: RaiseCreditNoteComponent;
  let fixture: ComponentFixture<RaiseCreditNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaiseCreditNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseCreditNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
