import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { interval, map, tap, take, Subscription } from 'rxjs';
import { MessageData, TypeToast } from 'src/app/models/message-data';
import { TOAST_DURATION } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  public readonly icon: string;
  public readonly messageClass: string;
  public readonly dismissing: boolean = false;

  public progressbarValue = 0;
  public curSec = 0;

  private _sub?: Subscription;

  constructor(
    private snackBarRef: MatSnackBarRef<ToastComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: MessageData
  ) {

    switch (data.typeToast) {
      case TypeToast.SUCCESS:
        this.icon = 'check_circle';
        this.messageClass = 'app-msg-success';
        break;

      case TypeToast.WARNING:
        this.icon = 'warning';
        this.messageClass = 'app-msg-warning';
        break;

      case TypeToast.ERROR:
        this.icon = 'error';
        this.messageClass = 'app-msg-error';
        break;

      case TypeToast.DISMISSING:
        this.icon = 'check_circle';
        this.messageClass = 'app-msg-success';
        this.dismissing = true;
        break;
    }
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  ngOnInit(): void {
    const steps = 100;
    const totalTimeMs = TOAST_DURATION;

    this._sub = interval(totalTimeMs / steps).pipe(
      take(steps),
      map(step => step + 1),
      tap(step => {
        this.progressbarValue = step / steps * 100;
      })).subscribe();
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }

  desfazer(): void {
    this.snackBarRef.dismissWithAction();
  }
}
