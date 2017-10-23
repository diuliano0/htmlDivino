import { TestBed, inject } from '@angular/core/testing';

import { PreloaderService } from './preloader.service';

describe('PreloaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreloaderService]
    });
  });

  it('should ...', inject([PreloaderService], (service: PreloaderService) => {
    expect(service).toBeTruthy();
  }));
});
