import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitCSRComponent } from './submit-csr.component';

describe('SubmitCSRComponent', () => {
  let component: SubmitCSRComponent;
  let fixture: ComponentFixture<SubmitCSRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitCSRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitCSRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
