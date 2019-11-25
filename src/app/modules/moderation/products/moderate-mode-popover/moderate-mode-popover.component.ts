import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Activity} from '../models/product-full-search.model';

@Component({
  // tslint:disable-next-line
  selector: 'app-moderate-mode-popover',
  templateUrl: './moderate-mode-popover.component.html',
  styleUrls: ['./moderate-mode-popover.component.scss']
})
export class ModerateModePopoverComponent implements OnInit {

  @Input() activity: Activity;
  @Input() product: any;
  @Output() save = new EventEmitter<number>();
  @Output() close = new EventEmitter();

  isConfirming = false;
  trusted: number;

  constructor() {
  }

  ngOnInit() {
    if (this.product.showcase.supplier) {
      this.trusted = this.product.showcase.supplier.trusted;
    } else {
      this.trusted = this.product.showcase.manufacturer.trusted;
    }
  }

  onSave() {
    if (this.trusted === 4) {
      this.isConfirming = true;
    } else {
      this.save.emit(this.trusted);
    }
  }

  confirmAutoModerating() {
    this.save.emit(this.trusted);
  }

  onClose() {
    this.close.emit();
  }
}
