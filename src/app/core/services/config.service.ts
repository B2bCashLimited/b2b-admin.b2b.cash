import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  apiUrl = environment.apiUrl;
  chatUrl = environment.chatUrl;
  frontUrl = environment.front;
  locale = 'Ru';
  name = 'nameRu';
  oauthUrl = environment.oauthUrl;
  serverUrl = environment.serverUrl;
  showSnackBar$ = new Subject<{ message: string, action?: string, duration?: number }>();

  private _loadingSpinner = false;

  get loadingSpinner(): boolean {
    return this._loadingSpinner;
  }

  set loadingSpinner(value: boolean) {
    if (this._loadingSpinner !== value) {
      this._loadingSpinner = value;
    }
  }
}
