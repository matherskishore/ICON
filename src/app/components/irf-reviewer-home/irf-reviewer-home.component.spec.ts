import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IrfReviewerHomeComponent } from './irf-reviewer-home.component';

describe('IrfReviewerHomeComponent', () => {
  let component: IrfReviewerHomeComponent;
  let fixture: ComponentFixture<IrfReviewerHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IrfReviewerHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IrfReviewerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
