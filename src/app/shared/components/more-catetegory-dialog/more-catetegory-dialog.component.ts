import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef, MatDialog } from '@angular/material';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'b2b-more-catetegory-dialog',
  templateUrl: './more-catetegory-dialog.component.html',
  styleUrls: ['./more-catetegory-dialog.component.scss']
})
export class MoreCatetegoryDialogComponent implements OnInit {

  public children: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private _matDialogRef: MatDialogRef<MoreCatetegoryDialogComponent>,
    private _matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.children = this.dialogData.children;
    console.log(this.children);
  }

  public closeDialog () { 
    this._matDialogRef.close();
  }

  public dropChild (event, child) {
    moveItemInArray(child, event.previousIndex, event.currentIndex);
    child.forEach((element, index) => {
      element.priority = index + 1;
    });
  }
}
