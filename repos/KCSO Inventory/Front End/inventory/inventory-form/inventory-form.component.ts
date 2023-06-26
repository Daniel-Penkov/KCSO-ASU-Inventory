// Angular imports
import { Component, Inject } from '@angular/core';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

// Local imports
import { InventoryItem } from '../../../models/inventory.model';
import { DataService } from '../../../authorization/data.service';
import { FormDialog } from 'src/app/shared/form-dialog';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent extends FormDialog<InventoryItem, InventoryFormComponent> {
  path = 'inventory';

  /**
   * On construction Angular injects a DataService, MatDialogRef, MatDialog, MAT_DIALOG_DATA,
   * and MatSnackBar.
   * The DataService is used to interact with the database API.
   * The MatDialogRef is a reference to the dialog in which this component lives,
   * and is used to close the dialog programmatically.
   * The MatDialog is used to open the ConfirmDelete dialog.
   * The MAT_DIALOG_DATA is used to receive local variables from the component which
   * opened the dialog.
   * The MatSnackBar is used to display a success or error message after POSTing
   * to the API.
   * @param dataService - Service to interact with database API
   * @param dialogRef - Reference to the open dialog (used to close it programmatically)
   * @param dialog - MatDialog service to open ConfirmDelete dialog
   * @param snackBar - Service to open snackbar
   * @param data - Local data passed from the outer component
   */
  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<InventoryFormComponent>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: { resource: InventoryItem }
  ) {
    super(data);
  }
}
