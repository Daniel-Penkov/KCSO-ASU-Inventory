// Angular imports
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'headerName'
})
export class HeaderNamePipe implements PipeTransform {
    transform(name: string) {
        switch (name) {
          case 'Grant Purchase?':
            return 'Grant Purchase';
          case 'Comments':
            return 'Additional Notes About The Item';
          case 'Assigned To':
            return 'Checked out to ';
          default:
            return name;
        }
    }
}
