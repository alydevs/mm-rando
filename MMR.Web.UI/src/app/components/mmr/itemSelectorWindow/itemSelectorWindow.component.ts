import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { GUIGlobal } from '../../../providers/GUIGlobal';

interface SelectableItem {
  name: string;
  label: string;
  selected: boolean;
  regionDisplay: string;
  regionSearchLower: string;
}

@Component({
  templateUrl: './itemSelectorWindow.html',
  styleUrls: ['./itemSelectorWindow.scss'],
})
export class MMRItemSelectorWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() dialogHeader: string = 'Select Items';
  @Input() setting: any = null;
  @Input() assignmentSettingsMap: any = null;
  @Input() assignmentSettingName: string = '';
  @Input() settingTooltip: string = '';
  @Input() itemList: any[] = [];
  @Input() selectedItems: string[] = [];

  allItems: SelectableItem[] = [];
  searchTerm: string = '';
  filteredItems: SelectableItem[] = [];

  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: any = null;

  ngOnInit() {
    this.loadItemList();
    this.filterItems();
    this.adjustColumnsForDialogWidth();
  }

  ngAfterViewInit() {
    // Adjust columns after view is initialized
    setTimeout(() => {
      this.adjustColumnsForDialogWidth();
      this.setupResizeListener();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up resize listener
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  loadItemList() {
    if (this.itemList && this.itemList.length > 0) {
      this.allItems = this.itemList.map((item: any) => {
        const regions = item.tags.Regions;
        const regionList: string[] = Array.isArray(regions)
          ? regions
              .filter((r: any) => r !== null && r !== undefined)
              .map((r: any) => String(r))
          : (typeof regions === 'string' || typeof regions === 'number')
          ? [String(regions)]
          : [];
        const regionDisplay = regionList.join(', ');

        return {
          name: item.value,
          label: item.label,
          selected: this.selectedItems.includes(item.value),
          regionDisplay: regionDisplay || undefined,
          regionSearchLower: regionDisplay ? regionDisplay.toLowerCase() : undefined,
        } as SelectableItem;
      });
      return;
    }

    // If setting has options (for settings with ItemList), use those
    if (this.setting && this.setting.options) {
      this.allItems = this.setting.options.map((item: any) => {
        const regions = item.tags.Regions;
        const regionList: string[] = Array.isArray(regions)
          ? regions
              .filter((r: any) => r !== null && r !== undefined)
              .map((r: any) => String(r))
          : (typeof regions === 'string' || typeof regions === 'number')
          ? [String(regions)]
          : [];
        const regionDisplay = regionList.join(', ');

        return {
          name: item.Value,
          label: item.Label,
          selected: this.selectedItems.includes(item.Value),
          regionDisplay: regionDisplay || undefined,
          regionSearchLower: regionDisplay ? regionDisplay.toLowerCase() : undefined,
        } as SelectableItem;
      });
      return;
    }

    this.allItems = [];
  }




  filterItems() {
    const term = (this.searchTerm || '').toLowerCase();
    if (!term) {
      this.filteredItems = this.allItems;
      return;
    }

    this.filteredItems = this.allItems.filter((item) => {
      if (item.label && item.label.toLowerCase().includes(term)) return true;
      if (item.name && item.name.toLowerCase().includes(term)) return true;
      if (item.regionSearchLower && item.regionSearchLower.includes(term)) return true;
      return false;
    });
  }

  onSearchChange() {
    this.filterItems();
  }

  toggleItem(item: SelectableItem) {
    item.selected = !item.selected;
  }

  selectAll() {
    this.allItems.forEach(item => item.selected = true);
    this.filterItems();
  }

  deselectAll() {
    this.allItems.forEach(item => item.selected = false);
    this.filterItems();
  }

  getSelectedItems(): string[] {
    return this.allItems
      .filter(item => item.selected)
      .map(item => item.name);
  }

  getSelectedCount(): number {
    return this.allItems.filter(item => item.selected).length;
  }

  confirmDialog() {
    const selectedItems = this.getSelectedItems();
    this.ref.close(selectedItems);
  }

  cancelDialog() {
    this.ref.close(null);
  }

  constructor(protected ref: NbDialogRef<MMRItemSelectorWindowComponent>, public global: GUIGlobal) {}

  /**
   * Dynamically adjust the number of columns based on actual dialog width
   * This provides a fallback for browsers without container query support
   */
  private adjustColumnsForDialogWidth() {
    const dialogElement = document.querySelector('.mmrItemSelector-window') as HTMLElement;
    if (!dialogElement) return;

    const dialogWidth = dialogElement.offsetWidth;
    const itemsGrid = dialogElement.querySelector('.items-grid') as HTMLElement;
    if (!itemsGrid) return;

    // Calculate optimal number of columns based on available width
    const minColumnWidth = 200; // Minimum width per column
    const gap = 5; // Gap between columns
    const padding = 20; // Account for padding and margins
    
    const availableWidth = dialogWidth - padding;
    const maxColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap));
    
    // Ensure we have at least 1 column and at most 3
    const optimalColumns = Math.max(1, Math.min(3, maxColumns));
    
    // Apply the column count
    itemsGrid.style.gridTemplateColumns = `repeat(${optimalColumns}, 1fr)`;
    
    // Adjust minimum column width for very narrow dialogs
    if (dialogWidth < 500) {
      const adjustedMinWidth = Math.max(160, (availableWidth - (gap * (optimalColumns - 1))) / optimalColumns);
      itemsGrid.style.setProperty('--min-column-width', `${adjustedMinWidth}px`);
    }
    
    // Enable text wrapping for narrow dialogs
    const itemLabels = dialogElement.querySelectorAll('.item-label') as NodeListOf<HTMLElement>;
    itemLabels.forEach(label => {
      if (dialogWidth < 600) {
        label.style.whiteSpace = 'normal';
        label.style.wordWrap = 'break-word';
      } else {
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
      }
    });
  }

  /**
   * Set up resize listener for the dialog
   */
  private setupResizeListener() {
    const dialogElement = document.querySelector('.mmrItemSelector-window') as HTMLElement;
    if (!dialogElement) return;

    // Use ResizeObserver if available, otherwise fall back to window resize
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        // Debounce resize events
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          this.adjustColumnsForDialogWidth();
        }, 100);
      });
      this.resizeObserver.observe(dialogElement);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          this.adjustColumnsForDialogWidth();
        }, 100);
      });
    }
  }
} 