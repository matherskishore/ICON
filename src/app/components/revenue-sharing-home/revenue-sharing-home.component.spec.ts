import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueSharingHomeComponent } from './revenue-sharing-home.component';

describe('RevenueSharingHomeComponent', () => {
  let component: RevenueSharingHomeComponent;
  let fixture: ComponentFixture<RevenueSharingHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevenueSharingHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueSharingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
