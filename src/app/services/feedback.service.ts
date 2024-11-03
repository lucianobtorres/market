import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  haptic(duration: number = 200): void {
    // return;
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    } else {
      console.error("Dispositivo não suporta feedback tátil.");
    }
  }
}
