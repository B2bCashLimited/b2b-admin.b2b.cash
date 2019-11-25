import {
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';
import { TnvedEtsngService } from '@b2b/services/tnved-etsng.service';

@ClearSubscriptions()
@Component({
  selector: 'b2b-tnved-etsng-description-dialog',
  templateUrl: './tnved-etsng-description-dialog.component.html',
  styleUrls: ['./tnved-etsng-description-dialog.component.scss']
})
export class TnvedEtsngDescriptionDialogComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  searchTypes: any[] = [
    {
      label: 'Поиск родителя по коду ТНВД',
      value: 1
    },
    {
      label: 'Поиск родителя по имени',
      value: 2
    }
  ];

  codesInputTnved = new Subject<string>();
  tnvedPage = 1;
  isTnvedCodesLoading = false;
  autoCompleteTnvedData: any[];
  tnvedTerm: string;
  serviceMethodName = 'getTnvedsListForSelectingParentByCode';
  searchType = 'код';

  constructor(@Inject(MAT_DIALOG_DATA) private _dialogData: FormGroup,
              private _matDialogRef: MatDialogRef<TnvedEtsngDescriptionDialogComponent>,
              private fb: FormBuilder,
              private tnvedEtsngService: TnvedEtsngService) {
    this.formGroup = this._dialogData;
  }

  /**
   * @inheritDoc
   */
  ngOnInit() {
    this._bindToInputTnved();
    this._onParentSearchTypeChanged();
  }

  /**
   * @inheritDoc
   */
  ngOnDestroy() {
  }

  onDescriptionClicked(evt): void {
    evt.stopPropagation();
  }

  /**
   * Fires event every time container's scrollbar scrolls to end
   */
  onCategoriesScrollToEndTnved(): void {
    this.tnvedPage++;
    this._searchTnvd(this.tnvedTerm);
  }

  /**
   * Close dialog
   */
  onCloseDialogButtonClick(): void {
    if (this.formGroup.get('isNew').value) {
      if (this.formGroup.controls.tnved && this.formGroup.get('tnved').value && !this.formGroup.get('tnvedStr').value) {
        this.formGroup.get('tnvedStr').setValue(this.formGroup.get('tnved').value.toString());
      } else if (this.formGroup.controls.code && this.formGroup.get('code').value && !this.formGroup.get('codeStr').value) {
        this.formGroup.get('codeStr').setValue(this.formGroup.get('code').value.toString());
      }
    }

    this._matDialogRef.close();
  }

  /**
   * Searches Tnvd by name or by code for autocomplete
   */
  private _searchTnvd(evt): void {
    this.tnvedEtsngService[this.serviceMethodName](evt, this.tnvedPage)
      .subscribe(res => {
        if (this.autoCompleteTnvedData && this.autoCompleteTnvedData.length > 0) {
          this.autoCompleteTnvedData = this.autoCompleteTnvedData.concat(res);
        } else {
          this.autoCompleteTnvedData = res;
        }
        this.isTnvedCodesLoading = false;
      }, () => {
        this.isTnvedCodesLoading = false;
      });
  }

  private _bindToInputTnved() {
    this.codesInputTnved
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(code => {
          this.isTnvedCodesLoading = true;
          this.tnvedTerm = code;
          this.autoCompleteTnvedData = [];
          this.tnvedPage = 1;
          this._searchTnvd(code);
        }
      );
  }

  /**
   * Listens parent search type (by name or by code) radio buttons changes
   */
  private _onParentSearchTypeChanged(): void {
    if (this.formGroup.get('parentSearchType')) {
      this.formGroup.get('parentSearchType').valueChanges
        .subscribe(res => {
          this.autoCompleteTnvedData = [];

          if (res === 1) {
            this.serviceMethodName = 'getTnvedsListForSelectingParentByCode';
            this.searchType = 'код';
          } else if (res === 2) {
            this.serviceMethodName = 'getTnvedsListForSelectingParentByName';
            this.searchType = 'имя';
          }
        });
    }
  }

}
