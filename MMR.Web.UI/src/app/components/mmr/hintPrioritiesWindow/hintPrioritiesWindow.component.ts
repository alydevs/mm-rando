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
  @Input() sectionSettings: any[] = [];
  @Input() itemList: any[] = [];

  tiers: HintPriorityTier[] = [];
  nextTierId: number = 1;

  // Tooltip for hint priorities dialog
  hintPrioritiesTooltip: string = `Note: this list will be used exclusively if any locations are added.<br>
Settings are not taken into account, but non-randomized and junked locations will not be hinted.<br>
The higher a location appears in this list, the higher its priority. Locations with the same priority will be chosen randomly.<br>
If a location should combine with another location, all the combined locations should be added.<br>
The checkbox indicates that this tier of locations should indicate their importance.<br>
The number (if non-zero) indicates how many of the locations will be hinted, and the rest will be forced to be junk.`;

  ngOnInit() {
    this.loadItemListFromSetting();
    this.initializeTiersFromExistingData();
  }

  loadItemListFromSetting() {
    // Find the OverrideHintPriorities setting in sectionSettings
    const hintPrioritiesSetting = this.sectionSettings.find(s => s.name === "GameplaySettings.OverrideHintPriorities");
    
    if (hintPrioritiesSetting && hintPrioritiesSetting.options) {
      this.itemList = hintPrioritiesSetting.options.map((item: any) => ({
        label: item.text,
        value: item.name
      }));
    } else {
      this.itemList = [];
    }
  }

  initializeTiersFromExistingData() {
    // Initialize from existing data if available
    const currentValues = this.assignmentSettingsMap || {};
    const overrideHintPriorities = currentValues['GameplaySettings.OverrideHintPriorities'] || [];
    const overrideImportanceIndicatorTiers = currentValues['GameplaySettings.OverrideImportanceIndicatorTiers'] || [];
    const overrideHintItemCaps = currentValues['GameplaySettings.OverrideHintItemCaps'] || [];

    if (overrideHintPriorities.length > 0) {
      // Initialize from existing data
      this.tiers = overrideHintPriorities.map((tierItems: string[], index: number) => ({
        id: this.generateTierId(),
        items: tierItems || [],
        indicateImportance: overrideImportanceIndicatorTiers.includes(index) || overrideImportanceIndicatorTiers[index] === 1,
        hintCount: overrideHintItemCaps[index] || 0,
        order: index
      }));
    } else {
      // Create default empty tier
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
      const dialogRef = this.dialogService.open(MMRItemSelectorWindowComponent, {
        autoFocus: true, 
        closeOnBackdropClick: true, 
        closeOnEsc: true, 
        hasBackdrop: true, 
        hasScroll: false,
        context: { 
          dialogHeader: 'Select Items for Tier', 
          selectedItems: tier.items,
          itemList: this.itemList,
          setting: this.setting
        }
      });

      // Set dialog size and position based on app container immediately
      this.resizeDialogToAppContainer('.mmrItemSelector-window', 0.65, 0.65);

      dialogRef.onClose.subscribe((selectedItems: string[]) => {
        if (selectedItems !== null && selectedItems !== undefined) {
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
    if (tier.items.length === 0) {
      return 'Click + to add items';
    }
    
    // Convert item values to labels for display
    const itemLabels = tier.items.map(itemValue => this.getItemLabel(itemValue));
    
    return itemLabels.join(', ');
  }

  getItemLabel(itemValue: string): string {
    const item = this.itemList.find(i => i.value === itemValue);
    return item ? item.label : itemValue;
  }

  confirmDialog() {
    // Format the data according to requirements:
    // 1. OverrideHintPriorities: array of arrays with item pool values for each tier
    const overrideHintPriorities = this.tiers.map(tier => tier.items);
    
    // 2. OverrideImportanceIndicatorTiers: array of indexes where checkbox is checked
    const overrideImportanceIndicatorTiers = this.tiers
      .map((tier, index) => tier.indicateImportance ? index : -1)
      .filter(index => index !== -1);
    
    // 3. OverrideHintItemCaps: array of numbers from the hint count inputs
    const overrideHintItemCaps = this.tiers.map(tier => tier.hintCount);

    const result = {
      'GameplaySettings.OverrideHintPriorities': overrideHintPriorities,
      'GameplaySettings.OverrideImportanceIndicatorTiers': overrideImportanceIndicatorTiers,
      'GameplaySettings.OverrideHintItemCaps': overrideHintItemCaps
    };

    this.assignmentSettingsMap["GameplaySettings.OverrideHintPriorities"] = overrideHintPriorities;
    this.assignmentSettingsMap["GameplaySettings.OverrideImportanceIndicatorTiers"] = overrideImportanceIndicatorTiers;
    this.assignmentSettingsMap["GameplaySettings.OverrideHintItemCaps"] = overrideHintItemCaps;
    
    this.ref.close(result);
  }

  cancelDialog() {
    this.ref.close(null);
  }

  private resizeDialogToAppContainer(selector: string, widthRatio: number, heightRatio: number) {
    const appContainer = document.querySelector('.pageContainer') || 
                       document.querySelector('nb-card') || 
                       document.querySelector('#generator');
        
    if (appContainer) {
      const appRect = appContainer.getBoundingClientRect();
      const dialogElement = document.querySelector(selector) as HTMLElement;
      
      if (dialogElement) {
        const targetWidth = appRect.width * widthRatio;
        const targetHeight = appRect.height * heightRatio;
        
        // Calculate position: horizontally centered in app container, vertically centered in viewport
        const centerX = appRect.left + (appRect.width / 2);
        const centerY = window.innerHeight / 2;
        
        // Set size
        dialogElement.style.width = `${targetWidth}px`;
        dialogElement.style.height = `${targetHeight}px`;
        dialogElement.style.maxWidth = `${targetWidth}px`;
        dialogElement.style.maxHeight = `${targetHeight}px`;
        
        // Set position: centered in viewport
        dialogElement.style.position = 'fixed';
        dialogElement.style.left = `${centerX - (targetWidth / 2)}px`;
        dialogElement.style.top = `${centerY - (targetHeight / 2)}px`;
        dialogElement.style.transform = 'none'; // Remove any existing transforms
        dialogElement.style.zIndex = '1000';
        
      } else {
        const alternativeSelectors = [
          '.mmrItemSelector-window',
          '.mmrHintPriorities-window',
          '[class*="ItemSelector"]',
          '[class*="HintPriorities"]'
        ];
        
        for (const altSelector of alternativeSelectors) {
          const altElement = document.querySelector(altSelector);
        }
      }
    }
  }

  constructor(protected ref: NbDialogRef<MMRHintPrioritiesWindowComponent>, private dialogService: NbDialogService) {}
} 