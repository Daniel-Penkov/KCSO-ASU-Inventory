// Angular imports
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

// 3rd Party imports
import { cloneDeep } from 'lodash';

// Local imports
import { InventoryItem } from '../../models/inventory.model';
import { AuthService } from 'src/app/authorization/auth.service';
import { DataService } from '../../authorization/data.service';
import { DataPage } from 'src/app/shared/data-page';
import { CheckOutComponent } from './check-out/check-out.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { Agency, Aircraft } from 'src/app/models/flight-models';
import { Person } from 'src/app/models/person-models';
import { sort_by_key } from 'src/app/shared/utils';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent extends DataPage<InventoryItem> implements OnInit {
  path = 'inventory';
  // Columns to display (in order) in data table
  tableColumns = [
    'item', 'category', 'serialNumber', 'status', 'manufacturer', 'model', 'size',
    'partNumber', 'purchasePrice', 'grantPurchase', 'fundedBy', 'drmoAcquisition',
    'drmoClassification', 'kcsoAssetTag', 'kcAssetTag', 'expirationDate', 'transferredTo',
    'acquiredDate', 'dispositionDate', 'checkoutDate', 'assignedToType'
  ].concat(this.authService.canView('inventory history') ? ['viewHistory'] : []);

  searchString = '';

  inventory_length: number;

  /**
   * On construction Angular injects a DataService and a MatDialog (service).
   * Additionally, a Router service is injected.
   * The DataService is used to interact with the database API.
   * The MatDialog is used to open a FlightComponent dialog
   * The MatSnackBar is used to display a success or error result after checking
   * in an item.
   * The Router is used to redirect the user to relevent locations
   * @param _data_service - Service to interact with database API
   * @param dialog - Service to open flight dialog
   * @param snackBar - Service to open a snackbar
   * @param _router - Router used to programmatically redirect/navigate the user
   */
  constructor(
    public authService: AuthService,
    public dataService: DataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private _router: Router
  ) {
    super();
  }

  /**
   * On initialization: Populate the data table
   */
  ngOnInit() {
    this.refresh();
  }

  /**
   * Navigates the user to the given route
   * @param route - The route to navigate to
   */
  navigate(route: string, ...args) {
    this._router.navigate([route, ...args]);
  }

  /**
   * Performs the corresponding behavior (running the check_in_out_item function,
   * running the add_edit_item function, or running the navigate function) on the
   * given InventoryItem, depending on the given index of the tableColumns array.
   * @param index - the given index of the tableColumns array
   * @param item - the given InventoryItem
   */
  clickBehavior(index: number, item: InventoryItem) {
    if (this.tableColumns[index] === 'viewHistory') {
      this.navigate('inventory', item.id);
    } else if (this.tableColumns[index] === 'assignedToType') {
      if (item.checkoutDate && (
        this.authService.canCheckinToAll()) || this.checkInToSelfCheck(item)
      ) {
        this.check_in_item(item);
      } else if (this.authService.canCheckoutToAll()) {
        this.check_out_item(item);
      } else if (this.authService.canCheckinToSelf()) {
        this.check_out_item(item, true);
      }
    } else {
      this.add_edit_item(item);
    }
  }

  checkInToSelfCheck =
    (item: InventoryItem) =>
      item.hasOwnProperty('person') &&
      item.person.email.toLowerCase() === this.authService.email.toLowerCase() &&
      this.authService.canCheckinToSelf()

  /**
   * Filters the data to just what should be visible on the page
   * @param pageSize - The page size
   * @param pageIndex - The page index
   */
  page(pageSize, pageIndex) {
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
    this.resources_page = sort_by_key<InventoryItem>(
      this.resources_full,
      this.compareDisplayResource,
      this.sortDirection
    ).filter(this.checkContains);
    this.inventory_length = this.resources_page.length;
    this.resources_page = this.resources_page.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
  }

  compareDisplayResource = (item: InventoryItem) => item[this.sortColumn] || '';
  newResource = () => new InventoryItem();
  preprocessResources = () => { };

  checkContains =
    (item: InventoryItem) =>
      (item.hasOwnProperty('assignedToType')
        && this.checkContains(item[item.assignedToType.toLowerCase()])) ||
      Object.values(item).reduce(
        (acc, val) => acc || String(val).toLowerCase().includes(this.searchString.toLowerCase()),
        false
      )

  checkOutContains =
    (assigned: Person | Aircraft | Agency) =>
      Object.values(assigned || {}).reduce(
        (acc, val) => acc || String(val).toLowerCase().includes(this.searchString.toLowerCase()),
        false
      )

  /**
   * Check in or check out an item depending on whether it is checked out currently
   * @param item - The item to check in or out
   */
  check_in_item(item: InventoryItem) {
    if (navigator.onLine) {
      this.dataService.checkInItem(
        item.id,
        () => {
          this.snackBar.open('Item checked in successfully', 'Ok');
          this.refresh();
        },
        () => this.snackBar.open('Failed to check in this item, please try again later', 'Ok')
      );
    } else {
      this.snackBar.open('You are offline! Try again when you are connected to the internet', 'Ok');
    }
  }
  check_out_item(item: InventoryItem, self = false) {
    if (navigator.onLine) {
      this.dialog.open(CheckOutComponent, {
        data: {
          item: cloneDeep(item),
          toSelf: self,
        },
      }).afterClosed().subscribe(result => {
        if (result === 'checked out') {
          this.refresh();
        }
      });
    } else {
      this.snackBar.open('You are offline! Try again when you are connected to the internet', 'Ok');
    }
  }

  /**
   * Open a dialog to edit or add a new item
   * @param item - The item to edit
   */
  add_edit_item = (item) => this.add_edit(InventoryFormComponent)(item);
}
