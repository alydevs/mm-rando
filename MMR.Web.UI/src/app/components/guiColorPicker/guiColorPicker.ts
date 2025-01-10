import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'zsr-gui-color-picker',
  templateUrl: './guiColorPicker.html',
  styleUrls: ['./guiColorPicker.scss']
})
export class GUIColorPickerComponent {

  @Input() tooltip: any = 'tooltip';
  @Input() tooltipComponent: any = null;

  @Input() disabled: boolean = false;
  @Input() colorArraySize: number = null;
  @Input() colorValue: any = null;

  @Output() colorValueChange: EventEmitter<any> = null;

  constructor(private cd: ChangeDetectorRef) {
    this.colorValueChange = new EventEmitter<any>();
  }

  ngOnChanges(changeRecord) {
  }

  openColorPicker(refColorPicker: HTMLInputElement = null, colorIndex: number = null) {
    //Open color picker
    if (refColorPicker && !this.disabled) {
      refColorPicker.click();
    }
  }

  afterColorPickerClosed(colorIndex: number = null) {
    //Emit event with full value so GUI saves settings
    this.colorValueChange.emit(this.colorValue);
  }

  pickNewColor(newColor: string, colorIndex: number = null) {

    //console.log("Picked new color:", newColor, "colorIndex:", colorIndex);

    if (colorIndex != null) {
      this.colorValue[colorIndex] = this.convertPickerRGBToValueRGB(newColor);
    }
    else {
      this.colorValue = this.convertPickerRGBToValueRGB(newColor);
    }
  }

  randomizeColors() {

    if (this.disabled)
      return;

    //Randomize all colors, then emit event
    if (this.colorArraySize != null) {
      //Array colors. Randomize each one
      for (let i = 0; i < this.colorArraySize; i++) {
        this.colorValue[i] = this.generateRandomColor();
      }
    }
    else {
      //Single color picker
      this.colorValue = this.generateRandomColor();
    }

    this.colorValueChange.emit(this.colorValue);
  }

  getRGBDisplayValue(inputColor: string) {
    //Remove spaces to optimize string length
    let stringSplit = inputColor.split(",");
    return stringSplit.join(",");
  }

  convertValueRGBToColorPickerRGB(inputColor: string) {
    return `rgb(${inputColor})`;
  }

  convertPickerRGBToValueRGB(pickerColor: string) {
    let reducedString = pickerColor.replace("rgb(", "").replace(")", "");

    //Add space after commas to match setting spec
    let stringSplit = reducedString.split(",");
    return stringSplit.join(", ");
  }

  generateRandomColor() {
    let colors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    return colors.join(", ");
  }
}
