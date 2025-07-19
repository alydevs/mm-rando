import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

interface RandomStartingItemPool {
  id: number;
  name: string;
  items: any[];
  itemCount: number;
}

@Component({
  templateUrl: './randomStartingItemsWindow.html',
  styleUrls: ['./randomStartingItemsWindow.scss'],
})
export class MMRRandomStartingItemsWindowComponent implements OnInit {
  @Input() dialogHeader: string = '';
  @Input() setting: any = null;
  @Input() assignmentSettingsMap: any = null;
  @Input() assignmentSettingName: string = '';
  @Input() settingTooltip: string = '';
  @Input() itemList: any[] = [];

  allItems: any[] = [];
  pools: RandomStartingItemPool[] = [];

  ngOnInit() {
    this.loadItemList();
    this.initializePools();
  }

  loadItemList() {
    // well...go for it db.
    this.allItems = [];
  }

  initializePools() {
    this.pools = [
      { id: 1, name: 'Pool 1', items: [], itemCount: 0 },
      { id: 2, name: 'Pool 2', items: [], itemCount: 0 },
      { id: 3, name: 'Pool 3', items: [], itemCount: 0 },
      { id: 4, name: 'Pool 4', items: [], itemCount: 0 },
    ];
  }

  onItemDrop(event: any, poolIndex: number) {
    const item = event.dragData;
    if (!this.pools[poolIndex].items.some((i) => i.name === item.name)) {
      this.pools[poolIndex].items.push(item);
      this.pools.forEach((pool, idx) => {
        if (idx !== poolIndex) {
          pool.items = pool.items.filter((i) => i.name !== item.name);
        }
      });
    }
  }

  onRemoveFromPool(item: any, poolIndex: number) {
    this.pools[poolIndex].items = this.pools[poolIndex].items.filter((i) => i.name !== item.name);
  }

  confirmDialog() {
    this.ref.close(this.pools);
  }

  cancelDialog() {
    this.ref.close(null);
  }

  constructor(protected ref: NbDialogRef<MMRRandomStartingItemsWindowComponent>) {}
}
