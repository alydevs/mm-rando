import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { MMRItemSelectorWindowComponent } from '../itemSelectorWindow/itemSelectorWindow.component';

interface HintPriorityTier {
  id: string;
  items: string[];
  indicateImportance: boolean;
  hintCount: number;
  order: number;
}

@Component({
  templateUrl: './hintPrioritiesWindow.html',
  styleUrls: ['./hintPrioritiesWindow.scss'],
})
export class MMRHintPrioritiesWindowComponent implements OnInit {
  @Input() dialogHeader: string = 'Customize Hint Priorities';
  @Input() setting: any = null;
  @Input() assignmentSettingsMap: any = null;
  @Input() assignmentSettingName: string = '';
  @Input() settingTooltip: string = '';
  @Input() itemList: any[] = [];



  tiers: HintPriorityTier[] = [];
  nextTierId: number = 1;

  ngOnInit() {
    this.initializeTiers();
  }

  initializeTiers() {
    this.tiers = [
      {
        id: this.generateTierId(),
        items: [],
        indicateImportance: false,
        hintCount: 0,
        order: 0
      }
    ];
  }

  generateTierId(): string {
    return `tier_${this.nextTierId++}`;
  }

  addTier() {
    const newTier: HintPriorityTier = {
      id: this.generateTierId(),
      items: [],
      indicateImportance: false,
      hintCount: 0,
      order: this.tiers.length
    };
    this.tiers.push(newTier);
  }

  removeTier(tierId: string) {
    this.tiers = this.tiers.filter(tier => tier.id !== tierId);
    this.reorderTiers();
  }

  reorderTiers() {
    this.tiers.forEach((tier, index) => {
      tier.order = index;
    });
  }

  moveTierUp(tierId: string) {
    const tierIndex = this.tiers.findIndex(tier => tier.id === tierId);
    if (tierIndex > 0) {
      const temp = this.tiers[tierIndex];
      this.tiers[tierIndex] = this.tiers[tierIndex - 1];
      this.tiers[tierIndex - 1] = temp;
      this.reorderTiers();
    }
  }

  moveTierDown(tierId: string) {
    const tierIndex = this.tiers.findIndex(tier => tier.id === tierId);
    if (tierIndex < this.tiers.length - 1) {
      const temp = this.tiers[tierIndex];
      this.tiers[tierIndex] = this.tiers[tierIndex + 1];
      this.tiers[tierIndex + 1] = temp;
      this.reorderTiers();
    }
  }

  addItemToTier(tierId: string) {
    const tier = this.tiers.find(t => t.id === tierId);
    if (tier) {      
      this.dialogService.open(MMRItemSelectorWindowComponent, {
        autoFocus: true, 
        closeOnBackdropClick: true, 
        closeOnEsc: true, 
        hasBackdrop: true, 
        hasScroll: false,
        context: { 
          dialogHeader: 'Select Items for Tier', 
          selectedItems: tier.items 
        }
      }).onClose.subscribe((selectedItems: string[]) => {
        if (selectedItems && selectedItems.length > 0) {
          tier.items = selectedItems;
        }
      });
    }
  }

  removeItemFromTier(tierId: string, item: string) {
    const tier = this.tiers.find(t => t.id === tierId);
    if (tier) {
      tier.items = tier.items.filter(i => i !== item);
    }
  }

  getLocationsDisplay(tier: HintPriorityTier): string {
    return tier.items.length > 0 ? tier.items.join(', ') : 'Click + to add items';
  }

  confirmDialog() {
    const result = {
      overrideHintPriorities: this.tiers.map(tier => tier.items),
      overrideImportanceIndicatorTiers: this.tiers
        .map((tier, index) => tier.indicateImportance ? index : -1)
        .filter(index => index !== -1),
      overrideHintItemCaps: this.tiers.map(tier => tier.hintCount)
    };
    this.ref.close(result);
  }

  cancelDialog() {
    this.ref.close(null);
  }

  constructor(protected ref: NbDialogRef<MMRHintPrioritiesWindowComponent>, private dialogService: NbDialogService) {}
} 