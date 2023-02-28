import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocaionMasterComponent } from './location-master.component';

describe('ClientMasterComponent', () => {
  let component: LocaionMasterComponent;
  let fixture: ComponentFixture<LocaionMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocaionMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocaionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
