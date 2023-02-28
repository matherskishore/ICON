import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisapatchHistoryComponent } from './disapatch-history.component';

describe('DisapatchHistoryComponent', () => {
  let component: DisapatchHistoryComponent;
  let fixture: ComponentFixture<DisapatchHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisapatchHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisapatchHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
