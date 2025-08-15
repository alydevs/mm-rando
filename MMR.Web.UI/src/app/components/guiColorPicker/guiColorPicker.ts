import { Component, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'zsr-gui-color-picker',
  templateUrl: './guiColorPicker.html',
  styleUrls: ['./guiColorPicker.scss'],
  standalone: false
})
export class GUIColorPickerComponent implements AfterViewInit {

  @Input() tooltip: any = 'tooltip';
  @Input() tooltipComponent: any = null;

  @Input() disabled: boolean = false;
  @Input() colorArraySize: number = null;
  @Input() colorValue: any = null;

  @Output() colorValueChange: EventEmitter<any> = null;

  constructor(
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.colorValueChange = new EventEmitter<any>();
  }

  ngAfterViewInit() {
    // Set up a mutation observer to watch for color picker elements being added
    this.setupColorPickerPositioning();
  }

  ngOnDestroy() {
    // Clean up event listeners
  }

  ngOnChanges(changeRecord) {
  }

  private setupColorPickerPositioning() {
    // Create a mutation observer to watch for color picker elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList && element.classList.contains('color-picker')) {
                // Only position once when first added
                if (!element.hasAttribute('data-positioned')) {
                  this.fixColorPickerPosition(element as HTMLElement);
                  element.setAttribute('data-positioned', 'true');
                }
              }
            }
          });
        }
      });
    });

    // Start observing the document body for color picker additions
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private fixColorPickerPosition(colorPicker: HTMLElement) {
    // Find the trigger element (the nb-user that was clicked)
    const triggerElement = this.findTriggerElement();
    if (!triggerElement) return;

    // Get the trigger element's position
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const pickerHeight = colorPicker.offsetHeight || 300; // Approximate height if not yet rendered
    const pickerWidth = colorPicker.offsetWidth || 230; // Approximate width if not yet rendered

    // Calculate optimal position
    let top: number;
    let left: number;

    // Position horizontally - prefer right, fallback to left if not enough space
    const rightSpace = viewportWidth - triggerRect.right;
    const leftSpace = triggerRect.left;
    
    if (rightSpace >= pickerWidth + 10) {
      // Position to the right with 10px offset
      left = triggerRect.right + 10;
    } else if (leftSpace >= pickerWidth + 10) {
      // Position to the left with 10px offset
      left = triggerRect.left - pickerWidth - 10;
    } else {
      // Center on the trigger element if no good side positioning
      left = triggerRect.left + (triggerRect.width / 2) - (pickerWidth / 2);
    }

    // Position vertically - prefer above, with standard offset plus 300px down
    if (triggerRect.top - pickerHeight - 5 >= 0) {
      // Position above the trigger with 5px offset plus 300px down
      top = triggerRect.top - pickerHeight - 5 + 300;
    } else if (triggerRect.bottom + pickerHeight + 5 <= viewportHeight) {
      // Position below the trigger if no space above
      top = triggerRect.bottom + 5;
    } else {
      // Center in viewport if no good position
      top = Math.max(10, (viewportHeight - pickerHeight) / 2);
    }

    // Final boundary checks to ensure we don't go off-screen
    if (left < 10) left = 10;
    if (left + pickerWidth > viewportWidth - 10) {
      left = viewportWidth - pickerWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + pickerHeight > viewportHeight - 10) {
      top = viewportHeight - pickerHeight - 10;
    }

    // Apply the positioning immediately
    this.renderer.setStyle(colorPicker, 'position', 'fixed');
    this.renderer.setStyle(colorPicker, 'top', `${top}px`);
    this.renderer.setStyle(colorPicker, 'left', `${left}px`);
    this.renderer.setStyle(colorPicker, 'z-index', '9999');
  }

  private findTriggerElement(): HTMLElement | null {
    // Find the nb-user element within this component
    const nbUser = this.elementRef.nativeElement.querySelector('nb-user');
    return nbUser;
  }

  openColorPicker(refColorPicker: HTMLInputElement = null, colorIndex: number = null) {
    //Open color picker
    if (refColorPicker && !this.disabled) {
      refColorPicker.click();
      
      // Wait a bit for the color picker to render, then fix its position
      setTimeout(() => {
        const colorPicker = document.querySelector('.color-picker');
        if (colorPicker) {
          this.fixColorPickerPosition(colorPicker as HTMLElement);
        }
      }, 100);
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
