import { TestBed } from '@angular/core/testing';

import { SecretaireService } from './secretaire.service';

describe('SecretaireService', () => {
  let service: SecretaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecretaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
