import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitIrfComponent } from './submit-irf.component';

describe('SubmitIrfComponent', () => {
  let component: SubmitIrfComponent;
  let fixture: ComponentFixture<SubmitIrfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitIrfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitIrfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
