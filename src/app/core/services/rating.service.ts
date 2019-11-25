import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  constructor(private _http: HttpClient,
    private _config: ConfigService) {
  }


  getRatingTemplates(activityNameId: number) {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'activity',
      'filter[0][value]': activityNameId,
    };
    const params = new HttpParams({ fromObject: obj });
    const url = `${this._config.apiUrl}/rating-templates`;

    return this._http.get(url, { params })
      .pipe(
        map((res: any) => {
          return res._embedded.rating_templates;
        })
      );
  }

  destroyRatingTemplate(id: number) {
    return this._http.delete(`${this._config.apiUrl}/rating-templates/${id}`);
  }

  postRatingTemplate(activityId: number, countryId: number, ranges: any[], quiz: any[]): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/rating-templates`, { activityId, countryId, ranges, quiz });
  }

  getRatingDetails(query: any): Observable<any> {
    const params = new HttpParams({ fromObject: query });

    return this._http.get(`${this._config.apiUrl}/get-rating-details`, { params }).pipe(
      map((res: any) => {
        return res && res._embedded && res._embedded.ratingDetails && res._embedded.ratingDetails[0];
      })
    );
  }

  putRatingTemplate({ id, ranges, quiz }): Observable<any> {
    quiz.forEach(question => {
      question.answers.forEach(answer => {
        delete answer.id;
      });
    });
    return this._http.put(`${this._config.apiUrl}/rating-templates/${id}`, { ranges, quiz });
  }

  getById(id: number) {
    return this._http.get(`${this._config.apiUrl}/rating-templates/${id}`);
  }
}
