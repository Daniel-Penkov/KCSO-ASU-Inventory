import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material';

import { InventoryItem } from '../../../models/inventory.model';
import { DataService } from 'src/app/authorization/data.service';
import{ toDateString }  from '../../../shared/utils';

@Component({
  selector: 'app-item-display-page',
  templateUrl: './item-display-page.component.html',
  styleUrls: ['./item-display-page.component.css']
})
export class ItemDisplayPageComponent implements OnInit {
  // id # of current InventoryItem object being displayed
  idValue: number;
  // array of all past instances of the current InventoryItem object
  itemHistory: InventoryItem[] = [];
  // Paginated data for rows of the data table of previous history
  table_page: InventoryItem[];
  // the current InventoryItem object
  item: InventoryItem = null;
  // Stores the current page's index for the history table
  page_index = 0;
  // Stores the currently selected page size for the history table
  page_size = 5;
  // array of arrays that organizes the order of data types displayed on the page
  // by row size
  itemProperties = [
    [
      [
        'serialNumber',
        'model',
        'fundedBy',
        'kcsoAssetTag',
        'acquiredDate',
      ],
      [
        'status',
        'size',
        'grantPurchase',
        'kcAssetTag',
        'dispositionDate',
      ],
      [
        'category',
        'partNumber',
        'drmoAcquisition',
        'transferredTo',
        'expirationDate',
      ],
    ],
    [
      ['purchasePrice', 'checkoutDate'],
      ['manufacturer', 'assignedToType'],
    ],
    [
      ['comments'],
    ],
  ];
  // Types of data to be displayed in the current InventoryItem's history table
  history_table_columns: string[] = [
    'modifiedBy', 'lastModifiedDate', 'item', 'category', 'serialNumber', 'status', 'manufacturer', 'model', 'size',
    'partNumber', 'purchasePrice', 'grantPurchase', 'fundedBy', 'drmoAcquisition', 'isDeleted',
    'drmoClassification', 'kcsoAssetTag', 'kcAssetTag', 'expirationDate', 'transferredTo',
    'acquiredDate', 'dispositionDate', 'checkoutDate', 'assignedToType'
  ];

  constructor(private _activatedRoute: ActivatedRoute,
    private _data_service: DataService) {
  }

  /**
   * On initialization, gets information about the current InventoryItem
   * from the API and URL input
   */
  ngOnInit() {
    this.idValue = this._activatedRoute.snapshot.params['id'];
    this._data_service.getHistory(this.idValue, this.storeHistory.bind(this));
  }

  /**
   * Gets the history array of the current InventoryItem and other necessary
   * information from the API
   * @param data - the array of the history of the current
   * InventoryItem object taken from the API
   */
  storeHistory(data: InventoryItem[]) {
    this.itemHistory = data;
    this.page(this.page_size, this.page_index);
    this.itemHistory.forEach((item) => {
      if (item.acquiredDate) {
        item.acquiredDate = new Date(item.acquiredDate);
      }
      if (item.dispositionDate) {
        item.dispositionDate = new Date(item.dispositionDate);
      }
      if (item.expirationDate) {
        item.expirationDate = new Date(item.expirationDate);
      }
      if (item.checkoutDate) {
        item.checkoutDate = new Date(item.checkoutDate);
      }
      if (item.lastModifiedDate) {
        item.lastModifiedDate = new Date(item.lastModifiedDate);
      }
    });
    this.item = this.itemHistory[0];
  }

  /**
   * Filters the data to just what should be visible on the page
   * @param pageSize - the updated table page size
   * @param pageIndex - the updated table page index
   */
  page(pageSize: number, pageIndex: number) {
    this.page_size = pageSize;
    this.page_index = pageIndex;
    this.table_page = this.itemHistory
      .slice(this.page_index * this.page_size, (this.page_index + 1) * this.page_size);
  }

  /**
   * Compares the values of one specific field of two instances of an item
   * in the itemHistory
   * @param index - The index of the current itemHistory instance
   * @param data - The data type currently being compared
   * @return true if both values of the field are equal
   * @return false if the field values are not equal
   */
  compare(index: number, data: string) {
     if (index < this.itemHistory.length - 1) {
       let date = this.itemHistory[index][data];
       if (date instanceof Date && !isNaN(date.valueOf())) {
         let currentDate = toDateString(date, '%-d %b %Y' );
         return this.itemHistory[index + 1][data]
           && (currentDate === toDateString(this.itemHistory[index + 1][data], '%-d %b %Y' ));
       }
       return (this.itemHistory[index][data] === this.itemHistory[index + 1][data])
     }
     return true;
  }
}
