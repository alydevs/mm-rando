import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  templateUrl: './randomStartingItemsWindow.html',
  styleUrls: ['./randomStartingItemsWindow.scss'],
})

export class MMRRandomStartingItemsWindowComponent implements OnInit {

  @Input() dialogHeader: string = "";
  @Input() setting: any = null;
  @Input() assignmentSettingsMap: any = null;
  @Input() assignmentSettingName: string = "";

  inputText: string = "";

  @ViewChild("inputBar", { static: true }) inputBarRef: ElementRef;

  constructor(protected ref: NbDialogRef<MMRRandomStartingItemsWindowComponent>) {
  }

  ngOnInit() {
    this.inputBarRef.nativeElement.focus();
  }

  cancelDialog() {
    this.ref.close();
  }

  confirmDialog() {
    this.ref.close(this.inputText);
  }
}
