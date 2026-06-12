import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tva } from './tva';

describe('Tva', () => {
  let component: Tva;
  let fixture: ComponentFixture<Tva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
