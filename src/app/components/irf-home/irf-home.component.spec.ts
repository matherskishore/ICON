import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IrfHomeComponent } from './irf-home.component';

describe('IrfHomeComponent', () => {
  let component: IrfHomeComponent;
  let fixture: ComponentFixture<IrfHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IrfHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IrfHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
