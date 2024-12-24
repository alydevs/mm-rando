import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { GUIGlobal } from '../../../providers/GUIGlobal';

interface SelectableItem {
  name: string;
  label: string;
  selected: boolean;
}

@Component({
  templateUrl: './itemSelectorWindow.html',
  styleUrls: ['./itemSelectorWindow.scss'],
})
export class MMRItemSelectorWindowComponent implements OnInit {
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

  ngOnInit() {
    this.loadItemList();
    this.filterItems();
  }

  loadItemList() {
    if (this.itemList && this.itemList.length > 0) {
      this.allItems = this.itemList.map((item: any) => ({
        name: item.value,
        label: item.label,
        selected: this.selectedItems.includes(item.value)
      }));
      return;
    }

    // If setting has options (for settings with ItemList), use those
    if (this.setting && this.setting.options) {
      this.allItems = this.setting.options.map((item: any) => ({
        name: item.Value,
        label: item.Label,
        selected: this.selectedItems.includes(item.Value)
      }));
      return;
    }

    this.allItems = [];
  }




  filterItems() {
    if (!this.searchTerm) {
      this.filteredItems = this.allItems;
    } else {
      this.filteredItems = this.allItems.filter(item =>
        item.label.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
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
} 