import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent1 } from './pagination.component';

describe('PaginationComponent1', () => {
  let component: PaginationComponent1;
  let fixture: ComponentFixture<PaginationComponent1>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginationComponent1 ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
