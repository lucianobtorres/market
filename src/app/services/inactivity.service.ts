import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimeout: number = 30000; // 30 segundos
  private timer: any;

  private showAgent = new BehaviorSubject<boolean>(false);
  get showAgent$(): Observable<boolean> {
    return this.showAgent.asObservable();
  }

  constructor() { }

  resetTimer(event: Event | null): void {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.showAgent.next(true)},
      this.inactivityTimeout);
    }

    start(): void {
    this.resetTimer(null);
  }

  stop(): void {
    clearTimeout(this.timer);
    this.showAgent.next(false);
  }

  closeAgent(): void {
    this.showAgent.next(false);
    this.resetTimer(null);
  }
}
