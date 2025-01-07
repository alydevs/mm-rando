const fs = require("fs");

const settingsDump = JSON.parse(fs.readFileSync("./inputFiles/settings_dump.json", "utf8"));
const settingsExtra = JSON.parse(fs.readFileSync("./inputFiles/settings_extra.json", "utf8"));
const settingsMapping = JSON.parse(fs.readFileSync("./inputFiles/settings_mapping.json", "utf8"));

function createSettingsList(version) {

    let settingsList = {
        settingsObj: {},
        settingsArray: [],
        cosmeticsObj: {},
        cosmeticsArray: [],
        distroArray: []
    };

    for (let tab of settingsMapping.Tabs) {

        let tabArray = { name: tab.name, text: tab.text, app_type: tab.app_type, sections: [] };
        let tabObject = {
            text: tab.text,
            app_type: tab.app_type,
            sections: {}
        };

        if (tab.footer) {
            tabArray.footer = true;
            tabObject.footer = true;
        }

        for (let section of tab.sections) {

            let sectionArray = {
                name: section.name,
                text: section.text,
                settings: []
            };

            let sectionObject = {
                text: section.text,
                settings: {}
            };

            if (section.subheader) {
                sectionArray.subheader = section.subheader;
                sectionObject.subheader = section.subheader;
            }

            if ("col_span" in section) {
                sectionArray.col_span = section.col_span;
                sectionObject.col_span = section.col_span;
            }

            if ("row_span" in section) {
                sectionArray.row_span = section.row_span;
                sectionObject.row_span = section.row_span;
            }

            if (section.is_colors) {
                sectionArray.is_colors = true;
                sectionObject.is_colors = true;
            }

            if (section.is_sfx) {
                sectionArray.is_sfx = true;
                sectionObject.is_sfx = true;
            }

            for (let setting of section.settings) {

                let settingsData = assembleSetting(version, setting);

                if (!settingsData)
                    continue;

                sectionArray.settings.push(settingsData.settingArray);
                sectionObject.settings[settingsData.settingName] = settingsData.settingObject;

                //If this setting defined any children, push them too
                if (settingsData.childSettings.length > 0) {

                    for (let childSettingsData of settingsData.childSettings) {
                        sectionArray.settings.push(childSettingsData.settingArray);
                        sectionObject.settings[childSettingsData.settingName] = childSettingsData.settingObject;
                    }
                }
            }

            tabArray.sections.push(sectionArray);
            tabObject.sections[section.name] = sectionObject;
        }

        settingsList.settingsObj[tab.name] = tabObject;
        settingsList.settingsArray.push(tabArray);

        if (tab.is_cosmetics) {
            settingsList.cosmeticsObj[tab.name] = tabObject;
            settingsList.cosmeticsArray.push(tabArray);
        }
    }

    fs.writeFileSync("settings_list.json", JSON.stringify(settingsList));
}

function resolveSettingType(dataType, isValueType = false, linkedSettings = false) {

    if (isValueType) {

        if (linkedSettings) {
            //Multi linked settings ValueType
            switch (dataType) {
                case "Boolean":
                    return 'Checkbutton';
                case "Enum":
                    return 'Combobox';
                case "Color":
                case "Color[]":
                    return 'Color';
                case "Byte":
                case "Int32":
                    return 'Numberinput';
                default: {
                    console.error("Unknown linked ValueType:", dataType);
                }
            }
        }
        else {
            //Individual ValueType
            switch (dataType) {
                case "Boolean":
                    return 'MultipleSelect';
                case "Enum":
                    return 'Combobox';
                case "Color":
                case "Color[]":
                    return 'Color';
                case "Byte":
                case "Int32":
                    return 'Numberinput';
                default: {
                    console.error("Unknown single ValueType:", dataType);
                }
            }
        }
    }
    else {
        //Single DataType
        switch (dataType) {
            case "Boolean":
                return 'Checkbutton';
            case "Enum":
                return 'Combobox';
            case "Enum[]":
                return 'MultipleSelect';
            case "String":
                return "Textinput";
            case "String[]":
                return 'SearchBox';
            case "ItemList":
                return 'SearchBoxMMR';
            case "FlagEnum":
                return 'MultipleSelect';
            case "Dictionary":
                return 'Dictionary';
            case "Color":
                return 'Color';
            case "Byte":
            case "Int32":
                return 'Scale';
            case "Decimal":
                return 'Numberinput';
            case "File":
                return 'Fileinput';
            default: {
                console.error("Unknown single DataType:", dataType);
            }
        }
    }
}

function resolveSettingsExclusions(settingType, setting, optionsArray, optionsObject) {

    if (!("SettingExcludes" in setting))
        return;

    let optionsVisibility = {};
    
    for (let key of Object.keys(setting.SettingExcludes)) {
        optionsVisibility[key] = { controls_visibility_setting: setting.SettingExcludes[key].join(",") };
    }

    for (let i = 0; i < optionsArray.length; i++) {

        let option = optionsArray[i];
        let optionNameLookup = option.name;

        //Lookup key overrides
        switch (settingType) {
            case "Checkbutton": {

                if (optionNameLookup == false)
                    optionNameLookup = "False";
                else if (optionNameLookup == true)
                    optionNameLookup = "True";

                break;
            }
            default: {
                break;
            }
        }

        if (optionNameLookup in optionsVisibility) {
            optionsArray[i] = { ...option, ...optionsVisibility[optionNameLookup] };
            optionsObject[option.name] = { ...optionsObject[option.name], ...optionsVisibility[optionNameLookup] };
        }
    }
}

function isSettingShared(settingName) {

    if (settingName.startsWith("GameplaySettings."))
        return true;

    return false;
}

function splitCamelCaseString(text) {

    let splitGrep = /(?<!^)(?=[A-Z])/g;
    let split = text.split(splitGrep);

    let outText = split.join(" ");

    //Common occurences
    outText = outText.replace("I D", "ID");

    return outText;
}

function assembleSetting(version, setting, linkedSettings = false, overrideBaseType = null) {

    let settingName;
    let settingArray;
    let settingObject;
    let settingType;
    let settingTypeOriginal = null;
    let settingTypeOriginalDerived = null;

    let childSettings = []; //An extra list of settings to push (used by linked dictionaries)

    if (!Array.isArray(setting)) {

        //Single setting (normal)
        settingName = setting;

        let resolvedSetting = settingsDump.find(item => {
            return item.Path === setting;
        });

        if (!resolvedSetting) {

            let resolvedSettingExtra = settingsExtra.find(item => {
                return item.name === setting;
            });

            if (!resolvedSettingExtra) {
                console.error("Skip setting:", setting, "because it could not be resolved!");
                return null;
            }
            else {
                //Extra settings are copied directly into the output if the normal settings dump has no equivalent and the extra entry is complete
                if (!("type" in resolvedSettingExtra)) {
                    console.error("Skip setting:", setting, "because it could not be resolved and the found extra setting is incomplete:", resolvedSettingExtra);
                    return null;
                }

                settingName = resolvedSettingExtra.name;
                settingType = resolvedSettingExtra.type;
                settingArray = JSON.parse(JSON.stringify(resolvedSettingExtra));

                let settingCopy = JSON.parse(JSON.stringify(resolvedSettingExtra));
                delete settingCopy["name"];

                settingObject = settingCopy;
            }
        }
        else {
            settingTypeOriginal = resolvedSetting.DataType;
            settingTypeOriginalDerived = settingTypeOriginal === "Dictionary" ? resolvedSetting.ValueType : settingTypeOriginal;

            settingType = overrideBaseType ? overrideBaseType : resolveSettingType(resolvedSetting.DataType);
            let optionsArray = [];
            let optionsObject = {}; 

            //Options add
            switch (settingType) {
                case "Checkbutton":
                    {
                        optionsArray.push({
                            name: true,
                            text: "checked"
                        });

                        optionsArray.push({
                            name: false,
                            text: "unchecked"
                        });

                        optionsObject["true"] = { text: "checked" };
                        optionsObject["false"] = { text: "unchecked" };

                        break;
                    }
                case "Combobox": //Enum
                case "MultipleSelect": //FlagEnum and Enum[]
                    {
                        for (let option of resolvedSetting.Values) {

                            if (!("Label" in option)) {

                                if (settingType === "Combobox") { //Enum
                                    console.error("Invalid empty option entry in Combobox:", resolvedSetting);
                                } 

                                continue;
                            }

                            let arrayValue = {
                                name: option.Value,
                                text: option.Label
                            };

                            optionsObject[option.Value] = { text: option.Label };

                            if ("Tooltip" in option) {
                                arrayValue.tooltip = option.Tooltip;
                                optionsObject[option.Value].tooltip = option.Tooltip;
                            }

                            optionsArray.push(arrayValue);
                        }

                        break;
                    }
                case "SearchBox":
                    {
                        //String[]
                        //Linked setting detection
                        let linkedSetting = "LinkedSettingPath" in resolvedSetting ? resolvedSetting.LinkedSettingPath : null;

                        if (linkedSetting == null && setting === "GameplaySettings.EnabledTricks")
                            linkedSetting = "GameplaySettings.LogicMode"; //ToDo: Remove hardcode and rely on LinkedSettingPath instead

                        if (linkedSetting) {
                            optionsArray = {}; //Turn outer array into object
                        }

                        const optionKeys = ["TrickInfo"]; //ToDo: Hacky...Identify options through key detection

                        for (let optionKey of optionKeys) {

                            if (!(optionKey in resolvedSetting))
                                continue;

                            if (linkedSetting) {

                                //Linked setting parsing. Options are scoped by linked setting value
                                for (let linkedSettingValue of Object.keys(resolvedSetting[optionKey])) {

                                    optionsArray[linkedSettingValue] = [];
                                    optionsObject[linkedSettingValue] = {};

                                    //Options are further scoped by tags
                                    for (let tagName of Object.keys(resolvedSetting[optionKey][linkedSettingValue])) {

                                        let adjustedTagName = tagName; //Used verbatim for now

                                        //Final layer are the options
                                        for (let option of resolvedSetting[optionKey][linkedSettingValue][tagName]) {

                                            if (!("Label" in option)) {
                                                console.error("Invalid empty option entry in SearchBox:", resolvedSetting);
                                                continue;
                                            }

                                            let optionName = option.Label;

                                            //Duplicate label protection
                                            if (optionName in optionsObject[linkedSettingValue]) {
                                                //Add tag to the other existing setting instead
                                                optionsObject[linkedSettingValue][optionName].tags.push(adjustedTagName);

                                                let arrayOpt = optionsArray[linkedSettingValue].find(arrayOption => arrayOption.name === optionName);

                                                if (arrayOpt)
                                                    arrayOpt.tags.push(adjustedTagName);

                                                continue;
                                            }

                                            let arrayValue = {
                                                name: optionName,
                                                text: option.Label,
                                                tags: [adjustedTagName]
                                            };

                                            optionsObject[linkedSettingValue][optionName] = {
                                                text: option.Label,
                                                tags: [adjustedTagName]
                                            };

                                            if ("Tooltip" in option) {
                                                arrayValue.tooltip = option.Tooltip;
                                                optionsObject[linkedSettingValue][optionName].tooltip = option.Tooltip;
                                            }

                                            optionsArray[linkedSettingValue].push(arrayValue);
                                        }
                                    }
                                }
                            }
                            else {

                                //Flat parsing without any linked setting
                                for (let option of resolvedSetting[optionKey]) {

                                    if (!("Label" in option)) {
                                        console.error("Invalid empty option entry in SearchBox:", resolvedSetting);
                                        continue;
                                    }

                                    let optionName = option.Label;

                                    //Duplicate label protection
                                    if (optionName in optionsObject) {
                                        console.error("Option in SearchBox already exists with name, duplicates not allowed:", optionName, resolvedSetting);
                                        continue;
                                    }

                                    let arrayValue = {
                                        name: optionName,
                                        text: option.Label,
                                        tags: {}
                                    };

                                    optionsObject[optionName] = {
                                        index: option.Index,
                                        text: option.Label,
                                        tags: {}
                                    };

                                    if ("Tooltip" in option) {
                                        arrayValue.tooltip = option.Tooltip;
                                        optionsObject[optionName].tooltip = option.Tooltip;
                                    }

                                    //Dynamically process Additional Information
                                    if ("AdditionalInformation" in option) {

                                        let extraInfo = option.AdditionalInformation;
                                      
                                        //Add tags if present
                                        const tagKeys = []; //ToDo: Hacky...

                                        for (let tagKey of tagKeys) {

                                            if (tagKey in extraInfo) {

                                                let info = extraInfo[tagKey];
                                                let tags = null;

                                                if (typeof (info) == "string") {
                                                    //Single
                                                    tags = [info];
                                                }
                                                else {
                                                    //Array. Multi. Copied
                                                    tags = JSON.parse(JSON.stringify(info));
                                                }

                                                //Loop tags and ensure string is split at each uppercase letter
                                                let adjustedTags = [];

                                                for (let tag of tags) {
                                                    adjustedTags.push(splitCamelCaseString(tag));
                                                }

                                                arrayValue.tags[tagKey] = adjustedTags;
                                                optionsObject[optionName].tags[tagKey] = adjustedTags;
                                            }
                                        }
                                    }

                                    optionsArray.push(arrayValue);
                                }
                            }
                        }

                        break;
                    }
                case "SearchBoxMMR":
                    {
                        //ItemList. This type also renders with a Textinput on top that shows the assembled bit string
                        for (let option of resolvedSetting.ItemList) {

                            if (!("Label" in option)) {
                                console.error("Invalid empty option entry in SearchBoxMMR:", resolvedSetting);
                                continue;
                            }

                            let optionName = option.Label;

                            //Duplicate label protection
                            if (optionName in optionsObject) {

                                //Apply suffix until newName doesn't exist
                                let suffixCounter = 2;
                                let newName = optionName + " " + suffixCounter;

                                while (newName in optionsObject) {
                                    suffixCounter++;
                                    newName = optionName + " " + suffixCounter;
                                }

                                optionName = newName;
                            }

                            let arrayValue = {
                                index: option.Index,
                                name: optionName,
                                text: option.Label,
                                tags: {}
                            };

                            optionsObject[optionName] = {
                                index: option.Index,
                                text: option.Label,
                                tags: {}
                            };

                            if ("Tooltip" in option) {
                                arrayValue.tooltip = option.Tooltip;
                                optionsObject[optionName].tooltip = option.Tooltip;
                            }

                            //Dynamically process Additional Information
                            if ("AdditionalInformation" in option) {

                                let extraInfo = option.AdditionalInformation;

                                //Add preset if present
                                if ("ClassicCategory" in extraInfo) { //ToDo: Hacky...
                                    let adjustedLabel = splitCamelCaseString(extraInfo.ClassicCategory);

                                    arrayValue.preset = adjustedLabel;
                                    optionsObject[optionName].preset = adjustedLabel;
                                }

                                //Add tags if present
                                const tagKeys = ["ItemCategory", "LocationCategory", "Regions"]; //ToDo: Hacky...

                                for (let tagKey of tagKeys) {

                                    if (tagKey in extraInfo) {

                                        let info = extraInfo[tagKey];
                                        let tags = null;

                                        if (typeof (info) == "string") {
                                            //Single
                                            tags = [info];
                                        }
                                        else {
                                            //Array. Multi. Copied
                                            tags = JSON.parse(JSON.stringify(info));
                                        }

                                        //Loop tags and ensure string is split at each uppercase letter
                                        let adjustedTags = [];

                                        for (let tag of tags) {
                                            adjustedTags.push(splitCamelCaseString(tag));
                                        }

                                        arrayValue.tags[tagKey] = adjustedTags;
                                        optionsObject[optionName].tags[tagKey] = adjustedTags;
                                    }
                                }
                            }

                            optionsArray.push(arrayValue);
                        }

                        break;
                    }
                case "Textinput":
                    {
                        break;
                    }
                case "Fileinput":
                    {
                        break;
                    }
                case "Color":
                    {
                        break;
                    }
                case "Scale":
                    {
                        break;
                    }
                case "Numberinput":
                    {
                        break;
                    }
                case "Dictionary":
                    {
                        break;
                    }
            }

            //Splice any available visibility settings into the options
            resolveSettingsExclusions(settingType, resolvedSetting, optionsArray, optionsObject);

            let settingShared = isSettingShared(setting);

            settingArray = {
                name: setting,
                text: resolvedSetting.Label,
                type: settingType,
                default: resolvedSetting.DefaultValue,
                tooltip: resolvedSetting.Tooltip,
                shared: settingShared,
                options: optionsArray
            };

            settingObject = {
                text: resolvedSetting.Label,
                type: settingType,
                default: resolvedSetting.DefaultValue,
                tooltip: resolvedSetting.Tooltip,
                shared: settingShared,
                options: optionsObject
            };

            //Extras (hacky)
            switch (settingType) {

                case "MultipleSelect": //FlagEnum and Enum[]
                    {
                        //ToDo: if Index key is in resolvedSetting, instead make this is a special type IndexCombobox
                        //which is rendered as a series of comboboxes all using the same options that render their value to the respective index in the data array
                        //(use Index array position to name to get Labels for Comboboxes)
                        //Dict sadly does not work as the data type is array and not dict

                        //Skip for now
                        if ("Index" in resolvedSetting) {
                            return null;
                        }

                        for (let option of resolvedSetting.Values) {

                            if (!("Label" in option)) {

                                //First empty labelled option is promoted as the "empty" null value (and excluded from options)
                                settingArray.null_value = [option.Value];
                                settingObject.null_value = [option.Value];

                                break;
                            }
                        }

                        //Set setting key that describes whether this is a FlagEnum (string output) or an Enum[] (array output)
                        if (settingTypeOriginalDerived === "FlagEnum") {
                            settingArray.string_value = true;
                            settingObject.string_value = true;
                        }
                        else {
                            settingArray.string_value = false;
                            settingObject.string_value = false;
                        }

                        break;
                    }
                case "SearchBox":
                    {
                        //String[]
                        //Linked setting detection
                        let linkedSetting = "LinkedSettingPath" in resolvedSetting ? resolvedSetting.LinkedSettingPath : null;

                        if (linkedSetting == null && setting === "GameplaySettings.EnabledTricks")
                            linkedSetting = "GameplaySettings.LogicMode"; //ToDo: Remove hardcode and rely on LinkedSettingPath instead

                        //Set setting key if linked setting
                        if (linkedSetting) {
                            settingArray.linked_setting = linkedSetting;
                            settingObject.linked_setting = linkedSetting;
                        }

                        //Add tags (filter)
                        let finalTagsArray = [];

                        if (linkedSetting) {
                            finalTagsArray = {}; //Turn outer tags array into object when a linked setting exists
                        }

                        const optionKeys = ["TrickInfo"]; //ToDo: Hacky...Identify options through key detection

                        for (let optionKey of optionKeys) {

                            if (!(optionKey in resolvedSetting))
                                continue;

                            if (linkedSetting) {

                                //Linked setting parsing. Options are scoped by linked setting value
                                for (let linkedSettingValue of Object.keys(resolvedSetting[optionKey])) {

                                    finalTagsArray[linkedSettingValue] = [];

                                    //Options are further scoped by tags
                                    for (let tagName of Object.keys(resolvedSetting[optionKey][linkedSettingValue])) {
                                        finalTagsArray[linkedSettingValue].push(tagName);
                                    }
                                }
                            }
                            else {

                                //Flat parsing without any linked setting
                                for (let option of resolvedSetting[optionKey]) {

                                    if (!("Label" in option))
                                        continue;
                                }
                            }
                        }

                        //Final tag assembly
                        if (linkedSetting) {

                            //Tag object scoped by linked setting value
                            let adjustedTagObject = {};

                            for (let linkedSettingValue of Object.keys(finalTagsArray)) {

                                let adjustedTagList = ["(all)"];

                                for (let tag of finalTagsArray[linkedSettingValue]) {
                                    adjustedTagList.push(tag); //Use tag name verbatim for now
                                }

                                adjustedTagObject[linkedSettingValue] = adjustedTagList;
                            }

                            settingArray.tags = adjustedTagObject;
                            settingObject.tags = adjustedTagObject;
                        }
                        else {

                            //Singular tag array
                            let adjustedTagList = ["(all)"];

                            for (let tag of finalTagsArray) {
                                adjustedTagList.push(tag); //Use tag name verbatim for now
                            }

                            settingArray.tags = adjustedTagList;
                            settingObject.tags = adjustedTagList;
                        }
          
                        break;
                    }
                case "SearchBoxMMR":
                    {
                        //ItemList
                        //Collect all tags and presets
                        let foundTags = {};

                        let foundPresetsKey = "";
                        let foundPresetsArray = [];

                        for (let option of resolvedSetting.ItemList) {

                            if (!("Label" in option))
                                continue;

                            //Dynamically process Additional Information
                            if ("AdditionalInformation" in option) {

                                let extraInfo = option.AdditionalInformation;

                                //Discover preset if present
                                if ("ClassicCategory" in extraInfo) { //ToDo: Hacky...

                                    foundPresetsKey = "ClassicCategory";

                                    if (foundPresetsArray.indexOf(extraInfo.ClassicCategory) == -1)
                                        foundPresetsArray.push(extraInfo.ClassicCategory);
                                }

                                //Discover tags if present
                                const tagKeys = ["ItemCategory", "LocationCategory", "Regions"]; //ToDo: Hacky...

                                for (let tagKey of tagKeys) {

                                    if (tagKey in extraInfo) {

                                        let info = extraInfo[tagKey];

                                        if (!(tagKey in foundTags))
                                            foundTags[tagKey] = [];

                                        if (typeof (info) == "string") {
                                            //Single
                                            if (foundTags[tagKey].indexOf(info) == -1)
                                                foundTags[tagKey].push(info);
                                        }
                                        else {
                                            //Array. Multi. Copied
                                            for (let tag of info) {
                                                if (foundTags[tagKey].indexOf(tag) == -1)
                                                    foundTags[tagKey].push(tag);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        //Add preset key if presets present
                        if (foundPresetsKey && foundPresetsArray.length > 0) {

                            let adjustedPresets = [];

                            for (let preset of foundPresetsArray) {
                                adjustedPresets.push(splitCamelCaseString(preset));
                            }

                            let presetObj = {
                                text: splitCamelCaseString(foundPresetsKey),
                                presets: adjustedPresets
                            };

                            settingArray.presets = presetObj;
                            settingObject.presets = presetObj;
                        }

                        //Add tags key if tags present
                        if (Object.keys(foundTags).length > 0) {

                            let finalTagsArray = [];
                            let finalTagsObj = {};

                            for (let tagKey of Object.keys(foundTags)) {

                                let tagKeyLabel = splitCamelCaseString(tagKey);

                                let adjustedTagList = ["(all)"];

                                for (let tag of foundTags[tagKey]) {
                                    adjustedTagList.push(splitCamelCaseString(tag));
                                }

                                finalTagsObj[tagKey] = {
                                    text: tagKeyLabel,
                                    tags: adjustedTagList
                                };

                                finalTagsArray.push({
                                    name: tagKey,
                                    text: tagKeyLabel,
                                    tags: adjustedTagList
                                });
                            }

                            settingArray.tags = finalTagsArray;
                            settingObject.tags = finalTagsObj;
                        }

                        if (Object.keys(foundTags).length > 1) {
                            settingArray.multi_tags = true;
                            settingObject.multi_tags = true;
                        }
                        else {
                            settingArray.multi_tags = false;
                            settingObject.multi_tags = false;
                        }
  
                        break;
                    }
                case "Textinput":
                    {
                        settingArray.size = "full";
                        settingArray.max_length = 500;

                        settingObject.size = "full";
                        settingObject.max_length = 500;

                        //ToDo: Handle and add ['size', 'max_length'] properly based on input

                        break;
                    }
                case "Fileinput":
                    {
                        //Default file types
                        let file_types = [
                            {
                                name: "All Files",
                                extensions: ["*"]
                            }
                        ];

                        settingArray["file_types"] = file_types;
                        settingObject["file_types"] = file_types;

                        break;
                    }
                case "Color":
                    {
                        //Flag array color settings
                        if (settingTypeOriginalDerived === "Color[]") {
                            settingArray.color_array = true;
                            settingObject.color_array = true;
                        }

                        break;
                    }
                case "Scale":
                case "Numberinput":
                    {
                        settingArray.min = resolvedSetting.MinValue;
                        settingArray.max = resolvedSetting.MaxValue;

                        settingObject.min = resolvedSetting.MinValue;
                        settingObject.max = resolvedSetting.MaxValue;

                        //Force Scales to Numberinput if either range is above 50 and vice versa (only for non decimals)
                        if (settingTypeOriginalDerived !== "Decimal") {

                            if (settingType == "Scale") {
                                if (settingArray.min < -50 || settingArray.max > 50) {

                                    settingType = "Numberinput";
                                    settingArray.type = "Numberinput";
                                    settingObject.type = "Numberinput";
                                }
                            }
                            else {
                                //Numberinput to Scale if needed
                                if (settingArray.min > -50 && settingArray.max < 50) {

                                    settingType = "Scale";
                                    settingArray.type = "Scale";
                                    settingObject.type = "Scale";
                                }
                            }
                        }

                        //Special decimal key for Numberinputs
                        if (settingType === "Numberinput") {

                            if (settingTypeOriginalDerived === "Decimal") {
                                settingArray.is_decimal = true;
                                settingObject.is_decimal = true;
                            }
                            else {
                                settingArray.is_decimal = false;
                                settingObject.is_decimal = false;
                            }
                        }

                        if (resolvedSetting.Nullable) {
                            settingArray.nullable = true;
                            settingObject.nullable = true;
                        }
                       
                        //ToDo: Ensure default value always exists in the source dump. Even if nullable and default = null
                        if (resolvedSetting.DefaultValue == null) {

                            if (resolvedSetting.Nullable) {
                                settingArray.default = null;
                                settingObject.default = null;
                            }
                            else {
                                settingArray.default = settingArray.min;
                                settingObject.default = settingArray.min;
                            }
                        }

                        break;
                    }
                case "Dictionary":
                    {
                        if (!("ValueType" in resolvedSetting)) {
                            console.error("No expected value type in setting:", resolvedSetting);
                            return null;
                        }

                        //Single dictionary
                        settingArray.inner_type = resolveSettingType(resolvedSetting.ValueType, true, linkedSettings);
                        settingObject.inner_type = settingArray.inner_type;

                        //Build key list
                        let dictionaryKeysArray = [];
                        let dictionaryKeysObject = {};

                        for (let keyObject of resolvedSetting.Keys) {

                            if (!("Label" in keyObject))
                                continue;

                            let arrayValue = {
                                name: keyObject.Value,
                                text: keyObject.Label
                            };

                            dictionaryKeysObject[keyObject.Value] = { text: keyObject.Label };

                            if ("Tooltip" in keyObject) {
                                arrayValue.tooltip = keyObject.Tooltip;
                                dictionaryKeysObject[keyObject.Value].tooltip = keyObject.Tooltip;
                            }

                            dictionaryKeysArray.push(arrayValue);
                        }

                        settingArray.keys = dictionaryKeysArray;
                        settingObject.keys = dictionaryKeysObject;

                        //Get sub setting data
                        let subSettingData = assembleSetting(version, setting, linkedSettings, settingArray.inner_type);

                        if (!subSettingData)
                            return null;

                        //Prefer options from subSettingData
                        delete settingArray.options;
                        delete settingObject.options;

                        //Combine objects (main setting has higher priority)
                        settingArray = { ...subSettingData.settingArray, ...settingArray };
                        settingObject = { ...subSettingData.settingObject, ...settingObject };

                        break;
                    }
            }

            //Extra settings if they overlap with an existing setting take priority and the provided keys are written into the output
            let resolvedSettingExtra = settingsExtra.find(item => {
                return item.name === setting;
            });

            if (resolvedSettingExtra) {

                for (let key of Object.keys(resolvedSettingExtra)) {
                    settingArray[key] = resolvedSettingExtra[key];

                    if (key != "name") {
                        settingObject[key] = resolvedSettingExtra[key];
                    }
                }
            }
        }
    }
    else {
        //Multi settings (Dictionary only)
        settingName = setting[0] + "_container"; //Assume first setting name for the grouping container

        let resolvedSettings = [];

        for (let settingSingle of setting) {

            let settingsData = assembleSetting(version, settingSingle, true);

            if (settingsData)
                resolvedSettings.push(settingsData);
        }

        if (!resolvedSettings || resolvedSettings.length != setting.length) {
            console.error("Skip linked settings:", setting, "because not all settings could be resolved!");
            return null;
        }

        settingType = resolvedSettings[0].settingType; //All linked settings share the same base type

        let optionsArray = [];
        let optionsObject = {};

        let dictionaryKeysArray = [];
        let dictionaryKeysObject = {};

        childSettings = JSON.parse(JSON.stringify(resolvedSettings)); //Clone resolved settings for later individual insertion

        //Properly tag the child settings (ignored for GUI insertion, used for everything else)
        for (let childSettingData of childSettings) {
            childSettingData.settingArray["is_linked"] = true;
            childSettingData.settingObject["is_linked"] = true;
        }

        let settingDefault;
                
        //Only support Dictionary for linked settings
        switch (settingType) {
            case "Dictionary":
                {
                    //Key list is taken from first setting
                    dictionaryKeysArray = resolvedSettings[0].settingArray.keys;
                    dictionaryKeysObject = resolvedSettings[0].settingObject.keys;

                    //Linked dictionaries are rendered as radio toggle groups, so we pre-select the first one by default
                    settingDefault = dictionaryKeysArray[0].name;

                    //Assemble grouping container (ignored for everything except for proper settings insertion into GUI)
                    for (let settingData of resolvedSettings) {

                        let childSettingName = settingData.settingName;
                        let childSettingBaseType = settingData.settingType;

                        if (childSettingBaseType != settingType) {
                            console.error("Mismatch between settings types. Expected:", settingType, "Got:", childSettingBaseType);
                            return null;
                        }

                        //Promote inner_type to main type and delete keys (container setting stores this)
                        settingData.settingArray.type = settingData.settingArray.inner_type;
                        settingData.settingObject.type = settingData.settingObject.inner_type;

                        delete settingData.settingArray["inner_type"];
                        delete settingData.settingObject["inner_type"];
                        delete settingData.settingArray["keys"];
                        delete settingData.settingObject["keys"];

                        optionsArray.push(settingData.settingArray);
                        optionsObject[childSettingName] = settingData.settingObject;
                    }

                    //Change base container type to linked dictionary
                    settingType = "DictionaryLinked";

                    break;
                }
            default: {
                console.error("Unsupported linked setting type:", settingType);
                return null;
            }
        }

        let settingShared = isSettingShared(setting[0]); //Shared status is assumed from the first setting in this container

        settingArray = {
            name: settingName,
            text: null,
            type: settingType,
            default: settingDefault,
            tooltip: null,
            shared: settingShared,
            options: optionsArray
        };

        settingObject = {
            text: null,
            type: settingType,
            default: settingDefault,
            tooltip: null,
            shared: settingShared,
            options: optionsObject
        };

        //Extras for linked settings
        switch (settingType) {

            case "DictionaryLinked":
                {
                    settingArray.keys = dictionaryKeysArray;
                    settingObject.keys = dictionaryKeysObject;
                    break;
                }
        }
    }


    //ToDo: dynamic: true can be used for settings_list re-generation with at runtime based settings e.g. logic_file
    applyVersionMods(version, setting, linkedSettings, overrideBaseType, settingName, settingTypeOriginal, settingType, settingArray, settingObject, childSettings);

    return { settingName, settingType, settingArray, settingObject, childSettings };
}

function applyVersionMods(version, setting, linkedSettings, overrideBaseType, settingName, settingTypeOriginal, settingType, settingArray, settingObject, childSettings) {

    if (!Array.isArray(setting)) {

        //Single setting (normal)

        switch (settingType) {

            case "MultipleSelect": //FlagEnum and Enum[]
                {
                    if (settingTypeOriginal === "FlagEnum") {

                        //Convert default value to array notation if it's a string
                        if (typeof (settingArray.default) === "string") {
                            settingArray.default = settingArray.default.split(", ");
                            settingObject.default = settingArray.default;
                        }
                    }

                    break;
                }
            default: {
                break;
            }
        }
    }
    else {
        //Multi settings (Dictionary only)
    }
}

createSettingsList("1.0.0");
