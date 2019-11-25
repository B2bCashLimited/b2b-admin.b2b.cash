import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { FEED_PROCESS_TYPES } from 'app/core/enums/feed';

@Component({
  selector: 'b2b-generate-preview-dialog',
  templateUrl: './generate-preview-dialog.component.html',
  styleUrls: ['./generate-preview-dialog.component.scss']
})
export class GeneratePreviewDialogComponent implements OnInit {

  displayedColumns: string[] = ['position', 'prop', 'value'];
  dataSource: MatTableDataSource<any>;

  preview: any[] = [];
  constructor(
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<GeneratePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.preview = this.data.preview;
  }

  ngOnInit() {
    const items = []; let index = 0;
    this.preview.forEach((prev) => {
      index++;
      items.push({
        position: index,
        prop: 'element',
        value: prev.element
      });
      Object.keys(prev.fields).map((key, i) => {
        if (typeof prev.fields[key] === 'object') {
          Object.keys(prev.fields[key]).forEach((innerKey, idx) => {
            index++;
            items.push({
              position: index,
              prop: `${key}/${innerKey}`,
              value: prev.fields[key][innerKey]
            });
          });
        } else {
          index++;
          items.push({
            position: index,
            prop: key,
            value: prev.fields[key]
          });
        }
      });
    });


    this.dataSource = new MatTableDataSource(items);
  }

  onSubmit() {
    const body = {
      type: FEED_PROCESS_TYPES.GENERATE_PREVIEW,
      status: 1,
      feed: this.data.feed,
    };

    this._categoryService.addTask(body).subscribe(() => this._dialogRef.close());
  }
}
