// Angular imports
import { OnInit, Component, Inject } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

// 3rd Party imports
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Local imports
import { DataService } from '../../../authorization/data.service';
import { InventoryItem } from '../../../models/inventory.model';
import { Aircraft, Agency } from '../../../models/flight-models';
import { Person } from '../../../models/person-models';
import { filter } from '../../../shared/data-table-input-field';
import { AuthService } from 'src/app/authorization/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css']
})
export class CheckOutComponent implements OnInit {
  // Model to represent the form's values
  item: InventoryItem;
  self = false;
  // Arrays to hold full aircraft/person/agency data for autocomplete
  private options: {
    aircraft: Aircraft[],
    person: Person[],
    agency: Agency[]
  } = {
      aircraft: [],
      person: [],
      agency: []
    };
  // Observable to emit the currently available filtered options for autocomplete
  private filteredOptions: Observable<Aircraft[] | Person[] | Agency[]>;

  /**
   * On construction Angular injects a DataService, MatDialogRef, MAT_DIALOG_DATA,
   * and MatSnackBar.
   * The DataService is used to interact with the database API.
   * The MatDialogRef is a reference to the dialog in which this component lives,
   * and is used to close the dialog programmatically.
   * The MAT_DIALOG_DATA is used to receive local variables from the component which
   * opened the dialog.
   * The MatSnackBar is used to display a success or error message after POSTing
   * to the API.
   * @param _dataService - Service to interact with database API
   * @param dialogRef - Reference to the open dialog (used to close it programmatically)
   * @param data - Local data passed from the outer component
   * @param snackBar - Service to open snackbar
   */
  constructor(
    private _dataService: DataService,
    private dialogRef: MatDialogRef<CheckOutComponent>,
    @Inject(MAT_DIALOG_DATA) data: { item: InventoryItem, toSelf: boolean },
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.item = data.item;
    this.self = data.toSelf;
  }

  /**
   * On initialization: Get aircraft, person, and agency data for autocomplete
   */
  ngOnInit() {
    this._dataService.getAll<Aircraft>('aircraft', (data) => this.options.aircraft = data);
    this._dataService.getAll<Person>('person', (data) => this.options.person = data);
    this._dataService.getAll<Agency>('agency', (data) => this.options.agency = data);
  }

  /**
   * Opens the autocomplete options panel by setting this.filteredOptions to an
   * Observable that emits the proper value immediately
   * For more on Observables:
   * http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html,
   * For more on pipe operators:
   * https://www.learnrxjs.io/
   * @param input - An NgModel representing the aircraft input field
   */
  openPanel(input: NgModel) {
    this.filteredOptions = of(input.value || '').pipe(
      map(
        value => value ?
          filter(this.options[(this.item.assignedToType || '').toLowerCase()], value, this.display) :
          this.options[this.item.assignedToType.toLowerCase()] || []
      )
    );
  }
  /**
   * Defines how to display an Autocomplete option object as a string
   * @param option - Option to display
   */
  display(option?: Aircraft | Person | Agency): string {
    if (typeof option === 'string') {
      return option;
    } else if (option) {
      if (option.hasOwnProperty('tailNumber')) {
        const aircraft = option as Aircraft;
        return aircraft.tailNumber;
      } else if (option.hasOwnProperty('firstName')) {
        const person = option as Person;
        const space = (person.firstName && person.firstName.length > 0 && person.lastName && person.lastName.length > 0) ? ' ' : '';
        return `${person.firstName}${space}${person.lastName}`;
      } else if (option.hasOwnProperty('name')) {
        const agency = option as Agency;
        return agency.name;
      }
      return '';
    } else {
      return '';
    }
  }
  /**
   * Return the field to check existence of for form validation
   */
  key() {
    if (this.item.assignedToType === 'Aircraft') {
      return 'tailNumber';
    } else if (this.item.assignedToType === 'Person') {
      return 'firstName';
    } else {
      return 'name';
    }
  }

  /**
   * Check out the current item
   * @param e - The click event (used to prevent automatic form submission)
   */
  checkOut(e: Event) {
    e.preventDefault();
    if (this.self) {
      this.item.assignedToId = this.authService.personId;
      this.item.assignedToType = 'Person';
    } else {
      this.item.assignedToId = this.item.assignedTo ? this.item.assignedTo.id : -1;
    }
    this._dataService.checkOutItem(
      this.item,
      () => {
        this.dialogRef.close('checked out');
        this.snackBar.open('Item checked out successfully', 'Ok');
      },
      () => this.snackBar.open('Failed to check out this item, please try again later', 'Ok')
    );
  }
}
