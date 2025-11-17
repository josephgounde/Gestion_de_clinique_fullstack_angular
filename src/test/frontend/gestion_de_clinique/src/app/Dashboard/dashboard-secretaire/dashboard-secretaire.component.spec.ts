import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSecretaireComponent } from './dashboard-secretaire.component';

describe('DashboardSecretaireComponent', () => {
  let component: DashboardSecretaireComponent;
  let fixture: ComponentFixture<DashboardSecretaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSecretaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSecretaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
