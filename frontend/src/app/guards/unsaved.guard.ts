import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface WithUnsavedChanges {
  hasUnsaved(): boolean;
}

export const exitIfUnsaved: CanDeactivateFn<WithUnsavedChanges> =
  (component): Observable<boolean> | boolean => {
    if (component.hasUnsaved()) {
      return confirm('Vous avez des changements, enregistrer?');
    }
    return true;
  };
