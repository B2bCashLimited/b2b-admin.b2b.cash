import {Component, OnInit} from '@angular/core';
import {Permissions} from '@b2b/enums';

@Component({
  selector: 'b2b-mailer',
  templateUrl: './mailer.component.html',
  styleUrls: ['./mailer.component.scss']
})
export class MailerComponent implements OnInit {
  tabLinks = [
    {
      url: 'compose', label: 'Отправить',
      permissions:
        [
          Permissions.SUPER_ADMIN,
          Permissions.MAILER_FULL_ACCESS
        ]
    },
    {
      url: 'templates', label: 'Шаблоны',
      permissions:
        [
          Permissions.SUPER_ADMIN,
          Permissions.MAILER_FULL_ACCESS,
          Permissions.MAILER_VIEW
        ]
    },
    {
      url: 'sent', label: 'Отправленные',
      permissions:
        [
          Permissions.SUPER_ADMIN,
          Permissions.MAILER_FULL_ACCESS,
          Permissions.MAILER_VIEW
        ]
    },
    {
      url: 'lists', label: 'Списки',
      permissions:
        [
          Permissions.SUPER_ADMIN,
          Permissions.MAILER_FULL_ACCESS
        ]
    }
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
