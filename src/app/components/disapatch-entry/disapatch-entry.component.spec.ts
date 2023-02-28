import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisapatchEntryComponent } from './disapatch-entry.component';

describe('DisapatchEntryComponent', () => {
  let component: DisapatchEntryComponent;
  let fixture: ComponentFixture<DisapatchEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisapatchEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisapatchEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
