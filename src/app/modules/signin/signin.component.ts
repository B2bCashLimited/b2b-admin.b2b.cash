import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '@b2b/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {clearLocalStorage} from '@b2b/utils';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';
import {Subscription} from 'rxjs';

@ClearSubscriptions()
@Component({
  selector: 'b2b-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnDestroy, OnInit {
  formGroup: FormGroup;
  message: string;

  private _continueUrl: string;
  private _sub: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _route: ActivatedRoute) {
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit(): void {
    this._continueUrl = this._route.snapshot.queryParams['continue'];
    this.formGroup = this._formBuilder.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    });
  }

  onSigninClick(): void {
    const {username, password} = this.formGroup.value;
    clearSubscription(this._sub);
    this._sub = this._authService.signin(username.trim(), password.trim())
      .subscribe(
        (user: any) => {
          if (user && user.username) {
            this._router.navigateByUrl(this._continueUrl || '');
          } else {
            clearLocalStorage();
            this._router.navigate(['signin']);
          }
        },
        () => {
          this.message = 'Введен неверный логин или пароль';
        }
      );
  }

}
