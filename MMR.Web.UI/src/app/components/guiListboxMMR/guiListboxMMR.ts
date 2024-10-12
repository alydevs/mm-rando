import { Component, Input, IterableDiffers, ChangeDetectorRef } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { GUIGlobal } from '../../providers/GUIGlobal';

import { NbDialogService } from '@nebular/theme';

import { DualListComponent } from 'angular-dual-listbox';
import { BasicList } from 'angular-dual-listbox';

import { DialogWindowComponent } from '../../pages/generator/dialogWindow/dialogWindow.component';

@Component({
  selector: 'mmr-gui-listbox',
  templateUrl: './guiListboxMMR.html',
  styleUrls: ['./guiListboxMMR.scss']
})
export class GUIListboxComponentMMR extends DualListComponent {

  @Input() tooltip: any = 'tooltip';
  @Input() tooltipComponent: any = null;
  @Input() tagFilter: any = null;

  @Input() valueIsHexString: boolean = true;
  @Input() coDependentFilters: boolean = false;
  @Input() presets: any = null;

  selectedTag: any = {};
  currentHexString: string = "";
  currentHexStringOldValue: string = "";
  selectedPresets: any = [];
  currentDestinationList: any = [];
  destinationListChangeSub: any = null;

  reducedWindowSize: boolean = false;
  mobileWindowSize: boolean = false;

  constructor(differs: IterableDiffers, private cd: ChangeDetectorRef, private breakpointObserver: BreakpointObserver, public global: GUIGlobal, private dialogService: NbDialogService) {
    super(differs);

    let breakpointMaxWidth = 1130;
    let breakpointElectronMaxWidth = 730;
    let breakpointMobile = 480;

    if (this.global.getGlobalVar('electronAvailable'))
      breakpointMaxWidth = breakpointElectronMaxWidth;
   
    this.breakpointObserver.observe([
      `(max-width: ${breakpointMaxWidth}px)`
    ]).subscribe((result: BreakpointState) => {
      this.reducedWindowSize = result.matches;
      this.cd.markForCheck();
    });

    this.breakpointObserver.observe([
      `(max-width: ${breakpointMobile}px)`
    ]).subscribe((result: BreakpointState) => {
      this.mobileWindowSize = result.matches;
      this.cd.markForCheck();
    });

  }
  
  ngOnChanges(changeRecord) {

    super.ngOnChanges(changeRecord);

    if (changeRecord['tagFilter']) {

      //Rebuild available filter value list and set default value
      this.selectedTag = {};

      if (this.tagFilter) {

        for (let filter of this.tagFilter) {
          this.selectedTag[filter.name] = "(all)";
        }
      }
    }

    if (changeRecord['destination']) {

      //console.log("Destination list external change, calc hex string and selected presets:", changeRecord['destination'].currentValue);

      this.setNewDestinationList(changeRecord['destination'].currentValue, false);

      //Subscribe to list change event here (only one active sub)
      if (this.destinationListChangeSub)
        this.destinationListChangeSub.unsubscribe();

      this.destinationListChangeSub = this.destinationChange.subscribe(destinationList => {

        //console.log("List changed by user input:", destinationList);
        this.setNewDestinationList(destinationList, false);
      });
    }
  }

  hexInputFocusIn() {
    //Save current value on entering any input field
    this.currentHexStringOldValue = this.currentHexString;
  }

  hexInputFocusOut() {

    this.currentHexString = this.currentHexString.trim().toLowerCase();
    let newValue = this.currentHexString;

    //Only update if the value actually changed
    if (newValue != this.currentHexStringOldValue) {

      if (!this.applyHexString(newValue)) {
        this.currentHexString = this.currentHexStringOldValue;

        //Show error dialog
        console.log("Invalid hex string, revert");
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Error", dialogMessage: "The entered hex string is invalid!" }
        });
      }
    }
  }

  selectedPresetListChange(newSelections: any) {
    //console.log("Selected preset list changed, new:", newSelections);

    let oldSelections = this.selectedPresets;

    //Find added/removed presets
    let addedEntries = [];
    let deletedEntries = [];

    for (let preset of newSelections) {
      if (oldSelections.indexOf(preset) == -1)
        addedEntries.push(preset);
    }

    for (let preset of oldSelections) {
      if (newSelections.indexOf(preset) == -1)
        deletedEntries.push(preset);
    }

    //Clone existing list so we can add/remove from it
    let newList = JSON.parse(JSON.stringify(this.currentDestinationList));

    //Remove all items that are of one of the deleted presets type
    if (deletedEntries.length > 0) {

      for (let i = 0; i < newList.length; i++) {

        if (deletedEntries.indexOf(newList[i].preset) != -1) {
          newList.splice(i, 1);
          i--;
        }
      }
    }

    //Add all items that have one of the added preset types and are not already present
    if (addedEntries.length > 0) {

      for (let option of this.source) {

        if (addedEntries.indexOf(option.preset) == -1)
          continue;

        let alreadyAdded = newList.find(item => item.name === option.name);

        if (alreadyAdded)
          continue;

        newList.push(option);
      }
    }

    this.destination = newList;
    this.setNewDestinationList(this.destination);
  }

  applyHexString(hexString: string) {

    let result = this.global.decodeSearchBoxHexString(hexString, this.source);

    if (!result.success)
      return false;

    this.destination = result.decodedOptions;
    this.setNewDestinationList(this.destination);

    return true;
  }

  setNewDestinationList(destinationList: any, doEmit: boolean = true) {

    this.currentDestinationList = destinationList;

    if (doEmit) {
      this.destinationChange.emit(this.currentDestinationList); //Required so settings get saved
    }
    else {
      //Only need to calculate once after an emit happened
      this.computeHexString();
      this.computeActivePresets();
    }
  }

  computeHexString() {
    this.currentHexString = this.global.encodeSearchBoxSelectionsAsHexString(this.currentDestinationList, this.source);
  }

  computeActivePresets() {

    //ToDo: Performance slow with big list? If so, need to pre-built lookup lists on init. Only 5 ms at worst which seems fine?
    let newActivePresets = [];
    let travelledPresets = [];

    for (let option of this.currentDestinationList) {

      if (travelledPresets.indexOf(option.preset) != -1)
        continue;

      //Check if we have every option of this preset name that can be found in the source list in the destination list
      let presetComplete = true;

      for (let optionSource of this.source) {

        if (optionSource.name === option.name)
          continue;

        if (optionSource.preset != option.preset)
          continue;

        let targetDestination = this.currentDestinationList.find(item => item.name === optionSource.name);

        if (!targetDestination) {
          presetComplete = false;
          break;
        }
      }

      if (presetComplete)
        newActivePresets.push(option.preset);

      travelledPresets.push(option.preset);
    }

    this.selectedPresets = newActivePresets;
  }

  clearFilter(source: BasicList, isAvailable: boolean = false) {

    if (source) {
      source.picker = '';

      for (let key of Object.keys(this.selectedTag)) {
        this.selectedTag[key] = "(all)";
      }

      this.onFilter(source);
    }
  }

  onFilter(source: BasicList) {

    //Filter by Tag
    if (source.name == "available" && Object.keys(this.selectedTag).length > 0) {

      //Check if we really need to filter
      let doFilter = false;

      for (let key of Object.keys(this.selectedTag)) {

        if (this.selectedTag[key] != "(all)") {
          doFilter = true;
          break;
        }
      }

      if (doFilter) {

        //ToDo: Should eventually limit filter options to the ones that are still compatible with other filters not set to "all"
        const filtered = source.list.filter((item: any) => {
          if (Object.prototype.toString.call(item) === '[object Object]') {
            if (item._tags !== undefined) {

              for (let key of Object.keys(this.selectedTag)) {

                if (this.selectedTag[key] != "(all)" && key in item._tags && item._tags[key].indexOf(this.selectedTag[key]) === -1)
                  return false;
              }

              return true;
            } else {
              return true;
            }
          } else {
            return false;
          }
        });

        source.sift = filtered;
        this.unpickExtended(source);
      }
      else {
        source.sift = source.list;
      }
    } else {
      source.sift = source.list;
    }

    //Filter by Search Picker
    if (source.picker.length > 0) {
      try {
        const filtered = source.sift.filter((item: any) => {
          if (Object.prototype.toString.call(item) === '[object Object]') {
            if (item._name !== undefined) {
              // @ts-ignore: remove when d.ts has locale as an argument.
              return item._name.toLocaleLowerCase(this.format.locale).indexOf(source.picker.toLocaleLowerCase(this.format.locale)) !== -1;
            } else {
              // @ts-ignore: remove when d.ts has locale as an argument.
              return JSON.stringify(item).toLocaleLowerCase(this.format.locale).indexOf(source.picker.toLocaleLowerCase(this.format.locale)) !== -1;
            }
          } else {
            // @ts-ignore: remove when d.ts has locale as an argument.
            return item.toLocaleLowerCase(this.format.locale).indexOf(source.picker.toLocaleLowerCase(this.format.locale)) !== -1;
          }
        });
        source.sift = filtered;
        this.unpickExtended(source);
      } catch (e) {
        if (e instanceof RangeError) {
          this.format.locale = undefined;
        }
      }
    }
  }

  private unpickExtended(source: BasicList) {
    for (let i = source.pick.length - 1; i >= 0; i -= 1) {
      if (source.sift.indexOf(source.pick[i]) === -1) {
        source.pick.splice(i, 1);
      }
    }
  }

  buildAvailable(source: Array<any>): boolean {
    const sourceChanges = this.sourceDiffer.diff(source);
    if (sourceChanges) {
      sourceChanges.forEachRemovedItem((r: any) => {
        const idx = this.findItemIndex(this.available.list, r.item, this.key);
        if (idx !== -1) {
          this.available.list.splice(idx, 1);
        }
      });

      sourceChanges.forEachAddedItem((r: any) => {
        // Do not add duplicates even if source has duplicates.
        if (this.findItemIndex(this.available.list, r.item, this.key) === -1) {
          this.available.list.push({ _id: this.makeIdExtended(r.item), _name: this.makeName(r.item), _tags: this.makeTagsExtended(r.item), _tooltip: this.makeTooltipExtended(r.item) });
        }
      });

      if (this.compare !== undefined) {
        this.available.list.sort(this.compare);
      }
      this.available.sift = this.available.list;

      return true;
    }
    return false;
  }

  private makeIdExtended(item: any): string | number {
    if (typeof item === 'object') {
      return item[this.key];
    }
    else {
      return item;
    }
  }

  private makeTooltipExtended(item: any): string {
    if (typeof item === 'object') {
      return item[this.tooltip] ? item[this.tooltip] : "";
    }
    else {
      return item;
    }
  }

  private makeTagsExtended(item: any): string {
    if (typeof item === 'object') {
      return item["tags"] ? item["tags"] : "";
    }
    else {
      return item;
    }
  }

  getNbMultipleSelectLabel(setting) {
    if (this.selectedPresets.length === this.presets.presets.length)
      return "All";

    if (this.mobileWindowSize && (this.selectedPresets.length > 1 || this.selectedPresets.join(", ").length > 16))
      return `Selected: ${this.selectedPresets.length}`;
     
    if ((this.reducedWindowSize && this.selectedPresets.length > 1) || this.selectedPresets.length > 2)
      return `Selected: ${this.selectedPresets.length}`;
    else
      return this.selectedPresets.join(", ");
  }
}
