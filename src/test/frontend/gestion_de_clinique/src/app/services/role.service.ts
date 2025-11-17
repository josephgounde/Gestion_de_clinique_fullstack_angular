
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root'})
export class RoleService {
  constructor(private auth: AuthService) {}

  get role() {
    return this.auth.currentUser?.role || null;
  }
}
