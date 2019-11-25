import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  constructor(private _config: ConfigService) { }

  transform(value: any, args?: any): any {
    const { serverUrl } = this._config;
    if (value.photos && value.photos[0] && value.photos[0].link) {
      return serverUrl + value.photos[0].link;
    } else {
      return '../assets/img/stubs/noimage.png';
    }
  }
}
