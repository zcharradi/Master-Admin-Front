import { ComponentFixture, TestBed } from '@angular/core/testing';

import { articles } from './articles.routes';

describe('articles', () => {
  let component: articles;
  let fixture: ComponentFixture<articles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [articles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(articles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
