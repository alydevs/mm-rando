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
    const customItemListSetting = this.findCustomItemListSetting();
    
    if (customItemListSetting && customItemListSetting.options) {
      this.allItems = Object.keys(customItemListSetting.options).map(key => {
        const option = customItemListSetting.options[key];
        return {
          name: key,
          label: option.text || key,
          selected: this.selectedItems.includes(key)
        };
      });
    } 
  }

  findCustomItemListSetting(): any {
    return {
        options: {
          "Starting Item (Deku Mask)": { text: "Starting Item (Deku Mask)", index: 0 },
          "Hero's Bow Chest (Hero's Bow)": { text: "Hero's Bow Chest (Hero's Bow)", index: 1 },
          "Bottle Aliens (Bottle)": { text: "Bottle Aliens (Bottle)", index: 2 },
          "Bottle Goron Race (Bottle)": { text: "Bottle Goron Race (Bottle)", index: 3 },
          "Bottle Dampe (Bottle)": { text: "Bottle Dampe (Bottle)", index: 4 },
          "Giant Wallet (Wallet)": { text: "Giant Wallet (Wallet)", index: 5 },
          "Heart Piece Termina Gossip Stones (Heart Piece)": { text: "Heart Piece Termina Gossip Stones (Heart Piece)", index: 6 },
          "Heart Piece Boat Archery (Heart Piece)": { text: "Heart Piece Boat Archery (Heart Piece)", index: 7 },
          "Heart Piece Sea Horse (Heart Piece)": { text: "Heart Piece Sea Horse (Heart Piece)", index: 8 },
          "Heart Piece Fisherman Game (Heart Piece)": { text: "Heart Piece Fisherman Game (Heart Piece)", index: 9 },
          "Mask of Scents (Mask)": { text: "Mask of Scents (Mask)", index: 10 },
          "Mask of Romani (Mask)": { text: "Mask of Romani (Mask)", index: 11 },
          "Mask of Truth (Mask)": { text: "Mask of Truth (Mask)", index: 12 },
          "Bottle Beavers (Bottle)": { text: "Bottle Beavers (Bottle)", index: 13 },
          "Ice Arrow (Arrow)": { text: "Ice Arrow (Arrow)", index: 14 },
          "Light Arrow (Arrow)": { text: "Light Arrow (Arrow)", index: 15 },
          "Heart Piece Ocean Spider House (Heart Piece)": { text: "Heart Piece Ocean Spider House (Heart Piece)", index: 16 },
          "Mask of Bunny Hood (Mask)": { text: "Mask of Bunny Hood (Mask)", index: 17 },
          "Heart Piece Bank (Heart Piece)": { text: "Heart Piece Bank (Heart Piece)", index: 18 },
          "Trade Item Kafei Letter (Trade Item)": { text: "Trade Item Kafei Letter (Trade Item)", index: 19 },
          "Heart Piece Dog Race (Heart Piece)": { text: "Heart Piece Dog Race (Heart Piece)", index: 20 },
          "Mask of Circus Leader (Mask)": { text: "Mask of Circus Leader (Mask)", index: 21 }
        }
    };
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