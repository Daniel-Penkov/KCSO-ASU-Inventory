// Angular imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  MatProgressSpinnerModule, MatIconModule, MatTableModule, MatFormFieldModule, MatDialogModule,
  MatCheckboxModule, MatDatepickerModule, MatInputModule, MatAutocompleteModule,
  MatRadioModule, MatButtonModule, MatNativeDateModule, MatSnackBarModule, MatPaginatorModule,
  MatSortModule, MatDividerModule, MatListModule,
} from '@angular/material';

// Local imports
import { InventoryComponent } from './inventory.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';
import { CheckOutComponent } from './check-out/check-out.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ItemDisplayPageComponent } from './item-display-page/item-display-page.component';
import { HeaderNamePipe } from './item-display-page/header-name.pipe';
import { AuthGuard } from 'src/app/authorization/auth.guard';

const inventoryRoutes: Routes = [
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },
  { path: 'inventory/:id', component: ItemDisplayPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    InventoryComponent,
    InventoryFormComponent,
    CheckOutComponent,
    ItemDisplayPageComponent,
    HeaderNamePipe,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(inventoryRoutes),
    FormsModule,
    SharedModule,
    // Material imports
    MatProgressSpinnerModule, MatIconModule, MatTableModule, MatFormFieldModule,
    MatDialogModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatAutocompleteModule, MatRadioModule, MatButtonModule, MatSnackBarModule,
    MatPaginatorModule, MatSortModule, MatDividerModule, MatListModule,
  ],
  entryComponents: [
    CheckOutComponent, InventoryFormComponent,
  ]
})
export class InventoryModule { }
