import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {fromError} from 'stacktrace-js';
import {MatDialog} from '@angular/material';
import {GlobalErrorDialogComponent} from '@b2b/shared/dialogs/global-error-dialog/global-error-dialog.component';
import StackFrame = StackTrace.StackFrame;

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {

  constructor(
    private _injector: Injector) {
  }

  handleError(e: Error | HttpErrorResponse | any): void {
    if (e instanceof HttpErrorResponse && ![401, 403].includes(e.status)) {
      const {title, detail} = e.error;
      this._showErrorMessage({url: e.url, title, detail: [detail]});
    } else {
      fromError(e).then((stackFrames: StackFrame[]) => {
        const detail = stackFrames.splice(0, 20).map((sf) => sf.toString());
        const title = e.message || e.toString();
        this._showErrorMessage({title, detail});
      });
    }
  }

  private _showErrorMessage(errorData: any) {
    const matDialog = this._injector.get(MatDialog);
    matDialog.open(GlobalErrorDialogComponent, {
      maxWidth: '540px',
      maxHeight: '90vh',
      disableClose: true,
      data: {errorData}
    }).afterClosed()
      .subscribe();
  }

}
