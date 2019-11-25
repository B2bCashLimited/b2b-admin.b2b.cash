import { Component, OnInit } from '@angular/core';
import { OrderService } from '@b2b/services/order.service';
import { MatDialog, PageEvent } from '@angular/material';
import { clearSubscription } from '@b2b/decorators';
import { Subscription } from 'rxjs/internal/Subscription';
import * as moment from 'moment';
import { SocketService } from '@b2b/services/socket.service';
import { TreeComponent } from '@b2b/shared/modules';

@Component({
  selector: 'b2b-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.scss']
})
export class UpdateOrderComponent implements OnInit {
  items: any[] = [];
  category: any;
  dateFrom: any;
  dateTo: any;
  limit = 10;
  totalPages = 0;
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  selectedCategoryNames: string;
  selectedCategoryIds: string;
  selectedCategories: any[];

  private _orderSub: Subscription;
  constructor(
    private _matDialog: MatDialog,
    private _orderService: OrderService,
    private _socketService: SocketService
  ) { }

  ngOnInit() {
    this.getFreeOrdersList();
  }

  getFreeOrdersList(page?) {
    const query = {
      category: this.selectedCategoryIds,
      dateFrom: this.dateFrom && moment(this.dateFrom).format('YYYY-MM-DD') || null,
      dateTo: this.dateTo && moment(this.dateTo).format('YYYY-MM-DD') || null,
      page: page || 1,
      limit: this.limit
    };

    clearSubscription(this._orderSub);
    this._orderSub = this._orderService.getRawFreeOrders(query).subscribe(({ pager, data }) => {
      this.totalPages = pager.totalPages;
      this.pager = {
        length: pager.totalItems,
        pageIndex: pager.currentPage,
        pageSize: pager.perPage
      };

      this.items = data;
    });
  }

  dateToChange() {
    this.getFreeOrdersList();
  }

  dateFromChange() {
    this.getFreeOrdersList();
  }

  onPageChange(evt: PageEvent) {
    if (this.pager.pageIndex < this.totalPages) {
      this.getFreeOrdersList(++evt.pageIndex);
    }
  }

  selectCategory() {
    this._matDialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: true,
        categories: this.selectedCategories
      }
    }).afterClosed().subscribe((res) => {
      this.selectedCategories = res;
      this.selectedCategoryNames = this.selectedCategories && this.selectedCategories.map((item: any) => item.nameRu).join(', ') || null;
      this.selectedCategoryIds = this.selectedCategories && this.selectedCategories.map((item: any) => +item.id).toString() || null;
      this.getFreeOrdersList();
    });
  }

  onItemChanged({ action, payload }) {
    switch (action) {
      case 'updateOrder':
        this.updateOrder(payload);
        break;
      case 'deleteOrder':
        this.deleteOrder(payload.id);
        break;
    }
  }

  updateOrder(body) {
    this._orderService.updateFreeOrder(body).subscribe((res: any) => {
      if (res && res.validate) {
        this._socketService.emit('product_order_create', { id: body.id });
        this.getFreeOrdersList();
      }
    });
  }

  deleteOrder(orderId: number) {
    this._orderService.removeFreeOrder(orderId).subscribe(() => {
      this.getFreeOrdersList();
    });
  }
}
