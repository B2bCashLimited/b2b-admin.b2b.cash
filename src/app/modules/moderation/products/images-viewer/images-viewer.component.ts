import {Component, OnInit, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {Photo} from '../models/photo.model';
import {ConfigService} from '@b2b/services/config.service';

@Component({
  // tslint:disable-next-line
  selector: 'app-images-viewer',
  templateUrl: './images-viewer.component.html',
  styleUrls: ['./images-viewer.component.scss']
})
export class ImagesViewerComponent implements OnInit {

  @Input() images: Photo[];
  @Output() close = new EventEmitter();

  showingImageIndex = 0;
  currentImage: Photo;

  constructor(public config: ConfigService) {
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): boolean {
    const keyCode = evt.keyCode;
    let handled = false;
    if (keyCode === 37 && this.hasPrevImg()) {
      this.showPrevImg();
      handled = true;
    }
    if (keyCode === 39 && this.hasNextImg()) {
      this.showNextImg();
      handled = true;
    }
    if (keyCode === 27) {
      this.closeViewer();
      handled = true;
    }
    if (handled) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.currentImage = this.images[0];
  }

  hasNextImg() {
    return this.showingImageIndex < this.images.length - 1;
  }

  showNextImg() {
    if (this.hasNextImg()) {
      this.currentImage = this.images[++this.showingImageIndex];
    }
  }

  hasPrevImg() {
    return this.showingImageIndex > 0;
  }

  showPrevImg() {
    if (this.hasPrevImg()) {
      this.currentImage = this.images[--this.showingImageIndex];
    }
  }

  closeViewer() {
    this.close.emit();
  }
}
