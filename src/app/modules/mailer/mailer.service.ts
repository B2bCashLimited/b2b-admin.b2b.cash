import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ClientType} from '@b2b/enums';
import {Observable} from 'rxjs';

@Injectable()
export class MailerService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  getCurrentEmailsCsv(body: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/current-emails-csv`, body)
      .pipe(
        map((file: any) => {
          file.url = this._config.serverUrl + file.url;
          return file;
        })
      );
  }

  getHtmlTemplates(search: string, page = 1, limit = 25) {
    let obj: any = {
      'filter[0][type]': 'neq',
      'filter[0][field]': 'status',
      'filter[0][value]': 5,
      page,
      limit
    };
    if (search) {
      obj = {
        ...obj,
        'filter[1][type]': 'lowerlike',
        'filter[1][where]': 'or',
        'filter[1][field]': 'name',
        'filter[1][value]': `%${search}%`,
      };
    }
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/html-template`, {params})
      .pipe(
        map((res: any) => {
          const items = res._embedded.html_template;
          const templates = [];
          for (const item of items) {
            const senderEmail = item.senderEmail || item._embedded.senderEmail || {};
            const template = {
              clientType: item.clientType,
              id: item.id,
              name: item.name,
              subject: item.subject,
              template: (item.template || '').replace(/{\$siteUrl}/g, location.origin),
              userType: item.userType,
              htmlTemplateActivityNames: item._embedded.htmlTemplateActivityNames,
              htmlTemplateCategory: item._embedded.htmlTemplateCategory,
              htmlTemplateFiles: item._embedded.htmlTemplateFiles,
              senderEmail: {
                id: senderEmail.id,
                name: senderEmail.name,
                email: senderEmail.email,
              }
            };
            templates.push(template);
          }
          templates.sort((a, b) => b.id - a.id);
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            templates,
          };
        })
      );
  }

  getHtmlTemplateById(id: number) {
    return this._http.get(`${this._config.apiUrl}/html-template/${id}`)
      .pipe(
        map((res: any) => {
          const senderEmail = res.senderEmail || res._embedded.senderEmail || {};
          return {
            clientType: res.clientType,
            id: res.id,
            name: res.name,
            subject: res.subject,
            template: res.template,
            userType: res.userType,
            htmlTemplateActivityNames: res._embedded.htmlTemplateActivityNames,
            htmlTemplateCategory: res._embedded.htmlTemplateCategory,
            htmlTemplateFiles: res._embedded.htmlTemplateFiles,
            senderEmail: {
              id: senderEmail.id,
              name: senderEmail.name,
              email: senderEmail.email,
            }
          };
        })
      );
  }

  destroyHtmlTemplate(id: number, data: any) {
    return this._http.put(`${this._config.apiUrl}/html-template/${id}`, data);
  }

  createHtmlTemplate(body: any) {
    return this._http.post(`${this._config.apiUrl}/html-template`, body);
  }

  updateHtmlTemplate(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/html-template/${id}`, body);
  }

  getEmailSenders(search: string, page = 1, limit = 25) {
    let obj: any = {
      page,
      limit,
      'filter[0][type]': 'eq',
      'filter[0][field]': 'useSendings',
      'filter[0][value]': 1
    };
    if (search) {
      obj = {
        ...obj,
        'filter[1][type]': 'lowerlike',
        'filter[1][where]': 'or',
        'filter[1][field]': 'name',
        'filter[1][value]': `%${search}%`,
      };
    }
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/sender-email`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            senders: res._embedded.sender_email,
          };
        })
      );
  }

  getSendingsStatistics(id) {
    return this._http.get(`${this._config.apiUrl}/sendings-stats/${id}`);
  }

  getSendings(userType: number, clientType: number, page = 1, limit = 25) {
    let filter: any = {
      'filter[2][type]': 'neq',
      'filter[2][field]': 'status',
      'filter[2][value]': 8,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'dateCreated',
      'order-by[0][direction]': 'desc',
      page,
      limit
    };

    if (userType) {
      filter = {
        ...filter,
        'filter[0][type]': 'eq',
        'filter[0][field]': 'userType',
        'filter[0][value]': userType,
      };
    }
    if (clientType) {
      filter = {
        ...filter,
        'filter[1][type]': 'eq',
        'filter[1][field]': 'clientType',
        'filter[1][value]': clientType,
      };
    }
    const params = new HttpParams({fromObject: filter});

    return this._http.get(`${this._config.apiUrl}/sendings`, {params})
      .pipe(
        map((res: any) => {
          const sendings = res._embedded.sendings;
          sendings.forEach((item: any) => {
            item.dateCreated = item.dateCreated.date;
            item.dateUpdated = item.dateUpdated.date;
            item.htmlTemplate = item._embedded.htmlTemplate;
            item.senderEmail = item._embedded.senderEmail;
            item.user = item._embedded.user;
            delete item._embedded;
            delete item._links;
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            sendings,
          };
        })
      );
  }

  deleteSending(id: number) {
    return this._http.delete(`${this._config.apiUrl}/sendings/${id}`);
  }

  getSendGroups(filter: any, page = 1, limit = 25) {
    filter = filter || {};
    const obj: any = {page, limit};
    let index = 0;

    if (filter.activityNamesId && filter.activityNamesId.length > 0) {
      filter.activityNamesId.forEach(id => {
        obj[`filter[${index}][type]`] = 'ismemberof';
        obj[`filter[${index}][field]`] = 'sendGroupActivityNames';
        obj[`filter[${index}][value]`] = id;
        index++;
      });
    }

    if (filter.userType) {
      obj[`filter[${index}][type]`] = 'eq';
      obj[`filter[${index}][field]`] = 'userType';
      obj[`filter[${index}][value]`] = filter.userType;
      index++;
    }

    if (filter.clientType && filter.userType === 1) {
      const {buyer, seller} = filter.clientType;
      const clientType = getClientType(buyer, seller);
      if (clientType) {
        obj[`filter[${index}][type]`] = 'eq';
        obj[`filter[${index}][field]`] = 'clientType';
        obj[`filter[${index}][value]`] = clientType;
        index++;
      }
    }

    if (filter.group) {
      obj[`filter[${index}][type]`] = 'lowerlike';
      obj[`filter[${index}][where]`] = 'or';
      obj[`filter[${index}][field]`] = 'name';
      obj[`filter[${index}][value]`] = `%${filter.group}%`;
    }

    const params = new HttpParams({fromObject: obj});

    const url = `${this._config.apiUrl}/send-group`;
    return this._http.get(url, {params})
      .pipe(
        map((res: any) => {
          const sendGroups = res._embedded.send_group;
          sendGroups.forEach((item: any) => {
            item.sendGroupActivityNames = item._embedded.sendGroupActivityNames;
            item.sendGroupCategory = item._embedded.sendGroupCategory;
            item.sendGroupCountry = item._embedded.sendGroupCountry;
            item.sendList = item._embedded.sendList || [];
            delete item._embedded;
            delete item._links;
            item.sendList.forEach((list: any) => {
              list.sendListFiles = list._embedded.sendListFiles || [];
              list.sendListFiles.forEach(file => {
                file.url = this._config.serverUrl + file.url;
              });
              delete list._embedded;
              delete list._links;
            });
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            sendGroups,
          };
        })
      );
  }

  createSendGroup(group) {
    const body = {
      clientType: group.clientType,
      id: group.id,
      name: group.name,
      userType: group.userType,
      sendGroupActivityNames: group.sendGroupActivityNames,
      sendGroupCategory: group.sendGroupCategory.map(itm => itm.id),
      sendGroupCountry: group.sendGroupCountry.map(itm => itm.id),
      sendList: group.sendList.map(itm => itm.id),
    };

    return this._http.post(`${this._config.apiUrl}/send-group`, body)
      .pipe(
        map((res: any) => {
          return {
            clientType: res.clientType,
            id: res.id,
            name: res.name,
            userType: res.userType,
            sendGroupActivityNames: res._embedded.sendGroupActivityNames,
            sendGroupCategory: res._embedded.sendGroupCategory,
            sendGroupCountry: res._embedded.sendGroupCountry,
            sendList: res._embedded.sendList,
          };
        })
      );
  }

  updateSendGroup(group) {
    const body = {
      id: group.id,
      name: group.name,
      sendList: group.sendList.map(item => +item.id),
      sendGroupCountry: group.sendGroupCountry.map(item => +item.id),
      sendGroupCategory: group.sendGroupCategory.map(item => +item.id)
    };
    return this._http.put(`${this._config.apiUrl}/send-group/${body.id}`, body);
  }

  destroySendGroup(id: number) {
    return this._http.delete(`${this._config.apiUrl}/send-group/${id}`);
  }

  sendMail(body: any) {
    return this._http.post(`${this._config.apiUrl}/send-email`, body);
  }

  getSendLists(filter: any, page = 1, limit = 25): Observable<any> {
    const obj: any = {page, limit};
    if (filter.name) {
      obj[`filter[0][type]`] = 'lowerlike';
      obj[`filter[0][where]`] = 'or';
      obj[`filter[0][field]`] = 'name';
      obj[`filter[0][value]`] = `%${filter.name}%`;
    }

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/send-list`, {params})
      .pipe(
        map((res: any) => {
          const sendLists = res._embedded.send_list;
          sendLists.forEach((item: any) => {
            item.sendListFiles = item._embedded.sendListFiles || [];
            item.sendListFiles.forEach(file => {
              file.url = this._config.serverUrl + file.url;
            });
            delete item._embedded;
            delete item._links;
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            sendLists,
          };
        })
      );
  }

  createSendList(list) {
    const body = {
      name: list.name,
      userType: list.userType,
      sendListFiles: list.sendListFiles.map(item => item.id),
    };
    return this._http.post(`${this._config.apiUrl}/send-list`, body);
  }

  updateSendList(list) {
    const body = {
      id: list.id,
      name: list.name,
      userType: list.userType,
      sendListFiles: list.sendListFiles.map(item => item.id),
    };
    return this._http.put(`${this._config.apiUrl}/send-list/${body.id}`, body);
  }

  destroySendList(id: number, group): Observable<any> {
    group.sendList = group.sendList.filter(item => item.id !== id);
    return this._http.delete(`${this._config.apiUrl}/send-list/${id}`);
  }
}


export function getClientType(buyer: any, seller: any): number | null {
  if (buyer && !seller) {
    return ClientType.Buyer;
  } else if (!buyer && seller) {
    return ClientType.Seller;
  } else if (buyer && seller) {
    return ClientType.Both;
  }
  return null;
}
