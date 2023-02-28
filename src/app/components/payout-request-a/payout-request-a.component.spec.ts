import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutRequestComponent2 } from './payout-request-a.component';

describe('PayoutRequestComponent', () => {
  let component: PayoutRequestComponent2;
  let fixture: ComponentFixture<PayoutRequestComponent2>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutRequestComponent2 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutRequestComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
