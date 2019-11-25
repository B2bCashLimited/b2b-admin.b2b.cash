import { Component, Input, OnInit } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { clearSubscription } from '@b2b/decorators';
import { MatDialog } from '@angular/material';
import { CsvTypeChooseComponent } from '@b2b/shared/dialogs';
import { SeoConfigDialogComponent } from './seo-config-dialog/seo-config-dialog.component';

@Component({
  selector: 'b2b-category-features-item',
  templateUrl: './category-features-item.component.html',
  styleUrls: ['./category-features-item.component.scss']
})
export class CategoryFeaturesItemComponent implements OnInit {

  @Input() category: any;
  parentCategory: string;
  hasParent = false;

  private _categorySub: Subscription;
  private _parentSub: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _route: ActivatedRoute,
    private _dialog: MatDialog,
    private _router: Router) {
  }

  ngOnInit() {
    this.hasParent = (/\./g).test(this.category.path);
  }

  onEditCategoryClick(): void {
    this._router.navigate(['add', this.category.id], { relativeTo: this._route.parent });
  }

  onCategoryInfoClick(): void {
    const { path, id } = this.category;
    if (path && path.length > 0) {
      const observables = path.split('.')
        .filter(parentId => +parentId !== id)
        .map(parentId => this._categoryService.getCategoryById(+parentId));
      clearSubscription(this._parentSub);
      this._parentSub = forkJoin(observables)
        .subscribe((res: any) => {
          this.parentCategory = res.map(item => item.nameRu || item.nameEn || item.nameCn).join(' / ');
        });
    }
  }

  onModeChanged(autoForm: boolean): void {
    clearSubscription(this._categorySub);
    this.category.autoForm = autoForm;
    this._categorySub = this._categoryService.editCategoryMode(this.category, autoForm)
      .subscribe();
  }

  onSeoBtnClick() {
    this._dialog.open(SeoConfigDialogComponent, {
      // disableClose: true,
      maxHeight: '800px',
      minWidth: '800px',
      data: {
        category: this.category
      },
      autoFocus: false
    });
  }

  downloadCsv(): void {
    this._dialog.open(CsvTypeChooseComponent, {
      width: '600px',
      height: '700px',
      data: {
        categoryId: this.category.id,
        simple: true
      }
    });
  }
}
