import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IrfIntegrationStatusComponent } from './irf-integration-status.component';

describe('IrfIntegrationStatusComponent', () => {
  let component: IrfIntegrationStatusComponent;
  let fixture: ComponentFixture<IrfIntegrationStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IrfIntegrationStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IrfIntegrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
