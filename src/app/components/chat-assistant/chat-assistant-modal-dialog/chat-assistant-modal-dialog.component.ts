import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-assistant-modal-dialog',
  template: '<app-chat-assistant (closeEmit)="close()"></app-chat-assistant>'
})
export class ChatAssistantModalDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<ChatAssistantModalDialogComponent>) { }

  close() {
    this.dialogRef.close();
  }
}
