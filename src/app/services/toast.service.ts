import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastComponent } from '../components/shared/toast/toast.component';
import { MessageData, TypeToast } from '../models/message-data';

export const TOAST_DURATION = 3000;

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) { }

  private show(data: MessageData): MatSnackBarRef<ToastComponent> {
    const config: MatSnackBarConfig = {
      panelClass: ['app-toast-container'],
      data,
      duration: TOAST_DURATION,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    };

    return this.snackBar.openFromComponent(ToastComponent, config);
  }

  showSuccess(msg: string, desc?: string): MatSnackBarRef<ToastComponent> {
    return this.show({
      typeToast: TypeToast.SUCCESS,
      message: msg,
      description: desc
    });
  }

  showWarning(msg: string, desc?: string): MatSnackBarRef<ToastComponent> {
    return this.show({
      typeToast: TypeToast.WARNING,
      message: msg,
      description: desc
    });
  }

  showError(msg: string, desc?: string): MatSnackBarRef<ToastComponent> {
    return this.show({
      typeToast: TypeToast.ERROR,
      message: msg,
      description: desc
    });
  }

  showDismiss(msg: string, desc?: string): MatSnackBarRef<ToastComponent> {
    return this.show({
      typeToast: TypeToast.DISMISSING,
      message: msg,
      description: desc
    });
  }
}
