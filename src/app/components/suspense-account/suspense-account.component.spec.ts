import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspenseAccountComponent } from './suspense-account.component';

describe('SuspenseAccountComponent', () => {
  let component: SuspenseAccountComponent;
  let fixture: ComponentFixture<SuspenseAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuspenseAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuspenseAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
