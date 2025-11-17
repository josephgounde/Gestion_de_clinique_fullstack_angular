import { TestBed } from '@angular/core/testing';

import { FacturationService } from './facturation.service';

describe('FacturationService', () => {
  let service: FacturationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
