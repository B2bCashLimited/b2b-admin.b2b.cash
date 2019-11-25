import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CategoryService} from '@b2b/services/category.service';
import {Observable} from 'rxjs';
import {TnvedEtsngDescriptionDialogComponent} from '../tnved-etsng-description-dialog/tnved-etsng-description-dialog.component';
import {ConfirmDeleteComponent} from '../confirm-delete/confirm-delete.component';
import {pick} from 'lodash';

@Component({
  selector: 'b2b-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.scss']
})
export class AddCategoryDialogComponent implements OnInit {
  formGroup: FormGroup;
  isEditMode = false;
  count$: Observable<any>;
  etsngs = [];
  tnveds = [];
  isLoading = false;
  deletedTnvedItems = [];
  deletedEtsngItems = [];
  codeSelectedFromExisting = false;
  
  constructor(
    private _categoryService: CategoryService,
    private _matDialogRef: MatDialogRef<AddCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog) {
  }
  
  /**
   * @inheritDoc
   */
  ngOnInit() {
    this._initFormGroup();
    
    if (this._dialogData && this._dialogData.category) {
      const category: any = this._dialogData.category;
      this.count$ = this._categoryService.getCategoryUsedCount(category.id);
      this.isEditMode = true;
      this._setCategoryTnvedsAndEtsngs(category.id);
      this.formGroup.patchValue(category);
    }
  }
  
  /**
   * Fires on close button click
   */
  onCloseClick(add: boolean): void {
    if (!add) {
      this._matDialogRef.close();
    } else {
      this.formGroup.enable();
      const data: any = this.formGroup.value;
      data.tnveds = (data.tnveds as any[]).filter((tnved: any) => tnved.tnved && tnved.nameRu);
      data.etsngs = (data.etsngs as any[]).filter((etsng: any) => etsng.code && etsng.nameRu);
      for (let i = 0; i < (data.tnveds as any[]).length; i++) {
        if (typeof data.tnveds[i].parent === 'object') {
          data.tnveds[i].parent = data.tnveds[i].parent.id;
        }
      }
      this.tnveds = this.tnveds.map(tnved => pick(tnved, ['id', 'isNew']));
      this.etsngs = this.etsngs.map(etsng => pick(etsng, ['id', 'isNew']));
      data.tnveds = [...data.tnveds, ...this.deletedTnvedItems, ...this.tnveds];
      data.etsngs = [...data.etsngs, ...this.deletedEtsngItems, ...this.etsngs];
      
      this._matDialogRef.close(data);
    }
  }
  
  /**
   * Emits every time new Tnvd input changes
   */
  onTnvdChanged(tnvd: any, formGroup: FormGroup): void {
    this.resetFormGroup(formGroup, 'tnved');
    
    if (tnvd) {
      if (tnvd.id) {
        formGroup.addControl('id', this._formBuilder.control(tnvd.id));
      } else {
        formGroup.removeControl('id');
      }
      
      this.codeSelectedFromExisting = !!tnvd.path;
      formGroup.patchValue(tnvd);
      
      if (this.codeSelectedFromExisting) {
        const parents = tnvd.path.split('.');
        formGroup.get('parent').setValue(+parents[2]);
        this._disableControls(formGroup, true);
      } else {
        this._setValidators(formGroup, true);
        this._enableControls(formGroup, true);
      }
    } else {
      this._clearValidators(formGroup, true);
    }
  }
  
  /**
   * Emits every time new Etsng input changes
   */
  onEtsngChanged(etsng: any, formGroup: FormGroup): void {
    this.resetFormGroup(formGroup, 'etsng');
    
    if (etsng) {
      if (etsng.id) {
        formGroup.addControl('id', this._formBuilder.control(etsng.id));
      } else {
        formGroup.removeControl('id');
      }
      
      formGroup.patchValue(etsng);
      this.codeSelectedFromExisting = !!etsng.path;
      
      if (this.codeSelectedFromExisting) {
        this._disableControls(formGroup);
      } else {
        this._setValidators(formGroup);
        this._enableControls(formGroup);
      }
    } else {
      this._clearValidators(formGroup);
    }
  }
  
  /**
   * Opens Tnvd or Etsng description modal
   */
  onDescriptionClick(evt: any, formGroup: FormGroup) {
    evt.stopPropagation();
    
    this._dialog.open(TnvedEtsngDescriptionDialogComponent, {
      width: '400px',
      height: 'auto',
      data: formGroup
    });
  }
  
  /**
   * Adds new code Input
   */
  addNewCode(type: string): void {
    const tnvedsControl = this.formGroup.controls.tnveds as FormArray;
    const etsngsControl = this.formGroup.controls.etsngs as FormArray;
    
    if (type === 'tnved') {
      tnvedsControl.insert(0, this.defaultTnvedGroup(true));
    } else if (type === 'etsng') {
      etsngsControl.insert(0, this.defaultEtsngGroup(true));
    }
  }
  
  /**
   * Deletes existing Tnvd or Etsng code
   */
  deleteExistedCode(type: string, item: any): void {
    this._dialog.open(ConfirmDeleteComponent, {
      data: {
        type: type === 'tnved' ? 'ТНВД' : 'ЕТСНГ'
      }
    })
      .afterClosed()
      .subscribe(bool => {
        if (bool) {
          item.isDeleted = true;
          
          if (type === 'tnved') {
            this.tnveds = this.tnveds.filter(tnved => tnved.id !== item.id);
            this.deletedTnvedItems.push(item);
          } else if (type === 'etsng') {
            this.etsngs = this.etsngs.filter(etsng => etsng.id !== item.id);
            this.deletedEtsngItems.push(item);
          }
        }
      });
  }
  
  /**
   * Deletes new created Tnvd or Etsng code
   */
  deleteNewCreatedCode(type: string, item: any, index: number): void {
    this._dialog.open(ConfirmDeleteComponent, {
      data: {
        type: type === 'tnved' ? 'ТНВД' : 'ЕТСНГ'
      }
    })
      .afterClosed()
      .subscribe(bool => {
        if (bool) {
          if (type === 'tnved') {
            const tnvedsControl = this.formGroup.controls.tnveds as FormArray;
            tnvedsControl.removeAt(index);
          } else if (type === 'etsng') {
            const etsngsControl = this.formGroup.controls.etsngs as FormArray;
            etsngsControl.removeAt(index);
          }
        }
      });
  }
  
  onExistedCodeDescriptionClicked(evt): void {
    evt.stopPropagation();
  }
  
  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      nameRu: [null, Validators.required],
      nameEn: [null, Validators.required],
      nameCn: [null, Validators.required],
      tnveds: this._formBuilder.array([this.defaultTnvedGroup(true)]),
      etsngs: this._formBuilder.array([this.defaultEtsngGroup(true)]),
      parent: this._dialogData.category && +this._dialogData.category.parentId || +this._dialogData.categoryId || null,
      enabled: true,
      auto_preview: true,
      auto_form: true,
      status: 1,
    });
  }
  
  /**
   * Retrieves existed category Tnveds and Etsngs codes
   */
  private _setCategoryTnvedsAndEtsngs(categoryId: string): void {
    this.isLoading = true;
    
    this._categoryService.getCategoryTnvdsAndEtsngsById(categoryId)
      .subscribe((res: {tnveds: any[], etsngs: any[]}) => {
        this.isLoading = false;
        this.tnveds = res.tnveds;
        this.etsngs = res.etsngs;
        this.tnveds.map(tnved => tnved.isNew = false);
        this.etsngs.map(etsng => etsng.isNew = false);
      }, () => this.isLoading = false);
  }
  
  /**
   * Default Tnvd form group
   */
  private defaultTnvedGroup(isNew: boolean): FormGroup {
    return this._formBuilder.group({
      tnved: [null, [Validators.min(100000000), Validators.max(99999999999)]],
      tnvedStr: null,
      tnvedType: 4,
      parent: null,
      parentSearchType: 1,
      nameCn: null,
      nameEn: null,
      nameRu: null,
      isNew
    });
  }
  
  /**
   * Default Etsng form group
   */
  private defaultEtsngGroup(isNew: boolean): FormGroup {
    return this._formBuilder.group({
      code: [null, [Validators.min(10000), Validators.max(999999)]],
      codeStr: null,
      nameCn: null,
      nameEn: null,
      nameRu: null,
      isNew
    });
  }
  
  /**
   * Enables form controls
   */
  private _enableControls(formGroup: FormGroup, isTnved = false): void {
    if (isTnved) {
      formGroup.get('parent').enable();
      formGroup.get('parentSearchType').enable();
    }
    
    formGroup.get('nameCn').enable();
    formGroup.get('nameEn').enable();
    formGroup.get('nameRu').enable();
  }
  
  /**
   * Disables form controls
   */
  private _disableControls(formGroup: FormGroup, isTnved = false): void {
    if (isTnved) {
      formGroup.get('parent').disable();
      formGroup.get('parentSearchType').disable();
    }
    
    formGroup.get('nameCn').disable();
    formGroup.get('nameEn').disable();
    formGroup.get('nameRu').disable();
  }
  
  /**
   * Sets validators for form controls
   */
  private _setValidators(formGroup: FormGroup, isTnved = false): void {
    if (isTnved) {
      formGroup.get('parent').setValidators([Validators.required]);
    }
    
    formGroup.get('nameCn').setValidators([Validators.required]);
    formGroup.get('nameEn').setValidators([Validators.required]);
    formGroup.get('nameRu').setValidators([Validators.required]);
    this.formGroup.updateValueAndValidity();
  }
  
  /**
   * Clears form controls validators
   */
  private _clearValidators(formGroup: FormGroup, isTnved = false): void {
    if (isTnved) {
      formGroup.get('parent').clearValidators();
    }
    
    formGroup.get('nameCn').clearValidators();
    formGroup.get('nameEn').clearValidators();
    formGroup.get('nameRu').clearValidators();
    this.formGroup.updateValueAndValidity();
  }
  
  /**
   * Resets form group
   */
  private resetFormGroup(formGroup: FormGroup, type: string): void {
    if (type === 'tnved') {
      formGroup.reset({
        tnved: null,
        tnvedStr: null,
        tnvedType: 4,
        parent: null,
        parentSearchType: 1,
        nameCn: null,
        nameEn: null,
        nameRu: null,
        isNew: true
      });
    } else if (type === 'etsng') {
      formGroup.reset({
        code: null,
        codeStr: null,
        nameCn: null,
        nameEn: null,
        nameRu: null,
        isNew: true
      });
    }
  }
  
}
