import { Component, OnInit, Input, IterableDiffers, ChangeDetectorRef } from '@angular/core';

import { NbDialogService } from '@nebular/theme';
import { NbSelectComponent } from '@nebular/theme/components/select/select.component'

import { GUIGlobal } from '../../providers/GUIGlobal';

import { DialogWindowComponent } from '../../pages/generator/dialogWindow/dialogWindow.component';
import { ConfirmationWindowComponent } from '../../pages/generator/confirmationWindow/confirmationWindow.component';
import { TextInputWindowComponent } from '../../pages/generator/textInputWindow/textInputWindow.component';

//MMR only
import { MMRRandomStartingItemsWindowComponent } from '../../components/mmr/randomStartingItemsWindow/randomStartingItemsWindow.component';
import { MMRHintPrioritiesWindowComponent } from '../../components/mmr/hintPrioritiesWindow/hintPrioritiesWindow.component';
import { MMRItemSelectorWindowComponent } from '../../components/mmr/itemSelectorWindow/itemSelectorWindow.component';

import { GeneratorComponent } from '../../pages/generator/generator.component';

@Component({
  selector: 'gui-settings-element',
  templateUrl: './guiSettingsElement.html',
  styleUrls: ['./guiSettingsElement.scss']
})
export class GUISettingsElement implements OnInit {

  //External inputs
  @Input() app: GeneratorComponent = null;
  @Input() section: any = null;
  @Input() sectionSettings: any = null;
  @Input() setting: any = null;
  @Input() itemIndex: number = null;
  @Input() subSetting: any = null;
  @Input() subSettingIndex: number = null;
  @Input() refEl: any = null;
  @Input() tooltipComponent: any = null;

  //Extra overrides
  @Input() assignmentSettingsMap: any = null;
  @Input() assignmentSettingName: string = null;
  @Input() visibilitySettingsMap: any = null;

  @Input() settingDefault: any = null;
  @Input() settingText: string = null;
  @Input() settingTooltip: string = null;
  @Input() skipLabel: boolean = false;


  constructor(differs: IterableDiffers, private cd: ChangeDetectorRef, public global: GUIGlobal, private dialogService: NbDialogService) {

  }

  ngOnInit() {
  }

  ngOnChanges(changeRecord) {
  }

  getPresetArray() {
    if (typeof (this.global.generator_presets) == "object")
      return Object.keys(this.global.generator_presets);
    else
      return [];
  }

  loadPreset() {

    let targetPreset = this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]];

    if (targetPreset) {
      if (("isNewPreset" in targetPreset) && targetPreset.isNewPreset == true) {
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Warning", dialogMessage: "You can not load this preset!" }
        });
      }
      else {

        if (("isDefaultPreset" in targetPreset) && targetPreset.isDefaultPreset == true) { //RESTORE DEFAULTS
          this.global.applyDefaultSettings();
        }
        else {
          this.global.applyDefaultSettings(); //Restore defaults first in case the user loads an old preset that misses settings
          this.global.applySettingsObject(this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]].settings);
        }

        this.app.recheckAllSettings("", false, true);
        this.app.afterSettingChange();

        //console.log("Preset loaded");
      }
    }
  }

  savePreset(refPresetSelect: NbSelectComponent) {

    let targetPreset = this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]];

    if (targetPreset) {

      if ((("isNewPreset" in targetPreset) && targetPreset.isNewPreset == true)) { //NEW PRESET

        this.dialogService.open(TextInputWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Create new preset", dialogMessage: "Enter preset name:" }
        }).onClose.subscribe(name => {

          if (name && typeof (name) == "string" && name.trim().length > 0) {

            let trimmedName = name.trim();

            if (trimmedName in this.global.generator_presets) {
              this.dialogService.open(DialogWindowComponent, {
                autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Error", dialogMessage: "A preset with this name already exists! If you wish to overwrite an existing preset, please select it from the list and hit Save instead." }
              });
            }
            else {
              this.global.generator_presets[trimmedName] = { settings: this.global.createSettingsFileObject(false, true, !this.global.getGlobalVar('electronAvailable')) };
              this.global.generator_settingsMap["Web.presets"] = trimmedName;
              this.global.saveCurrentPresetsToFile();

              this.cd.markForCheck();
              this.cd.detectChanges();

              refPresetSelect.selected = trimmedName;

              //console.log("Preset created");
            }
          }
        });
      }
      else if (("isDefaultPreset" in targetPreset) && targetPreset.isDefaultPreset == true) { //DEFAULT
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Warning", dialogMessage: "System presets can not be overwritten!" }
        });
      }
      else if (("isProtectedPreset" in targetPreset) && targetPreset.isProtectedPreset == true) { //BUILT IN
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Warning", dialogMessage: "Built in presets are protected and can not be overwritten!" }
        });
      }
      else { //USER PRESETS
        this.dialogService.open(ConfirmationWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Confirm?", dialogMessage: "Do you want to overwrite the preset '" + this.global.generator_settingsMap["Web.presets"] + "' ?" }
        }).onClose.subscribe(confirmed => {

          if (confirmed) {
            this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]] = { settings: this.global.createSettingsFileObject(false, true, !this.global.getGlobalVar('electronAvailable')) };
            this.global.saveCurrentPresetsToFile();

            console.log("Preset overwritten");
          }
        });
      }
    }
  }

  deletePreset() {

    let targetPreset = this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]];

    if (targetPreset) {
      if ((("isNewPreset" in targetPreset) && targetPreset.isNewPreset == true) || (("isDefaultPreset" in targetPreset) && targetPreset.isDefaultPreset == true)) {
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Warning", dialogMessage: "System presets can not be deleted!" }
        });
      }
      else if (("isProtectedPreset" in targetPreset) && targetPreset.isProtectedPreset == true) {
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Warning", dialogMessage: "Built in presets are protected and can not be deleted!" }
        });
      }
      else {
        this.dialogService.open(ConfirmationWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Confirm?", dialogMessage: "Do you really want to delete the preset '" + this.global.generator_settingsMap["Web.presets"] + "' ?" }
        }).onClose.subscribe(confirmed => {

          if (confirmed) {
            delete this.global.generator_presets[this.global.generator_settingsMap["Web.presets"]];
            this.global.generator_settingsMap["Web.presets"] = "[New Preset]";
            this.global.saveCurrentPresetsToFile();

            this.cd.markForCheck();
            this.cd.detectChanges();

            //console.log("Preset deleted");
          }
        });
      }
    }
  }

  //Button settings type listeners
  openOutputDir() { //Electron only

    var path = "";

    if (!this.global.generator_settingsMap["output_dir"] || this.global.generator_settingsMap["output_dir"].length < 1)
      path = "Output";
    else
      path = this.global.generator_settingsMap["output_dir"];

    this.global.createAndOpenPath(path).then(() => {
      console.log("Output dir opened");
    }).catch(err => {
      console.error("Error:", err);

      if (err.message.includes("no such file or directory")) {
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Error", dialogMessage: "The specified output directory does not exist!" }
        });
      }
      else {
        this.dialogService.open(DialogWindowComponent, {
          autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Error", dialogMessage: err }
        });
      }
    });
  }

  openPythonDir() { //Electron only

    this.global.createAndOpenPath("").then(() => {
      console.log("Python dir opened");
    }).catch(err => {
      console.error("Error:", err);

      this.dialogService.open(DialogWindowComponent, {
        autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false, context: { dialogHeader: "Error", dialogMessage: err }
      });
    });
  }

  //MMR only
  openRandomStartingItemsWindow(setting: any, assignmentSettingsMap: any, assignmentSettingName: string, settingDefault: any, settingText: string, settingTooltip: string) {

    this.dialogService.open(MMRRandomStartingItemsWindowComponent, {
      autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false,
      context: { dialogHeader: settingText, setting, assignmentSettingsMap, assignmentSettingName }
    });
  }

  openHintPrioritiesWindow(setting: any, assignmentSettingsMap: any, assignmentSettingName: string, settingDefault: any, settingText: string, settingTooltip: string) {

    this.dialogService.open(MMRHintPrioritiesWindowComponent, {
      autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false,
      context: { dialogHeader: settingText, setting, assignmentSettingsMap, assignmentSettingName }
    }).onClose.subscribe(result => {
      if (result) {
        console.log('Hint priorities result:', result);
        // TODO: Update the settings with the result
      }
    });
  }

  openItemSelectorWindow(setting: any, assignmentSettingsMap: any, assignmentSettingName: string, settingDefault: any, settingText: string, settingTooltip: string) {

    this.dialogService.open(MMRItemSelectorWindowComponent, {
      autoFocus: true, closeOnBackdropClick: true, closeOnEsc: true, hasBackdrop: true, hasScroll: false,
      context: { dialogHeader: settingText, setting, assignmentSettingsMap, assignmentSettingName }
    }).onClose.subscribe(result => {
      if (result) {
        console.log('Item selector result:', result);
        // TODO: Update the settings with the result
      }
    });
  }

  generateDictSetting(mainSetting, keySetting) {

    let newKeySetting = { ...keySetting };
    newKeySetting.type = mainSetting.inner_type;

    return newKeySetting;
  }

  evaluateLinkedDictSettingVisibility(dictSetting: any, allDictSettings: any, currSelectedDictKey: string, visibilitySettingsMap: any) {

    //Note: Only supports simple complexity
    let visibilityObj = {};

    //By default every dict sub setting is enabled
    visibilityObj[dictSetting.name] = true;

    //Immediately return disabled if the dict setting is disabled globally
    if (!visibilitySettingsMap[dictSetting.name]) {
      visibilityObj[dictSetting.name] = false;
      return visibilityObj;
    }

    //See if any other dict setting disables this setting with the current key selected
    for (let setting of allDictSettings) {

      if (setting.type == "Checkbutton" && setting.options) {

        for (let option of setting.options) {

          if ("controls_visibility_setting" in option) {
            let settingsList = option.controls_visibility_setting.split(",");

            if (settingsList.indexOf(dictSetting.name) != -1) {

              let currentValue = this.global.generator_settingsMap[setting.name][currSelectedDictKey];

              if (currentValue === option.name) {
                //console.log("In active key:", currSelectedDictKey, dictSetting.name, "is actively disabled by:", setting.name, "being set to:", option.name);
                visibilityObj[dictSetting.name] = false;
                return visibilityObj;
              }
            }
          }
        }
      }
    }

    return visibilityObj;
  }
}
