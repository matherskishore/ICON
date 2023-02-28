import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishIrfComponent } from './publish-irf.component';

describe('PublishIrfComponent', () => {
  let component: PublishIrfComponent;
  let fixture: ComponentFixture<PublishIrfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublishIrfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishIrfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
