import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutRequestComponent1 } from './payout-request-r.component';

describe('PayoutRequestComponent', () => {
  let component: PayoutRequestComponent1;
  let fixture: ComponentFixture<PayoutRequestComponent1>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutRequestComponent1 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutRequestComponent1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
