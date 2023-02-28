import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantHomeComponent } from './consultant-home.component';

describe('ConsultantHomeComponent', () => {
  let component: ConsultantHomeComponent;
  let fixture: ComponentFixture<ConsultantHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultantHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultantHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
