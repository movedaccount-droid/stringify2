import "frida-il2cpp-bridge";
import * as fs from 'fs';

// ------- FUNCTION GLOBALS ------
// would usually prefer not to use global values. but in this kind of code it's acceptable

// iterates to order logs by id in ./logs
var log_num = 0

// values to help automatic gathering of public items
var GSFGetPublicItemsByOIDsSvc_lasthandled = 8140002
var GSFGetPublicItemsByOIDsSvc_step = 1000
var GSFGetPublicItemsByOIDsSvc_lastrun = Date.now()
var GSFGetPublicItemsByOIDsSvc_runstep = 10000

// values to help automatic gathering of avatar accents
var GSFGetPublicAvatarAccentsByOIDsSvc_lasthandled = 0
var GSFGetPublicAvatarAccentsByOIDsSvc_step = 1000
var GSFGetPublicAvatarAccentsByOIDsSvc_lastrun = Date.now()
var GSFGetPublicAvatarAccentsByOIDsSvc_runstep = 10000

// values to help automatic gathering of public assets but i don't think we ever did that
var create_GSFGetPublicAssetsByOIDsSvc_request_lasthandled = 0
var create_GSFGetPublicAssetsByOIDsSvc_request_step = 1000

// value to help automatic gathering of showcase avatars
var create_GSFGetShowcaseAvatarSvc_request_lasthandled = 211229

// debug log consts
const UNSUPPORTED = "<errorSingleton: singleton intentionally unsupported>: "



// ------- UTILITY FUNCTIONS -------
// grabs consts, il2cpp, etc.

// shorthand to get the image of any assembly. but . i think i did this one just beacuse of the name to be honest
function ass(assembly: string) {
    return Il2Cpp.domain.assembly(assembly).image;
}

// shorthand to get the Assembly-CSharp-firstpass image
function AssemblyCSharp() {
    return Il2Cpp.domain.assembly("Assembly-CSharp-firstpass").image;
}

// shorthand for the corlib Generic.List class
function List() {
    return Il2Cpp.corlib.class("System.Collections.Generic.List`1");
}

// shorthand to get the Assembly-CSharp image
function AssemblyCSharp_reg() {
    return Il2Cpp.domain.assembly("Assembly-CSharp").image;
}

// returns a nice filename for a json file, given an oid and a name
function get_json_filename(oid: Il2Cpp.Object, name: Il2Cpp.String) {
    const oidName = oid.field<number>("objectClass").value.toString() + "-" + oid.field<number>("type").value.toString() + "-" + oid.field<number>("server").value.toString() + "-" + oid.field<number>("num").value.toString()
    const jsonName = oidName + " - " + name.toString().slice(1,-1) + ".json"
    return jsonName
}

// check if field in given object is present
function present(object: Il2Cpp.Object, field: string) {
    return !object.field<Il2Cpp.Object>(field).value.isNull()
}

// ------- GENERAL IDEAS -------
// things that are not necessarily il2cpp related

// appends given text to a given log file on the device to be pulled later
function write_log(file: string, ...msg: [string]) : void {
    const elements = file.split("/")
    const dir = Il2Cpp.application.dataPath + "/logs/" + elements.slice(0,-1).join("/")
    Java.perform(function(){
        Java.use('java.io.File').$new(dir).mkdirs()
    })
    const fd = new File(Il2Cpp.application.dataPath + "/logs/" + file, "a")
    const content = msg.join(" ")
    try {
      fd.write(content)
    } finally {
      fd.close()
    }
}

// hang the main thread for a given time [lol]
function wait(ms: number) {
    const start = Date.now();
    let now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

// ------- IL2CPP LOG HELPERS -------
// logging. logging logging logging. trying something like this is an information game first and foremost:
// most of your time is spend trying to find the right classes with the right information, what comes before,
// what comes after, and the only way to easily get that information is through something like this. a class
// that dumps the parameters and result of certain methods.
// this is really a predecessor to the stringify approach, and many of these now use it, but previously this
// would manually dump objects property-by-property... ow
// either way, there's unsurprisingly a lot of these

function log_TemplateCacheService_OnResolvePublicItemsByOIDsHandler() {
    const TemplateCacheService_OnResolvePublicItemsByOIDsHandler = AssemblyCSharp().class("TemplateCacheService").method("OnResolvePublicItemsByOIDsHandler")
    //@ts-ignore
    TemplateCacheService_OnResolvePublicItemsByOIDsHandler.implementation = function (
        session: Il2Cpp.Object,
        response: Il2Cpp.Object,
        request: Il2Cpp.Object,
        viewContext: Il2Cpp.Array<Il2Cpp.Object>
    ) {
        console.log("\n")
        console.log("------- TemplateCacheService [OnResolvePublicItemsByOIDsHandler] -------")
        this.method("OnResolvePublicItemsByOIDsHandler").invoke(session, response, request, viewContext)
        console.log(viewContext)
        wait(1000)
        console.log(viewContext)
        // getting playeritem list and count
        var itemlist = viewContext.get(1)
        var itemcount = itemlist.method<number>("get_Count").invoke();
        console.log("itemList of length: " + itemcount)
        for (let i = 0; i < itemcount; i++) {
            // log each GSFPlayerItem
            var GSFPlayerItem = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            log_GSFPlayerItem_info(GSFPlayerItem, 0)
        }
    }
}

function log_GetPublicItemsByOIDs_request_ctor() {
    // takes list of OIDs
    // outputs general information about items provided
    const GetPublicItemsByOIDs_request_ctor = AssemblyCSharp().class("GSFGetPublicItemsByOIDsSvc").nested("GSFRequest").method(".ctor");
    // @ts-ignore
    GetPublicItemsByOIDs_request_ctor.implementation = function (
        this: Il2Cpp.Object | Il2Cpp.Class,
        oids: Il2Cpp.Object,
        langlocalePairId: Il2Cpp.Object,
        tierID: Il2Cpp.Object,
        birthDate: Il2Cpp.Object,
        registrationDate: Il2Cpp.Object,
        previewDate: Il2Cpp.Object,
        isPreviewEnabled: boolean
    ) {
        console.log("\n")
        console.log("------- GetPublicItemsByOIDs [request, ctor] -------")
        console.log("oids of length: " + oids.method<number>("get_Count").invoke())
        for (let i = 0; i < oids.method<number>("get_Count").invoke(); i++) {
            console.log(oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i))
        }
        console.log("tierID:" + tierID)
        console.log("langlocalePairID:" + langlocalePairId)
        console.log("birthDate:" + birthDate)
        console.log("registrationDate:" + registrationDate)
        console.log("previewDate:" + previewDate)
        console.log("isPreviewEnabled:" + isPreviewEnabled)
        this.method(".ctor").invoke(oids, langlocalePairId, tierID, birthDate, registrationDate, previewDate, isPreviewEnabled);
    };
}

function log_GSFGetPublicItemsByOIDsSvc_request_info(GSFGetPublicItemsByOIDsSvc: Il2Cpp.Object, indent: number) {
    var ind = "  ".repeat(indent)
    console.log(ind + "GSFGetPublicItemsByOIDsSvc+GSFRequest:")
    const oids = GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("oids").value
    const oidsLength = oids.method<number>("get_Count").invoke()
    console.log(ind + "oids of length: " + oidsLength)
    for (let i = 0; i < oidsLength; i++) {
        const oid = oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        console.log(ind + "oid: " + get_GSFOID_string(oid))
    }
    console.log(ind + "tierID:" + get_GSFOID_string(GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("tierID").value))
    console.log(ind + "langlocalePairID:" + get_GSFOID_string(GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("langlocalePairID").value))
    console.log(ind + "birthDate:" + GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("birthDate").value)
    console.log(ind + "registrationDate:" + GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("registrationDate").value)
    console.log(ind + "previewDate:" + GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("previewDate").value)
    console.log(ind + "isPreviewEnabled:" + GSFGetPublicItemsByOIDsSvc.field<boolean>("isPreviewEnabled").value)
}

function log_GSFCommsObject_ctor() {
    const GSFCommsObject_ctor = AssemblyCSharp().class("GSFCommsObject").method(".ctor")
    //@ts-ignore
    GSFCommsObject_ctor.implementation = function(...args: any[]) {
        this.method(".ctor").invoke(...args)
        console.log(JSON.stringify(str_Il2Cpp_Object(this), null, 4))
    }
}

function log_GSFAddEventSvc_request_ctor() {
    const GSFAddEventSvc_request_ctor = AssemblyCSharp().class("GSFAddEventSvc").nested("GSFRequest").method(".ctor")
    //@ts-ignore
    GSFAddEventSvc_request_ctor.implementation = function (
        eventID: Il2Cpp.Object,
        eventObjectID: Il2Cpp.Object,
        targetObjectID: Il2Cpp.Object,
        targetObjectTemplateID: Il2Cpp.Object,
        contextIDs: Il2Cpp.Object,
        dynamicAttributes: Il2Cpp.Object,
        returnRewards: boolean,
        count: Il2Cpp.Object,
        broadcast: boolean,
    ) {
        console.log("\n")
        console.log("------- GSFAddEvent [request, ctor] -------")
        console.log("eventObjectId: " + eventObjectID.isNull() ? null : get_GSFOID_string(eventObjectID))
        console.log("targetObjectId: " + get_GSFOID_string(targetObjectID))
        console.log("targetObjectTemplateId: " + get_GSFOID_string(targetObjectTemplateID))
        if (!contextIDs.isNull()) {
            const contextIDsLength = contextIDs.method<number>("get_Count").invoke()
            console.log("contextIDs of length: " + contextIDsLength)
            for (var i = 0; i < contextIDsLength; i++) {
                const oid = contextIDs.method<Il2Cpp.Object>("get_Item").invoke(i)
                console.log(oid)
            }
        } else {
            console.log("contextIDs: null")
        }
        if (!dynamicAttributes.isNull()) {
            const dynamicAttributesLength = dynamicAttributes.method<number>("get_Count").invoke()
            console.log("contextIDs of length: " + dynamicAttributesLength)
            for (var i = 0; i < dynamicAttributesLength; i++) {
                const dynamicAttribute = dynamicAttributes.method<Il2Cpp.String>("get_Item").invoke(i)
                console.log(dynamicAttribute)
            }
        } else {
            console.log("dynamicAttributes: null")
        }
        console.log("returnRewards: " + returnRewards)
        console.log("broadcast: " + broadcast)
        this.method(".ctor").invoke(eventID, eventObjectID, targetObjectID, targetObjectTemplateID, contextIDs, dynamicAttributes, returnRewards, count, broadcast)
    }
}

function log_GSFChangePlayerStatNotify_request_des() {
    const GSFChangePlayerStatNotify_request_des = AssemblyCSharp().class("GSFChangePlayerStatNotify").nested("GSFRequest").method("DeserializeMembers")
    //@ts-ignore
    GSFChangePlayerStatNotify_request_des.implementation = function (protocol: Il2Cpp.Object, output: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- GSFChangePlayerStatNotify [request, des] -------")
        this.method("DeserializeMembers").invoke(protocol, output)
        console.log("parentInstanceID: " + get_GSFOID_string(this.field<Il2Cpp.Object>("parentInstanceID").value))
        console.log("instanceID: " + get_GSFOID_string(this.field<Il2Cpp.Object>("instanceID").value))
        console.log("templateID: " + get_GSFOID_string(this.field<Il2Cpp.Object>("templateID").value))
        console.log("pid: " + get_GSFOID_string(this.field<Il2Cpp.Object>("pid").value))
        console.log("vid: " + get_GSFOID_string(this.field<Il2Cpp.Object>("vid").value))
        console.log("lid: " + get_GSFOID_string(this.field<Il2Cpp.Object>("lid").value))
        console.log("oldLevel: " + this.field<number>("oldLevel").value)
        console.log("newLevel: " + this.field<number>("newLevel").value)
        console.log("contextTag: " + this.field<Il2Cpp.String>("contextTag").value)
        console.log("------- GSFChangePlayerStatNotify [request, des] -------")
    }
}

function log_GSFAddEventSvc_response_des() {
    const GSFAddEventSvc_response_des = AssemblyCSharp().class("GSFAddEventSvc").nested("GSFResponse").method("DeserializeMembers")
    //@ts-ignore
    GSFAddEventSvc_response_des.implementation = function (protocol: Il2Cpp.Object, output: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- GSFAddEvent [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, output)
        console.log(this.field<Il2Cpp.Object>("questAwardElements").value)
        console.log(this.field<Il2Cpp.Object>("questAwardElements").value.method<number>("get_Count").invoke())
        console.log("------- GSFAddEvent [response, des] -------")
    }
}

function log_GetPublicItemsByOIDs_response_des() {
    const GetPublicItemsByOIDs_response_des = AssemblyCSharp().class("GSFGetPublicItemsByOIDsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GetPublicItemsByOIDs_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GetPublicItemsByOIDs [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        var itemlist = this.field<Il2Cpp.Object>("items").value
        var items = itemlist.method<number>("get_Count").invoke();
        console.log("itemList of length: " + itemlist.method<number>("get_Count").invoke())
        for (let i = 0; i < items; i++) {
            var item = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            if (!item.isNull()) {
                console.log(JSON.stringify(stringify_GSFItem(item), null, 4))
                //log_GSFItem_info(item, 1, false)
                // const oidName = item.field<Il2Cpp.Object>("oid").value.field<number>("objectClass").value.toString() + "-" + item.field<Il2Cpp.Object>("oid").value.field<number>("type").value.toString() + "-" + item.field<Il2Cpp.Object>("oid").value.field<number>("server").value.toString() + "-" + item.field<Il2Cpp.Object>("oid").value.field<number>("num").value.toString()
                // const jsonName = oidName + " - " + item.field<Il2Cpp.String>("name").value.toString().slice(1,-1) + ".json"
                // write_log(jsonName, JSON.stringify(stringify_GSFItem(item)))
            }
        }
        console.log("------- GetPublicItemsByOIDs [response, des] -------")
    };
}

function log_GSFGetPublicAvatarAccentsByOIDsSvc_response_des(write_json: boolean) {
    const GetPublicAvatarAccentsByOIDsSvc_response_des = AssemblyCSharp().class("GSFGetPublicAvatarAccentsByOIDsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GetPublicAvatarAccentsByOIDsSvc_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GSFGetPublicAvatarAccentsByOIDsSvc [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        var accents = this.field<Il2Cpp.Object>("accents").value
        var accentsLength = accents.method<number>("get_Count").invoke();
        console.log("accents of length: " + accentsLength)
        for (let i = 0; i < accentsLength; i++) {
            var GSFAvatarAccent = accents.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            if (!GSFAvatarAccent.isNull()) {
                log_GSFAvatarAccent_info(GSFAvatarAccent, 1, false)
                if (write_json) {
                    const jsonName = get_json_filename(GSFAvatarAccent.field<Il2Cpp.Object>("oid").value, GSFAvatarAccent.field<Il2Cpp.String>("description").value)
                    write_log("GSFAvatarAccent/" + jsonName, JSON.stringify(stringify_GSFAvatarAccent(GSFAvatarAccent)))
                }
            }
        }
        console.log("------- GSFGetPublicAvatarAccentsByOIDsSvc [response, des] -------")
    };
}

function log_GetAssetsByOIDs_response_des() {
    const GetAssetsByOIDs_response_des = AssemblyCSharp().class("GSFGetAssetsByOIDsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GetAssetsByOIDs_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GetAssetsByOIDs [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        // getting assets list and count
        var itemlist = this.field<Il2Cpp.Object>("assets").value
        var items = itemlist.method<number>("get_Count").invoke();
        for (let i = 0; i < items; i++) {
            // get each assetcontainer
            var asset_container = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            // copy contained dictionary to array of dictionary's contained lists
            var dict = asset_container.field<Il2Cpp.Object>("assetMap").value
            var dict_values = dict.method<Il2Cpp.Object>("get_Values").invoke()
            var new_dict_length = dict.method<number>("get_Count").invoke()
            console.log("assetmap items: " + new_dict_length)
            var asset_container_array = Il2Cpp.array<Il2Cpp.Object>(List(), new_dict_length)
            dict_values.method<Il2Cpp.Object>("CopyTo").invoke(asset_container_array, 0)
            // parse contained lists and log their gsfassets
            for (var list of asset_container_array) {
                var length = list.method<number>("get_Count").invoke();
                for (let i = 0; i < length; i++) {
                    var gsfasset = list.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
                    console.log(gsfasset.field<Il2Cpp.String>("resName").value + ": " + gsfasset.field<Il2Cpp.String>("cdnId").value)
                }
            }
        }
        console.log("oid count:" + itemlist.method<number>("get_Count").invoke())
    };
}

function log_GetAssetsByOIDs_request_ctor() {
    const GetAssetsByOIDs_request_ctor = AssemblyCSharp().class("GSFGetAssetsByOIDsSvc").nested("GSFRequest").method(".ctor", 1)
    //@ts-ignore
    GetAssetsByOIDs_request_ctor.implementation = function (oids: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- GetAssetsByOIDs [request, ctor] -------")
        var oid_count = oids.method<number>("get_Count").invoke();
        for (let i = 0; i < oid_count; i++) {
            var oid = oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            console.log("requested " + i + ": " + oid)
        }
        this.method(".ctor", 1).invoke(oids);
    }
}

function log_GSFGetPlayerAvatarsSvc_request_ctor() {
    const GSFGetPlayerAvatarsSvc_request_ctor = AssemblyCSharp().class("GSFGetPlayerAvatarsSvc").nested("GSFRequest").method(".ctor", 3)
    //@ts-ignore
    GSFGetPlayerAvatarsSvc_request_ctor.implementation = function (playerId: Il2Cpp.Object, playerMazeId: Il2Cpp.Object, filterIDs: Il2Cpp.Object) {
        console.log("\n")
        playerId = create_GSFOID(4, 1, 2, 286043)
        console.log("------- GSFGetPlayerAvatarsSvc [request, ctor] -------")
        console.log("playerId: " + get_GSFOID_string(playerId))
        if (!playerMazeId.isNull()) {console.log("playerMazeId: " + get_GSFOID_string(playerMazeId))} else {console.log("playerMazeId: null")}
        if (!filterIDs.isNull()) {
            var filterIDsLength = filterIDs.method<number>("get_Count").invoke();
            console.log("filterIDs of length " + filterIDsLength + ":")
            for (let i = 0; i < filterIDsLength; i++) {
                console.log(filterIDsLength)
                var oid = filterIDs.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
                console.log("filterID " + i + ": " + oid)
            }
        } else {
            console.log("filterIDs: null")
        }
        console.log("------- GSFGetPlayerAvatarsSvc [request, ctor] -------")
        this.method(".ctor", 3).invoke(playerId, playerMazeId, filterIDs);
    }
}

function log_GSFAvatarShowcase_des() {
    const GSFAvatarShowcase_des = AssemblyCSharp().class("GSFAvatarShowcase").method("DeserializeMembers")
    //@ts-ignore
    GSFAvatarShowcase_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GSFAvatarShowcase [des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        console.log("baby:")
        console.log(JSON.stringify(this.field<Il2Cpp.Object>("baby").value))
        console.log("primaryParent:")
        console.log(JSON.stringify(this.field<Il2Cpp.Object>("primaryParent").value))
        console.log("secondaryParent:")
        console.log(JSON.stringify(this.field<Il2Cpp.Object>("secondaryParent").value))
    }
}

function log_GSFGetPlayerAvatarsSvc_response_des() {
    const GSFGetPlayerAvatarsSvc_response_des = AssemblyCSharp().class("GSFGetPlayerAvatarsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GSFGetPlayerAvatarsSvc_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        this.method("DeserializeMembers").invoke(protocol, input)
        console.log(JSON.stringify(str_Il2Cpp_Object(this), null, 4))

        // old method
        // console.log("\n")
        // console.log("------- GSFGetPlayerAvatarsSvc [response, des] -------")
        // this.method("DeserializeMembers").invoke(protocol, input);
        // var avatars = this.field<Il2Cpp.Object>("avatars").value
        // var avatarsLength = avatars.method<number>("get_Count").invoke();
        // console.log("avatars of length: " + avatars.method<number>("get_Count").invoke())
        // for (let i = 0; i < avatarsLength; i++) {
        //     var GSFPlayerAvatar = avatars.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        //     if (!GSFPlayerAvatar.isNull()) {
        //         console.log(JSON.stringify(stringify_GSFPlayerAvatar(GSFPlayerAvatar), null, 2))
        //     }
        // }
        // console.log("------- GSFGetPlayerAvatarsSvc [response, des] -------")
    };
}

function log_GSFGetShowcaseAvatarSvc_response_des() {
    const GSFGetShowcaseAvatarSvc_response_des = AssemblyCSharp().class("GSFGetShowcaseAvatarSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GSFGetShowcaseAvatarSvc_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GSFGetShowcaseAvatarSvc [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        console.log(JSON.stringify(stringify_GSFAvatarShowcase(this.field<Il2Cpp.Object>("showcase").value), null, 4))
        console.log("------- GSFGetShowcaseAvatarSvc [response, des] -------")
    };
}

function log_GSFGetShowcaseAvatarsSvc_response_des() {
    const GSFGetShowcaseAvatarsSvc_response_des = AssemblyCSharp().class("GSFGetShowcaseAvatarsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GSFGetShowcaseAvatarsSvc_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GSFGetShowcaseAvatarsSvc [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        const showcase = this.field<Il2Cpp.Object>("showcase").value
        const showcaseLength = showcase.method<number>("get_Count").invoke()
        console.log("showcase of length: " + showcaseLength)
        for (var i = 0; i < showcaseLength; i++) {
            const GSFAvatarShowcaseString = stringify_GSFAvatarShowcase(showcase.method<Il2Cpp.Object>("get_Item").invoke(i))
            console.log(JSON.stringify(GSFAvatarShowcaseString, null, 4))
            const baby_oid = showcase.method<Il2Cpp.Object>("get_Item").invoke(i).field<Il2Cpp.Object>("baby").value.field<Il2Cpp.Object>("oid").value
            write_log("GSFAvatarShowcase/" + get_json_filename(baby_oid, Il2Cpp.string(GSFAvatarShowcaseString.baby.name)), JSON.stringify(GSFAvatarShowcaseString, null, 4))
        }
        console.log("------- GSFGetShowcaseAvatarsSvc [response, des] -------")
    };
}

function log_GetPublicAssetsByOIDs_response_des() {
    const GetPublicAssetsByOIDs_response_des = AssemblyCSharp().class("GSFGetPublicAssetsByOIDsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GetPublicAssetsByOIDs_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GetPublicAssetsByOIDs [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        // getting assets list and count
        var itemlist = this.field<Il2Cpp.Object>("assets").value
        var items = itemlist.method<number>("get_Count").invoke();
        for (let i = 0; i < items; i++) {
            // get each assetcontainer
            var asset_container = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            // copy contained dictionary to array of dictionary's contained lists
            var dict = asset_container.field<Il2Cpp.Object>("assetMap").value
            var dict_values = dict.method<Il2Cpp.Object>("get_Values").invoke()
            var new_dict_length = dict.method<number>("get_Count").invoke()
            console.log("assetmap items: " + new_dict_length)
            var asset_container_array = Il2Cpp.array<Il2Cpp.Object>(List(), new_dict_length)
            dict_values.method<Il2Cpp.Object>("CopyTo").invoke(asset_container_array, 0)
            // parse contained lists and log their gsfassets
            for (var list of asset_container_array) {
                var length = list.method<number>("get_Count").invoke();
                for (let i = 0; i < length; i++) {
                    var gsfasset = list.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
                    console.log(gsfasset.field<Il2Cpp.String>("resName").value + ": " + gsfasset.field<Il2Cpp.String>("cdnId").value)
                }
            }
        }
        console.log("oid count:" + itemlist.method<number>("get_Count").invoke())
    };
}

function log_TemplateCacheService_GetAssetsByOIDs() {
    const TemplateCacheService_GetAssetsByOIDs = AssemblyCSharp().class("TemplateCacheService").method("GetAssetsByOIDs");
    //@ts-ignore
    TemplateCacheService_GetAssetsByOIDs.implementation = function(oids: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- TemplateCacheService [main, getassetsbyoids] -------")
        var oid_count = oids.method<number>("get_Count").invoke();
        for (let i = 0; i < oid_count; i++) {
            var oid = oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            console.log("requested " + i + ": " + oid)
        }
        this.method("GetAssetsByOIDs", 1).invoke(oids);
    }
}

function log_GSFOtherPlayerDetails_GetPlayerAvatars() {
    const GSFOtherPlayerDetails_GetPlayerAvatars = AssemblyCSharp().class("GSFOtherPlayerDetails").method("GetPlayerAvatars")
    //@ts-ignore
    GSFOtherPlayerDetails_GetPlayerAvatars.implementation = function() {
        console.log("\n")
        console.log("------- GSFOtherPlayerDetails [main, getplayeravatars] -------")
        var playerAvatars = this.method<Il2Cpp.Object>("GetPlayerAvatars").invoke()
        // var playerAvatarsLength = playerAvatars.method<number>("get_Count").invoke();
        // console.log("playerAvatars of length: " + playerAvatarsLength)
        // for (let i = 0; i < playerAvatarsLength; i++) {
        //     var avatar = playerAvatars.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        //     console.log(JSON.stringify(stringify_GSFPlayerAvatar))
        // }
        return playerAvatars
    }
}


function log_PetBaseController_ConsumeFoodItem() {
    const GSFOtherPlayerDetails_GetPlayerAvatars = AssemblyCSharp_reg().class("PetBaseController").method("ConsumeFoodItem")
    //@ts-ignore
    GSFOtherPlayerDetails_GetPlayerAvatars.implementation = function(foodItem: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- PetBaseController [main, consumefooditem] -------")
        console.log(JSON.stringify(stringify_GSFPlayerItem(foodItem), null, 4))
        this.method<Il2Cpp.Object>("ConsumeFoodItem").invoke(foodItem)
        console.log("------- PetBaseController [main, consumefooditem] -------")
    }
}

function log_DockServices_FullDecayInventoryItem() {
    const DockServices_FullDecayInventoryItem = AssemblyCSharp().class("DockServices").method<Il2Cpp.Object>("FullDecayInventoryItem", 1)
    //@ts-ignore
    DockServices_FullDecayInventoryItem.implementation = function (
        playerItemId: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- DockServices [main, fulldecayinventoryitem] -------")
        console.log("oid: " + get_GSFOID_string(playerItemId))
        console.log("fullDecay: " + this.field<Il2Cpp.Object>("fullDecay").value.field<Il2Cpp.String>("hiddenValue").value)
        return this.method<Il2Cpp.Object>("FullDecayInventoryItem", 1).invoke(playerItemId)
    }
}

function log_DockServices_OnFullDecayInventoryItemHandler() {
    const DockServices_OnFullDecayInventoryItemHandler = AssemblyCSharp().class("DockServices").method("OnFullDecayInventoryItemHandler")
    //@ts-ignore
    DockServices_OnFullDecayInventoryItemHandler.implementation = function (
        session: Il2Cpp.Object,
        response: Il2Cpp.Object,
        request: Il2Cpp.Object,
        viewContext: Il2Cpp.Array,
    ) {
        console.log("\n")
        console.log("------- DockServices [main, onfulldecayinventoryitemhandler] -------")
        console.log(response.field<Il2Cpp.Object>("body").value)
        console.log(response.field<Il2Cpp.Object>("body").value.field<Il2Cpp.Object>("questAwardElements").value)
        console.log(response.field<Il2Cpp.Object>("body").value.field<Il2Cpp.Object>("questAwardElements").value.method<number>("get_Count").invoke())
        this.method<Il2Cpp.Object>("OnFullDecayInventoryItemHandler").invoke(session, response, request, viewContext)
    }
}

function get_GSFOID_string(GSFOID: Il2Cpp.Object) {
    return GSFOID.method<Il2Cpp.String>("ToString").invoke()
}

function log_GSFPlayerItem_info(GSFPlayerItem: Il2Cpp.Object, indent: number) {
    var ind = "  ".repeat(indent)
    console.log(ind + "GSFPlayerItem: " + get_GSFOID_string(GSFPlayerItem.field<Il2Cpp.Object>("itemID").value))
    const slotId = GSFPlayerItem.field<Il2Cpp.Object>("slotId").value
    if (!slotId.isNull()) { console.log(ind + "slotId: " + get_GSFOID_string(slotId)) }
    const playerId = GSFPlayerItem.field<Il2Cpp.Object>("playerId").value
    if (!playerId.isNull()) { console.log(ind + "playerId: " + get_GSFOID_string(playerId)) }
    console.log(ind + "quantity: " + GSFPlayerItem.field<Il2Cpp.Object>("quantity").value)
    console.log(ind + "itemState: " + GSFPlayerItem.field<Il2Cpp.Object>("itemState").value)
    const item = GSFPlayerItem.field<Il2Cpp.Object>("item").value
    if (!item.isNull()) {
        console.log(ind + "item: ")
        log_GSFItem_info(item, indent + 1, false)
    }

    // iterate and log list of attached items
    var attachedItems = GSFPlayerItem.field<Il2Cpp.Object>("attachedItems").value
    if (!attachedItems.isNull()) {
        var attachedItemsLength = attachedItems.method<number>("get_Count").invoke();
        console.log(ind + "attachedItems of length: " + attachedItemsLength)
        for (let i = 0; i < attachedItemsLength; i++) {
            var attachedGSFPlayerItem = attachedItems.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            log_GSFPlayerItem_info(attachedGSFPlayerItem, indent + 1)
        }
    }
}

function log_GSFAvatarAccent_info(GSFAvatarAccent: Il2Cpp.Object, indent: number, inherit: boolean) {
    var ind = "  ".repeat(indent)
    if (inherit) {
        console.log(ind + "description: " + GSFAvatarAccent.field<Il2Cpp.String>("description").value)
    } else {
        console.log(ind + "GSFAvatarAccent: " + GSFAvatarAccent.field<Il2Cpp.String>("description").value)
    }
    console.log(ind + "oid: " + GSFAvatarAccent.field<Il2Cpp.String>("oid").value)
    console.log(ind + "accentType: " + GSFAvatarAccent.field<Il2Cpp.String>("accentType").value)
    console.log(ind + "rarityType: " + GSFAvatarAccent.field<Il2Cpp.String>("rarityType").value)
    console.log(ind + "rarity: " + GSFAvatarAccent.field<Il2Cpp.String>("rarity").value)
    console.log(ind + "isTransferable: " + GSFAvatarAccent.field<Il2Cpp.String>("isTransferable").value)
    console.log(ind + "isReflective: " + GSFAvatarAccent.field<Il2Cpp.String>("isReflective").value)
    console.log(ind + "inheritColor: " + GSFAvatarAccent.field<Il2Cpp.String>("inheritColor").value)
    console.log(ind + "param: " + GSFAvatarAccent.field<Il2Cpp.String>("param").value)
    console.log(ind + "poolType: " + GSFAvatarAccent.field<Il2Cpp.String>("poolType").value)

    log_GSFAssetContainer_info(GSFAvatarAccent, indent, true)
}

function log_GSFItem_info(GSFItem: Il2Cpp.Object, indent: number, inherit: boolean) {
    var ind = "  ".repeat(indent)
    if (inherit) {
        console.log(ind + "name: " + GSFItem.field<Il2Cpp.String>("name").value)
    } else {
        console.log(ind + "GSFItem: " + GSFItem.field<Il2Cpp.String>("name").value)
    }
    console.log(ind + "oid: " + GSFItem.field<Il2Cpp.String>("oid").value)
    console.log(ind + "quantity: " + GSFItem.field<Il2Cpp.String>("quantity").value)
    log_GSFAssetContainer_info(GSFItem, indent, true)
}

function log_GSFAssetContainer_info(GSFAssetContainer: Il2Cpp.Object, indent: number, inherit: boolean) {
    var ind = "  ".repeat(indent)
    if (!inherit) {
        console.log(ind + "GSFAssetContainer: " + GSFAssetContainer.field<Il2Cpp.String>("oid").value)
    }
    // get assetMap info
    var assetMap = GSFAssetContainer.field<Il2Cpp.Object>("assetMap").value
    var assetMapLength = assetMap.method<number>("get_Count").invoke()
    var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()

    console.log(ind + "assetMap of length: " + assetMapLength)

    // rehouse values into il2cpp array
    var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
    assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)

    // array now contains lists of gsfassets
    // parse contained lists and log their gsfassets
    for (var assetList of assetMapArray) {
        var assetListLength = assetList.method<number>("get_Count").invoke();
        for (let i = 0; i < assetListLength; i++) {
            var GSFAsset = assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            log_GSFAsset_info(GSFAsset, indent + 1)
        }
    }    

    // iterate and log list of assetpackages
    var assetPackages = GSFAssetContainer.field<Il2Cpp.Object>("assetPackages").value
    var assetPackagesLength = assetPackages.method<number>("get_Count").invoke();
    console.log(ind + "assetPackages of length: " + assetPackagesLength)
    for (let i = 0; i < assetPackagesLength; i++) {
        var GSFAssetPackage = assetPackages.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        log_GSFAssetPackage_info(GSFAssetPackage, indent + 1)
    }
}

function log_GSFAssetPackage_info(GSFAssetPackage: Il2Cpp.Object, indent: number) {
    var ind = "  ".repeat(indent)
    console.log(ind + "GSFAssetPackage: " + GSFAssetPackage.field<Il2Cpp.String>("pTag").value)
    log_GSFAssetContainer_info(GSFAssetPackage, indent, true)
}

function log_GSFAsset_info(GSFAsset: Il2Cpp.Object, indent: number) {
    var ind = "  ".repeat(indent)
    console.log(ind + "GSFAsset: " + GSFAsset.field<Il2Cpp.String>("resName").value)
    console.log(ind + "groupName: " + GSFAsset.field<Il2Cpp.String>("groupName").value)
    console.log(ind + "assetTypeName: " + GSFAsset.field<Il2Cpp.String>("assetTypeName").value)
    console.log(ind + "cdnId: " + GSFAsset.field<Il2Cpp.String>("cdnId").value)
}

function log_GetPlayerInventoryByItemCategory_response_des() {
    const GetPlayerInventoryByItemCategory_response_des = AssemblyCSharp().class("GSFGetPlayerInventoryByItemCategorySvc").nested("GSFResponse").method("DeserializeMembers", 2);
    //@ts-ignore
    GetPlayerInventoryByItemCategory_response_des.implementation = function (protocol: Il2Cpp.Object, input: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- GetPlayerInventoryByItemCategory [response, des] -------")
        this.method("DeserializeMembers", 2).invoke(protocol, input);
        // getting playeritem list and count
        var itemlist = this.field<Il2Cpp.Object>("playerItems").value
        var itemcount = itemlist.method<number>("get_Count").invoke();
        console.log("itemList of length: " + itemcount)
        for (let i = 0; i < itemcount; i++) {
            // log each GSFPlayerItem
            var GSFPlayerItem = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
            log_GSFPlayerItem_info(GSFPlayerItem, 0)
        }
    }
}

function log_to_file_GSFOID_ctor () {
    const GSFOID = AssemblyCSharp().class("GSFOID").method(".ctor", 4);
    const GSFOIDctorbyte = GSFOID;
    //@ts-ignore
    GSFOIDctorbyte.implementation = function (
        svcClass: number,
        objType: number,
        server: number,
        objNum: number
    ) {
        write_log("oidlog_byte", svcClass + ", " + objType + ", " + server + ", " + objNum + "\n");
        this.method(".ctor", 4).invoke(svcClass, objType, server, objNum);
    }

    const GSFOIDctorlong = AssemblyCSharp().class("GSFOID").method(".ctor", 1);
    //@ts-ignore
    GSFOIDctorlong.implementation = function (
        l: number
    ) {
        write_log("oidlog_long", l.toString())
        this.method(".ctor", 1).invoke(l)
    }
}

//function log_to_file_

// ------- IL2CPP EDITORS -------
// functions to modify method parameters. we do this in two ways:
// in initial experiments, we await for the game to send a message by itself. we then intercept its constructor,
// and inject our own new parameters. this is pretty simple.
// for the full dump, seen later in the file, we use these in tandem with methods that allow us to create and send
// our own messages, so that we are in combination sending wholly customized messages from scratch

function modify_GSFOtherPlayerDetails_GetPlayerAvatar() {
    const GSFOtherPlayerDetails_GetPlayerAvatar = AssemblyCSharp().class("GSFOtherPlayerDetails").method("GetPlayerAvatar")
    //@ts-ignore
    GSFOtherPlayerDetails_GetPlayerAvatar.implementation = function (this: Il2Cpp.Object | Il2Cpp.Class, playerAvatarId: Il2Cpp.Object) {
        console.log("\n")
        console.log("------- Modified GSFOtherPlayerDetails [main, getplayeravatar] -------")
        var GSFPlayerAvatar = this.method<Il2Cpp.Object>("GetPlayerAvatar").invoke(create_GSFOID(4, 11, 2, 250561))
        console.log("GSFPlayerAvatar: " + GSFPlayerAvatar)
        return GSFPlayerAvatar
    }
}

function modify_GSFGetShowcaseAvatarsSvc_ctor(rarity: number, size: number) {
    const GSFGetShowcaseAvatarsSvc_ctor = AssemblyCSharp().class("GSFGetShowcaseAvatarsSvc").nested("GSFRequest")
    //@ts-ignore
    GSFGetShowcaseAvatarsSvc_ctor.method(".ctor").implementation = function (
        this: Il2Cpp.Object | Il2Cpp.Class,
        rarity_ctor: number,
        size_ctor: number
    ) {
        console.log("\n")
        console.log("------- Modified GSFGetShowcaseAvatarsSvc [request, ctor] -------")
        console.log("rarity: " + rarity_ctor + " -> " + rarity)
        console.log("size: " + size_ctor + " -> " + size)
        console.log("------- Modified GSFGetShowcaseAvatarsSvc [request, ctor] -------")

        // replace rarity/size with our own value
        rarity_ctor = rarity
        size_ctor = size

        this.method(".ctor").invoke(rarity, size)
    }
}

function modify_GSFGetPublicAvatarAccentsByOIDsSvc_ctor() {
    const GSFGetPublicAvatarAccentsByOIDsSvc_request = AssemblyCSharp().class("GSFGetPublicAvatarAccentsByOIDsSvc").nested("GSFRequest")
    //@ts-ignore
    GSFGetPublicAvatarAccentsByOIDsSvc_request.method(".ctor").implementation = function (
        this: Il2Cpp.Object | Il2Cpp.Class,
        oids: Il2Cpp.Object,
        langlocalePairID: Il2Cpp.Object,
        tierID: Il2Cpp.Object,
        birthDate: Il2Cpp.Object,
        registrationDate: Il2Cpp.Object,
        previewDate: Il2Cpp.Object,
        isPreviewEnabled: boolean
    ) {
        // clear list, so we never get correct cache calls and can keep calling
        oids.method("Clear").invoke()

        // replacing GSFOIDs with our own if time for next run has passed
        if (Date.now() - GSFGetPublicAvatarAccentsByOIDsSvc_lastrun > GSFGetPublicAvatarAccentsByOIDsSvc_runstep) {
            replace_GSFOID_list(oids, 4, 200, 0, GSFGetPublicAvatarAccentsByOIDsSvc_lasthandled + GSFGetPublicAvatarAccentsByOIDsSvc_step, GSFGetPublicAvatarAccentsByOIDsSvc_lasthandled)
            console.log("\n")
            console.log("------- Modified GSFGetPublicAvatarAccentsByOIDsSvc [request, ctor] -------")
            console.log("oids of length: " + oids.method<number>("get_Count").invoke())
            for (let i = 0; i < oids.method<number>("get_Count").invoke(); i++) {
                console.log(oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i))
            }
            console.log("tierID:" + tierID)
            console.log("langlocalePairID:" + langlocalePairID)
            console.log("birthDate:" + birthDate)
            console.log("registrationDate:" + registrationDate)
            console.log("previewDate:" + previewDate)
            console.log("isPreviewEnabled:" + isPreviewEnabled)

            GSFGetPublicAvatarAccentsByOIDsSvc_lastrun = Date.now()
            GSFGetPublicAvatarAccentsByOIDsSvc_lasthandled += GSFGetPublicAvatarAccentsByOIDsSvc_step
            write_log("lasthandled_GSFGetPublicAvatarAccentsByOIDsSvc.log", GSFGetPublicAvatarAccentsByOIDsSvc_lasthandled.toString())
        }

        this.method(".ctor").invoke(oids, langlocalePairID, tierID, birthDate, registrationDate, previewDate, isPreviewEnabled)
    }
}

function modify_GSFHeartbeatSvc_request_ctor() {
    const GetAssetsByOIDs_request_ctor = AssemblyCSharp().class("GSFHeartbeatSvc").nested("GSFRequest").method(".ctor");
    //@ts-ignore
    GetAssetsByOIDs_request_ctor.implementation = function (
        activity: number,
        xCoordinate: number,
        yCoordinate: number,
        zCoordinate: number,
        inactivityTime: number
    ) {
        this.method(".ctor").invoke(activity, xCoordinate, yCoordinate, zCoordinate, 0)
    }
}

function modify_GetAssetsByOIDs_request_ctor() {
    const GetAssetsByOIDs_request_ctor = AssemblyCSharp().class("GSFGetAssetsByOIDsSvc").nested("GSFRequest").method(".ctor", 1);
    //@ts-ignore
    GetAssetsByOIDs_request_ctor.implementation = function (oids: Il2Cpp.Object) {
        console.log("called...")
        replace_GSFOID_list(oids, 4, 73, 0, 9617559 + 50, 9617559 - 50)
        this.method(".ctor", 1).invoke(oids);
        console.log(stringify(str_Il2Cpp_Object(this, 0)))
    }
}

function modify_TemplateCacheService_OnResolvePublicItemsByOIDsHandler() {
    const TemplateCacheService_OnResolvePublicItemsByOIDsHandler = AssemblyCSharp().class("TemplateCacheService").method("OnResolvePublicItemsByOIDsHandler", 4)
    //@ts-ignore
    TemplateCacheService_OnResolvePublicItemsByOIDsHandler.implementation = function (
        session: Il2Cpp.Object,
        response: Il2Cpp.Object,
        request: Il2Cpp.Object,
        viewContext: Il2Cpp.Array<Il2Cpp.Object>
    ) {
        console.log("\n")
        console.log("------- Modified TemplateCacheService [OnResolvePublicItemsByOIDsHandler] -------")
        console.log(AssemblyCSharp().class("uPromise.Deferred`1").method("Resolve", 1))
        console.log("session: " + session)
        console.log("response: " + response)
        // replacing underlying request's oids
        modify_GSFGetPublicItemsByOIDsSvc_req(request.field<Il2Cpp.Object>("body").value, 4, 6, 0, 9617788 - 400, 9617788 - 500)
        var itemlist = viewContext.get(1)
        //replace_GSFPlayerItem_list(itemlist, 9617788 - 400, 9617788 - 500)
        log_GSFGetPublicItemsByOIDsSvc_request_info(request.field<Il2Cpp.Object>("body").value, 1)
        this.method("OnResolvePublicItemsByOIDsHandler").invoke(session, response, request, viewContext)
        console.log(viewContext)
        // wait(10000)
        // console.log(viewContext)
        // // getting playeritem list and count
        // var itemlist = viewContext.get(1)
        // var itemcount = itemlist.method<number>("get_Count").invoke();
        // console.log("itemList of length: " + itemcount)
        // for (let i = 0; i < itemcount; i++) {
        //     // log each GSFPlayerItem
        //     var GSFPlayerItem = itemlist.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        //     log_GSFPlayerItem_info(GSFPlayerItem, 0)
        // }
    }
}

function modify_GSFPlayerItem_info(GSFPlayerItem: Il2Cpp.Object, svcClass: number, objType: number, server: number, objNum: number) {
    modify_GSFOID_info(GSFPlayerItem.field<Il2Cpp.Object>("itemID").value, svcClass, objType, server, objNum)
}

function modify_GSFOID_info(GSFOID: Il2Cpp.Object, svcClass: number, objType: number, server: number, objNum: number) {
    GSFOID.method("Set", 4).invoke(svcClass, objType, server, objNum)
}

function modify_GSFOID_ctor() {
    const GSFOID_ctor = AssemblyCSharp().class("GSFOID").method(".ctor", 4);
    //@ts-ignore
    GSFOID_ctor.implementation = function (
        svcClass: number,
        objType: number,
        server: number,
        objNum: number
    ) {
        // modify here
        // objType is defined in GSFAwObjectTypes
        this.method(".ctor", 4).invoke(svcClass, objType, server, objNum);
    }
}

function modify_GSFGetPublicItemsByOIDsSvc_req(GSFGetPublicItemsByOIDsSvc: Il2Cpp.Object, svcClass: number, objType: number, server: number, objNumUpper: number, objNumLower: number) {
    const oids = GSFGetPublicItemsByOIDsSvc.field<Il2Cpp.Object>("oids").value
    replace_GSFOID_list(oids, svcClass, objType, server, objNumUpper, objNumLower)
}

function modify_MessageHeader_ctor() {
    const MessageHeader_ctor = AssemblyCSharp().class("MessageHeader").method(".ctor", 1)
    //@ts-ignore
    MessageHeader_ctor.implementation = function (
        requestId: number
    ) {
        this.method(".ctor", 1).invoke(150);
    }
}


function replace_GSFOID_list (GSFOIDList: Il2Cpp.Object, svcClass: number, objType: number, server: number, objNumUpper: number, objNumLower: number) {
    GSFOIDList.method("Clear").invoke()
    for (var i = objNumUpper; i >= objNumLower; i--) {
        GSFOIDList.method("Add", 1).invoke(create_GSFOID(svcClass, objType, server, i))
    }
    return GSFOIDList
}

function modify_WowGameController_ctor() {
    const WowGameController_ctor = AssemblyCSharp_reg().class("Game.WheelOfWow.WowGameController").method(".ctor")
    //@ts-ignore
    WowGameController_ctor.implementation = function (
        this: Il2Cpp.Object | Il2Cpp.Class
    ) {
        // replace bonusSlotCount so we get a bonus every time
        //@ts-ignore
        this.field<number>("bonusPlays").value = 24
        this.method(".ctor").invoke()
        //@ts-ignore
        this.field<number>("bonusPlays").value = 24
        console.log("bonusPlays: " + this.field<number>("bonusPlays").value)
    }
}

function modify_GSFGetPublicItemsByOIDsSvc_ctor() {
    const GSFGetPublicItemsByOIDsSvc_request = AssemblyCSharp().class("GSFGetPublicItemsByOIDsSvc").nested("GSFRequest")
    //@ts-ignore
    GSFGetPublicItemsByOIDsSvc_request.method(".ctor").implementation = function (
        this: Il2Cpp.Object | Il2Cpp.Class,
        oids: Il2Cpp.Object,
        langlocalePairID: Il2Cpp.Object,
        tierID: Il2Cpp.Object,
        birthDate: Il2Cpp.Object,
        registrationDate: Il2Cpp.Object,
        previewDate: Il2Cpp.Object,
        isPreviewEnabled: boolean
    ) {
        // clear list, so we never get correct cache calls and can keep calling
        oids.method("Clear").invoke()

        // replacing GSFOIDs with our own if time for next run has passed
        if (Date.now() - GSFGetPublicItemsByOIDsSvc_lastrun > GSFGetPublicItemsByOIDsSvc_runstep && GSFGetPublicItemsByOIDsSvc_lasthandled > 0) {
            replace_GSFOID_list(oids, 4, 6, 0, GSFGetPublicItemsByOIDsSvc_lasthandled, GSFGetPublicItemsByOIDsSvc_lasthandled - GSFGetPublicItemsByOIDsSvc_step)
            console.log("\n")
            console.log("------- Modified GetPublicItemsByOIDs [request, ctor] -------")
            console.log("oids of length: " + oids.method<number>("get_Count").invoke())
            for (let i = 0; i < oids.method<number>("get_Count").invoke(); i++) {
                console.log(oids.method<Il2Cpp.Object>("get_Item", 1).invoke(i))
            }
            console.log("tierID:" + tierID)
            console.log("langlocalePairID:" + langlocalePairID)
            console.log("birthDate:" + birthDate)
            console.log("registrationDate:" + registrationDate)
            console.log("previewDate:" + previewDate)
            console.log("isPreviewEnabled:" + isPreviewEnabled)

            GSFGetPublicItemsByOIDsSvc_lastrun = Date.now()
            GSFGetPublicItemsByOIDsSvc_lasthandled -= GSFGetPublicItemsByOIDsSvc_step
            write_log("lasthandled.log", GSFGetPublicItemsByOIDsSvc_lasthandled.toString())
        }

        this.method(".ctor").invoke(oids, langlocalePairID, tierID, birthDate, registrationDate, previewDate, isPreviewEnabled)
    }
}

// ------- STRINGIFY FUNCTIONS -------
// converting deserialized data to json for extraction and handover to the wiki team.
// this intial method relies on interfaces: we are in direct control, walking the object tree
// ourselves and calling methods on its fields, presenting our final datastructure as an interface.
// this produces much neater objects but requires a huge amount of code for each new object, and
// given that there are many hundreds of such objects in webkinz, this isn't viable at scale.

interface GSFOIDIntPairInterface {
    a: GSFOIDInterface;
    b?: number;
}

interface GSFPlayerWalletPurchaseOrderInterface {
    oid: GSFOIDInterface
    walletOwnerId: string;
    playerID: GSFOIDInterface;
    appId: string;
    walletName: string;
    walletTransactionId: string;
    itemID: GSFOIDInterface;
    storeItemID: GSFOIDInterface;
    walletStatus: string;
    status: string;
    amount: number;
    currency: string;
    createDate: string | null;
    receipt: string;
}

interface GSFAvatarShowcaseInterface {
    baby: GSFPlayerAvatarInterface
    primaryParent: GSFPlayerAvatarInterface
    secondaryParent: GSFPlayerAvatarInterface
}

interface GSFAvatarInterface {
    name: string;
    description: string;
    dimensions: string;
    weight: number;
    height: number;
    maxOutfits: number;
    param: string;
    breed: number;
    state: number;
    rarity: number;
    babyTasks: number;
    kidTasks: number;
    isBreedable: boolean;
    accent01ID?: GSFOIDInterface;
    accent02ID?: GSFOIDInterface;
    accent03ID?: GSFOIDInterface;
    accent04ID?: GSFOIDInterface;
    accent05ID?: GSFOIDInterface;
    accent06ID?: GSFOIDInterface;
    accent07ID?: GSFOIDInterface;
    accent08ID?: GSFOIDInterface;
    accent09ID?: GSFOIDInterface;
    accent10ID?: GSFOIDInterface;
    productType: number;
    assetMap: GSFAssetInterface[];
}

interface GSFPlayerAvatarInterface {
    oid: GSFOIDInterface;
    avatarID: GSFOIDInterface;
    playerID: GSFOIDInterface;
    buildingID?: GSFOIDInterface;
    name: string;
    bio: string;
    gender: string;
    createTS?: string | null;
    playerAvatarOutfitId?: GSFOIDInterface;
    outfitNo: number;
    x: number;
    y: number;
    z: number;
    rotation: string;
    parentID?: GSFOIDInterface;
    parentTemplateID?: GSFOIDInterface;
    parentOrdinal: number;
    playTime?: number;
    lastPlay?: string | null;
    birthDay?: string | null;
    breed: number;
    state: number;
    rarity: number;
    babyTasks: number;
    growthPoints: number;
    bonusAvailable: boolean;
    kidTasks: number;
    accent01ID?: GSFOIDInterface;
    accent02ID?: GSFOIDInterface;
    accent03ID?: GSFOIDInterface;
    accent04ID?: GSFOIDInterface;
    accent05ID?: GSFOIDInterface;
    accent06ID?: GSFOIDInterface;
    accent07ID?: GSFOIDInterface;
    accent08ID?: GSFOIDInterface;
    accent09ID?: GSFOIDInterface;
    accent10ID?: GSFOIDInterface;
    playedByID?: GSFOIDInterface;
    generation: number;
    primaryParentID?: GSFOIDInterface;
    secondaryParentID?: GSFOIDInterface;
    accent01Origin?: number;
    accent02Origin?: number;
    accent03Origin?: number;
    accent04Origin?: number;
    accent05Origin?: number;
    accent06Origin?: number;
    accent07Origin?: number;
    accent08Origin?: number;
    accent09Origin?: number;
    accent10Origin?: number;
    accent01Rarity?: number;
    accent02Rarity?: number;
    accent03Rarity?: number;
    accent04Rarity?: number;
    accent05Rarity?: number;
    accent06Rarity?: number;
    accent07Rarity?: number;
    accent08Rarity?: number;
    accent09Rarity?: number;
    accent10Rarity?: number;
    daycareType: number;
    daycareEndDate?: string | null;
    playerAvatarItemId?: GSFOIDInterface;
    avatar?: GSFAvatarInterface;
    avatarAccents: GSFAvatarAccentInterface[];
    primaryParent?: GSFPlayerAvatarInterface;
    accentSlotRarities: GSFOIDIntPairInterface[];
    plushPurchaseOrder?: GSFPlayerWalletPurchaseOrderInterface;
}

interface GSFAvatarAccentInterface {
    description: string;
    oid: GSFOIDInterface;
    accentType: number;
    rarityType: number;
    rarity: number;
    isTransferable: boolean;
    isReflective: boolean;
    inheritColor: boolean;
    param: string;
    poolType: number;
    assetMap: GSFAssetInterface[];
}

interface GSFInventoryPositionInterface {
    rotation: string;
    x: number;
    y: number;
    z: number;
}

interface GSFPlayerItemInterface {
    oid: GSFOIDInterface;
    itemID: GSFOIDInterface;
    ordinal: number;
    parentPioId?: GSFOIDInterface;
    slotId?: GSFOIDInterface;
    playerAvatarOutfitId?: GSFOIDInterface;
    inventoryPosition?: GSFInventoryPositionInterface;
    isYard: boolean;
    playerMazeId?: GSFOIDInterface;
    playerAvatarId?: GSFOIDInterface;
    playerId: GSFOIDInterface;
    isItemUsed: boolean;
    sellPrice: number;
    createDate?: string | null;
    growthCompletionDate?: string | null;
    growthStartDate?: string | null;
    matureEndDate?: string | null;
    decayEndDate?: string | null;
    harvestDate?: string | null;
    attachedItems: GSFPlayerItemInterface[];
    sendingID?: GSFOIDInterface;
    quantity: number;
    unitsToExpire: number;
    qualityIndex: number;
    itemState: number;
    item: GSFItemInterface;
    quantityInTransit: number;
}

interface GSFItemInterface {
    name: string;
    oid: GSFOIDInterface;
    IsABed: boolean;
    IsACrib: boolean;
    IsAGem: boolean;
    IsAStroller: boolean;
    IsClassic: boolean;
    IsClassicDiamond: boolean;
    IsClassicDiamondRegular: boolean;
    IsClassicDiamondSmall: boolean;
    IsClassicNoDuplicates: boolean;
    IsClassicRegular: boolean;
    IsClassicSmall: boolean;
    IsCompetitionFood: boolean;
    IsContainer3D: boolean;
    IsHarvestable: boolean;
    IsSlag: boolean;
    acceptsPresentable: boolean;
    decayDuration: number;
    quantity: number;
    depth: number;
    growthRate: number;
    height: number;
    isPresentable: boolean;
    isTradeable: boolean;
    isUserSellable: boolean;
    matureDuration: number;
    qualityIndex: number;
    returnToDockNotAllowed: boolean;
    sellPrice: number;
    width: number;
    slotIds: GSFOIDInterface[];
    itemCategories: GSFItemCategoryInterface[];
    assetMap: GSFAssetInterface[];
    assetPackages: GSFAssetPackageInterface[];
}

interface GSFOIDInterface {
    objectClass: number,
    type: number,
    server: number,
    num: number
}

interface GSFAssetInterface {
    resName: string;
    groupName: string;
    assetTypeName: string;
    cdnId: string;
}

interface GSFItemCategoryInterface {
    name: string;
    isOutdoor: boolean;
    isWalkover: boolean;
    parentId?: GSFOIDInterface;
    showInDock: boolean;
    ordinal: number;
    ruleProperty?: GSFRulePropertyInterface | null;
    locked: boolean;
    isMultiplayer: boolean;
    isPlayerHosted: boolean;
    isPlayedOffline: boolean;
    lockReasons: string[];
    assetMap: GSFAssetInterface[];
    assetPackages: GSFAssetPackageInterface[];
}

interface GSFAssetPackageInterface {
    pTag: string;
    createDate?: string | null;
    assetMap: GSFAssetInterface[];
    assetPackages: GSFAssetPackageInterface[];
}

interface GSFRulePropertyInterface {
    ID: GSFOIDInterface;
    parentID: GSFOIDInterface;
    components: string[];
    parentComponents: string[];
    properties: Map<string, string>;
    childrenGroup: Map<string, GSFRulePropertyInterface[]>;
    lookup: Map<string, string>;
}

function get_stringify_boolean (object: Il2Cpp.Object, field: string) {
    return object.field<boolean>(field).value.valueOf()
}

function get_stringify_number (object: Il2Cpp.Object, field: string, boxed?: boolean) {
    const output = boxed ? Number(object.field<Il2Cpp.ValueType>(field).value) : object.field<number>(field).value
    return output
}

function get_stringify_string (object: Il2Cpp.Object, field: string) {
    return object.field<Il2Cpp.String>(field).value.toString()
}

function get_stringify_GSFOID (object: Il2Cpp.Object, field: string) {
    return stringify_GSFOID(object.field<Il2Cpp.Object>(field).value)
}

function get_stringify_GSFOID_safe (object: Il2Cpp.Object, field: string) {
    return present(object, field) ? stringify_GSFOID(object.field<Il2Cpp.Object>(field).value) : undefined
}

function get_stringify_DateTime (object: Il2Cpp.Object, field: string) {
    // CURRENTLY BROKEN [maybe]
    const boxed_nullable = object.field<Il2Cpp.ValueType>(field).value.box()
    return boxed_nullable.isNull() ? null : boxed_nullable.method<Il2Cpp.String>("ToString").invoke().toString();
}

function get_stringify_assetMap (object: Il2Cpp.Object, field: string) {
    // dump assetmap info to array
    var assetMapString = []
    // copy contained dictionary to array of dictionary's contained lists
    var assetMap = object.field<Il2Cpp.Object>(field).value
    var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()
    var assetMapLength = assetMap.method<number>("get_Count").invoke()
    var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
    assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)
    // parse contained lists and push their GSFAssets
    for (var assetList of assetMapArray) {
        var assetListLength = assetList.method<number>("get_Count").invoke();
        for (let i = 0; i < assetListLength; i++) {
            assetMapString.push(stringify_GSFAsset(assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }
    return assetMapString
}

function stringify_GSFAvatarShowcase (GSFAvatarShowcase: Il2Cpp.Object) {
    var GSFAvatarShowcaseString: GSFAvatarShowcaseInterface = {
        baby: stringify_GSFPlayerAvatar(GSFAvatarShowcase.field<Il2Cpp.Object>("baby").value),
        primaryParent: stringify_GSFPlayerAvatar(GSFAvatarShowcase.field<Il2Cpp.Object>("primaryParent").value),
        secondaryParent: stringify_GSFPlayerAvatar(GSFAvatarShowcase.field<Il2Cpp.Object>("secondaryParent").value),
    }
    return GSFAvatarShowcaseString
}

function stringify_GSFPlayerAvatar (GSFPlayerAvatar: Il2Cpp.Object) {
    // dump GSFPlayerAvatar info to root
    console.log(GSFPlayerAvatar.field<Il2Cpp.ValueType>("lastPlay").value.box())
    var GSFPlayerAvatarString: GSFPlayerAvatarInterface = {
        oid: get_stringify_GSFOID(GSFPlayerAvatar, "oid"),
        avatarID: get_stringify_GSFOID(GSFPlayerAvatar, "avatarID"),
        playerID: get_stringify_GSFOID(GSFPlayerAvatar, "playerID"),
        buildingID: present(GSFPlayerAvatar, "buildingID") ? get_stringify_GSFOID(GSFPlayerAvatar, "buildingID") : undefined,
        name: get_stringify_string(GSFPlayerAvatar, "name"),
        bio: get_stringify_string(GSFPlayerAvatar, "bio"),
        gender: get_stringify_string(GSFPlayerAvatar, "gender"),
        createTS: present(GSFPlayerAvatar, "createTS") ? get_stringify_DateTime(GSFPlayerAvatar, "createTS") : undefined,
        playerAvatarOutfitId: present(GSFPlayerAvatar, "playerAvatarOutfitId") ? get_stringify_GSFOID(GSFPlayerAvatar, "playerAvatarOutfitId") : undefined,
        outfitNo: get_stringify_number(GSFPlayerAvatar, "outfitNo"),
        x: get_stringify_number(GSFPlayerAvatar, "x"),
        y: get_stringify_number(GSFPlayerAvatar, "y"),
        z: get_stringify_number(GSFPlayerAvatar, "z"),
        rotation: get_stringify_string(GSFPlayerAvatar, "rotation"),
        parentID: present(GSFPlayerAvatar, "parentID") ? get_stringify_GSFOID(GSFPlayerAvatar, "parentID") : undefined,
        parentTemplateID: present(GSFPlayerAvatar, "parentID") ? get_stringify_GSFOID(GSFPlayerAvatar, "parentTemplateID"): undefined,
        parentOrdinal: get_stringify_number(GSFPlayerAvatar, "parentOrdinal"),
        playTime: present(GSFPlayerAvatar, "playTime") ? get_stringify_number(GSFPlayerAvatar, "playTime", true) : undefined,
        lastPlay: present(GSFPlayerAvatar, "lastPlay") ? get_stringify_DateTime(GSFPlayerAvatar, "lastPlay") : undefined,
        birthDay: present(GSFPlayerAvatar, "birthDay") ? get_stringify_DateTime(GSFPlayerAvatar, "birthDay") : undefined,
        breed: get_stringify_number(GSFPlayerAvatar, "breed"),
        state: get_stringify_number(GSFPlayerAvatar, "state"),
        rarity: get_stringify_number(GSFPlayerAvatar, "rarity"),
        babyTasks: get_stringify_number(GSFPlayerAvatar, "babyTasks"),
        growthPoints: get_stringify_number(GSFPlayerAvatar, "growthPoints"),
        bonusAvailable: get_stringify_boolean(GSFPlayerAvatar, "bonusAvailable"),
        kidTasks: get_stringify_number(GSFPlayerAvatar, "kidTasks"),
        accent01ID: present(GSFPlayerAvatar, "accent01ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent01ID") : undefined,
        accent02ID: present(GSFPlayerAvatar, "accent02ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent02ID") : undefined,
        accent03ID: present(GSFPlayerAvatar, "accent03ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent03ID") : undefined,
        accent04ID: present(GSFPlayerAvatar, "accent04ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent04ID") : undefined,
        accent05ID: present(GSFPlayerAvatar, "accent05ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent05ID") : undefined,
        accent06ID: present(GSFPlayerAvatar, "accent06ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent06ID") : undefined,
        accent07ID: present(GSFPlayerAvatar, "accent07ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent07ID") : undefined,
        accent08ID: present(GSFPlayerAvatar, "accent08ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent08ID") : undefined,
        accent09ID: present(GSFPlayerAvatar, "accent09ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent09ID") : undefined,
        accent10ID: present(GSFPlayerAvatar, "accent10ID") ? get_stringify_GSFOID(GSFPlayerAvatar, "accent10ID") : undefined,
        playedByID: present(GSFPlayerAvatar, "playedByID") ? get_stringify_GSFOID(GSFPlayerAvatar, "playedByID") : undefined,
        generation: get_stringify_number(GSFPlayerAvatar, "generation"),
        primaryParentID: present(GSFPlayerAvatar, "primaryParentID") ? get_stringify_GSFOID(GSFPlayerAvatar, "primaryParentID"): undefined,
        secondaryParentID: present(GSFPlayerAvatar, "secondaryParentID") ? get_stringify_GSFOID(GSFPlayerAvatar, "secondaryParentID"): undefined,
        accent01Origin: present(GSFPlayerAvatar, "accent01Origin") ? get_stringify_number(GSFPlayerAvatar, "accent01Origin", true) : undefined,
        accent02Origin: present(GSFPlayerAvatar, "accent02Origin") ? get_stringify_number(GSFPlayerAvatar, "accent02Origin", true) : undefined,
        accent03Origin: present(GSFPlayerAvatar, "accent03Origin") ? get_stringify_number(GSFPlayerAvatar, "accent03Origin", true) : undefined,
        accent04Origin: present(GSFPlayerAvatar, "accent04Origin") ? get_stringify_number(GSFPlayerAvatar, "accent04Origin", true) : undefined,
        accent05Origin: present(GSFPlayerAvatar, "accent05Origin") ? get_stringify_number(GSFPlayerAvatar, "accent05Origin", true) : undefined,
        accent06Origin: present(GSFPlayerAvatar, "accent06Origin") ? get_stringify_number(GSFPlayerAvatar, "accent06Origin", true) : undefined,
        accent07Origin: present(GSFPlayerAvatar, "accent07Origin") ? get_stringify_number(GSFPlayerAvatar, "accent07Origin", true) : undefined,
        accent08Origin: present(GSFPlayerAvatar, "accent08Origin") ? get_stringify_number(GSFPlayerAvatar, "accent08Origin", true) : undefined,
        accent09Origin: present(GSFPlayerAvatar, "accent09Origin") ? get_stringify_number(GSFPlayerAvatar, "accent09Origin", true) : undefined,
        accent10Origin: present(GSFPlayerAvatar, "accent10Origin") ? get_stringify_number(GSFPlayerAvatar, "accent10Origin", true) : undefined,
        accent01Rarity: present(GSFPlayerAvatar, "accent01Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent01Origin", true) : undefined,
        accent02Rarity: present(GSFPlayerAvatar, "accent02Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent02Origin", true) : undefined,
        accent03Rarity: present(GSFPlayerAvatar, "accent03Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent03Origin", true) : undefined,
        accent04Rarity: present(GSFPlayerAvatar, "accent04Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent04Origin", true) : undefined,
        accent05Rarity: present(GSFPlayerAvatar, "accent05Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent05Origin", true) : undefined,
        accent06Rarity: present(GSFPlayerAvatar, "accent06Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent06Origin", true) : undefined,
        accent07Rarity: present(GSFPlayerAvatar, "accent07Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent07Origin", true) : undefined,
        accent08Rarity: present(GSFPlayerAvatar, "accent08Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent08Origin", true) : undefined,
        accent09Rarity: present(GSFPlayerAvatar, "accent09Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent09Origin", true) : undefined,
        accent10Rarity: present(GSFPlayerAvatar, "accent10Rarity") ? get_stringify_number(GSFPlayerAvatar, "accent10Origin", true) : undefined,
        daycareType: get_stringify_number(GSFPlayerAvatar, "daycareType", true),
        daycareEndDate: present(GSFPlayerAvatar, "playerAvatarItemId") ? get_stringify_DateTime(GSFPlayerAvatar, "daycareEndDate") : undefined,
        playerAvatarItemId: present(GSFPlayerAvatar, "playerAvatarItemId") ? get_stringify_GSFOID(GSFPlayerAvatar, "playerAvatarItemId") : undefined,
        avatar: present(GSFPlayerAvatar, "avatar") ? stringify_GSFAvatar(GSFPlayerAvatar.field<Il2Cpp.Object>("avatar").value) : undefined,
        avatarAccents: [],
        primaryParent: present(GSFPlayerAvatar, "primaryParent") ? stringify_GSFPlayerAvatar(GSFPlayerAvatar.field<Il2Cpp.Object>("primaryParent").value) : undefined,
        accentSlotRarities: [],
        plushPurchaseOrder: present(GSFPlayerAvatar, "plushPurchaseOrder") ? stringify_GSFPlayerWalletPurchaseOrder(GSFPlayerAvatar.field<Il2Cpp.Object>("plushPurchaseOrder").value) : undefined,
    }

    // dump avatar accents to array
    if (present(GSFPlayerAvatar, "avatarAccents")) {
        const avatarAccentsList = GSFPlayerAvatar.field<Il2Cpp.Object>("avatarAccents").value
        const avatarAccentsLength = avatarAccentsList.method<number>("get_Count").invoke();
        for (let i = 0; i < avatarAccentsLength; i++) {
            GSFPlayerAvatarString.avatarAccents.push(stringify_GSFAvatarAccent(avatarAccentsList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }

    // dump accent slot rarities to array
    if (present(GSFPlayerAvatar, "accentSlotRarities")) {
        const accentSlotRaritiesList = GSFPlayerAvatar.field<Il2Cpp.Object>("accentSlotRarities").value
        const accentSlotRaritiesLength = accentSlotRaritiesList.method<number>("get_Count").invoke();
        for (let i = 0; i < accentSlotRaritiesLength; i++) {
            GSFPlayerAvatarString.accentSlotRarities.push(stringify_GSFOIDIntPair(accentSlotRaritiesList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }


    return GSFPlayerAvatarString
}

function stringify_GSFPlayerWalletPurchaseOrder (GSFPlayerWalletPurchaseOrder: Il2Cpp.Object) {
    var GSFPlayerWalletPurchaseOrderString: GSFPlayerWalletPurchaseOrderInterface = {
        oid: get_stringify_GSFOID(GSFPlayerWalletPurchaseOrder, "oid"),
        walletOwnerId: get_stringify_string(GSFPlayerWalletPurchaseOrder, "walletOwnerId"),
        playerID: get_stringify_GSFOID(GSFPlayerWalletPurchaseOrder, "playerID"),
        appId: get_stringify_string(GSFPlayerWalletPurchaseOrder, "appId"),
        walletName: get_stringify_string(GSFPlayerWalletPurchaseOrder, "walletName"),
        walletTransactionId: get_stringify_string(GSFPlayerWalletPurchaseOrder, "walletTransactionId"),
        itemID: get_stringify_GSFOID(GSFPlayerWalletPurchaseOrder, "itemID"),
        storeItemID: get_stringify_GSFOID(GSFPlayerWalletPurchaseOrder, "storeItemID"),
        walletStatus: get_stringify_string(GSFPlayerWalletPurchaseOrder, "walletStatus"),
        status: get_stringify_string(GSFPlayerWalletPurchaseOrder, "status"),
        amount: get_stringify_number(GSFPlayerWalletPurchaseOrder, "amount"),
        currency: get_stringify_string(GSFPlayerWalletPurchaseOrder, "currency"),
        createDate: get_stringify_DateTime(GSFPlayerWalletPurchaseOrder, "createDate"),
        receipt: get_stringify_string(GSFPlayerWalletPurchaseOrder, "receipt"),
    }
    return GSFPlayerWalletPurchaseOrderString
}

function stringify_GSFOIDIntPair (GSFOIDIntPair: Il2Cpp.Object) {
    var GSFOIDIntPairString: GSFOIDIntPairInterface = {
        a: get_stringify_GSFOID(GSFOIDIntPair, "a"),
        b: get_stringify_number(GSFOIDIntPair, "b"),
    }
    return GSFOIDIntPairString
}

function stringify_GSFAvatar (GSFAvatar: Il2Cpp.Object) {
    // dump GSFAvatar info to root
    var GSFAvatarString: GSFAvatarInterface = {
        name: get_stringify_string(GSFAvatar, "name"),
        description: get_stringify_string(GSFAvatar, "description"),
        dimensions: get_stringify_string(GSFAvatar, "dimensions"),
        weight: get_stringify_number(GSFAvatar, "weight"),
        height: get_stringify_number(GSFAvatar, "height"),
        maxOutfits: get_stringify_number(GSFAvatar, "maxOutfits"),
        param: get_stringify_string(GSFAvatar, "param"),
        breed: get_stringify_number(GSFAvatar, "breed"),
        state: get_stringify_number(GSFAvatar, "state"),
        rarity: get_stringify_number(GSFAvatar, "rarity"),
        babyTasks: get_stringify_number(GSFAvatar, "babyTasks"),
        kidTasks: get_stringify_number(GSFAvatar, "kidTasks"),
        isBreedable: get_stringify_boolean(GSFAvatar, "isBreedable"),
        accent01ID: present(GSFAvatar, "accent01ID") ? get_stringify_GSFOID(GSFAvatar, "accent01ID") : undefined,
        accent02ID: present(GSFAvatar, "accent02ID") ? get_stringify_GSFOID(GSFAvatar, "accent02ID") : undefined,
        accent03ID: present(GSFAvatar, "accent03ID") ? get_stringify_GSFOID(GSFAvatar, "accent03ID") : undefined,
        accent04ID: present(GSFAvatar, "accent04ID") ? get_stringify_GSFOID(GSFAvatar, "accent04ID") : undefined,
        accent05ID: present(GSFAvatar, "accent05ID") ? get_stringify_GSFOID(GSFAvatar, "accent05ID") : undefined,
        accent06ID: present(GSFAvatar, "accent06ID") ? get_stringify_GSFOID(GSFAvatar, "accent06ID") : undefined,
        accent07ID: present(GSFAvatar, "accent07ID") ? get_stringify_GSFOID(GSFAvatar, "accent07ID") : undefined,
        accent08ID: present(GSFAvatar, "accent08ID") ? get_stringify_GSFOID(GSFAvatar, "accent08ID") : undefined,
        accent09ID: present(GSFAvatar, "accent09ID") ? get_stringify_GSFOID(GSFAvatar, "accent09ID") : undefined,
        accent10ID: present(GSFAvatar, "accent10ID") ? get_stringify_GSFOID(GSFAvatar, "accent10ID") : undefined,
        productType: get_stringify_number(GSFAvatar, "productType"),
        assetMap: get_stringify_assetMap(GSFAvatar, "assetMap"),
    }
    return GSFAvatarString
}

function stringify_GSFAvatarAccent (GSFAvatarAccent: Il2Cpp.Object) {
    // dump GSFAvatarAccent info to root
    var GSFAvatarAccentString: GSFAvatarAccentInterface = {
        description: GSFAvatarAccent.field<Il2Cpp.String>("description").value.toString(),
        oid: stringify_GSFOID(GSFAvatarAccent.field<Il2Cpp.Object>("oid").value),
        accentType: GSFAvatarAccent.field<number>("accentType").value,
        rarityType: GSFAvatarAccent.field<number>("rarityType").value,
        rarity: GSFAvatarAccent.field<number>("rarity").value,
        isTransferable: GSFAvatarAccent.field<boolean>("isTransferable").value.valueOf(),
        isReflective: GSFAvatarAccent.field<boolean>("isReflective").value.valueOf(),
        inheritColor: GSFAvatarAccent.field<boolean>("inheritColor").value.valueOf(),
        param: GSFAvatarAccent.field<Il2Cpp.String>("param").value.toString(),
        poolType: GSFAvatarAccent.field<number>("poolType").value,
        assetMap: []
    }

    // dump assetmap info to array
    // copy contained dictionary to array of dictionary's contained lists
    var assetMap = GSFAvatarAccent.field<Il2Cpp.Object>("assetMap").value
    var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()
    var assetMapLength = assetMap.method<number>("get_Count").invoke()
    var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
    assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)
    // parse contained lists and push their GSFAssets
    for (var assetList of assetMapArray) {
        var assetListLength = assetList.method<number>("get_Count").invoke();
        for (let i = 0; i < assetListLength; i++) {
            GSFAvatarAccentString.assetMap.push(stringify_GSFAsset(assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }
    return GSFAvatarAccentString
}

function stringify_GSFInventoryPosition (GSFInventoryPosition: Il2Cpp.Object) {
    var GSFInventoryPositionString: GSFInventoryPositionInterface = {
        rotation: get_stringify_string(GSFInventoryPosition, "rotation"),
        x: get_stringify_number(GSFInventoryPosition, "x"),
        y: get_stringify_number(GSFInventoryPosition, "y"),
        z: get_stringify_number(GSFInventoryPosition, "z"),
    }
    return GSFInventoryPositionString
}

function stringify_GSFPlayerItem (GSFPlayerItem: Il2Cpp.Object) {
    var GSFPlayerItemString: GSFPlayerItemInterface = {
        oid: get_stringify_GSFOID(GSFPlayerItem, "oid"),
        itemID: get_stringify_GSFOID(GSFPlayerItem, "itemID"),
        ordinal: get_stringify_number(GSFPlayerItem, "ordinal"),
        parentPioId: get_stringify_GSFOID_safe(GSFPlayerItem, "parentPioId"),
        slotId: get_stringify_GSFOID_safe(GSFPlayerItem, "slotId"),
        playerAvatarOutfitId: get_stringify_GSFOID_safe(GSFPlayerItem, "playerAvatarOutfitId"),
        inventoryPosition: present(GSFPlayerItem, "inventoryPosition") ? stringify_GSFInventoryPosition(GSFPlayerItem.field<Il2Cpp.Object>("inventoryPosition").value) : undefined,
        isYard: get_stringify_boolean(GSFPlayerItem, "isYard"),
        playerMazeId: get_stringify_GSFOID_safe(GSFPlayerItem, "playerMazeId"),
        playerAvatarId: get_stringify_GSFOID_safe(GSFPlayerItem, "playerAvatarId"),
        playerId: get_stringify_GSFOID(GSFPlayerItem, "playerId"),
        isItemUsed: get_stringify_boolean(GSFPlayerItem, "isYard"),
        sellPrice: get_stringify_number(GSFPlayerItem, "sellPrice"),
        createDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        growthCompletionDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        growthStartDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        matureEndDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        decayEndDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        harvestDate: get_stringify_DateTime(GSFPlayerItem, "createDate"),
        attachedItems: [],
        sendingID: get_stringify_GSFOID_safe(GSFPlayerItem, "sendingID"),
        quantity: get_stringify_number(GSFPlayerItem, "quantity"),
        unitsToExpire: get_stringify_number(GSFPlayerItem, "unitsToExpire"),
        qualityIndex: get_stringify_number(GSFPlayerItem, "qualityIndex"),
        itemState: get_stringify_number(GSFPlayerItem, "itemState"),
        item: stringify_GSFItem(GSFPlayerItem.field<Il2Cpp.Object>("item").value),
        quantityInTransit: get_stringify_number(GSFPlayerItem, "quantityInTransit"),
    }

    // dump attached items to array
    const attachedItems = GSFPlayerItem.field<Il2Cpp.Object>("attachedItems").value
    if (!attachedItems.isNull()) {
        const attachedItemsLength = attachedItems.method<number>("get_Count").invoke()
        for (var i = 0; i < attachedItemsLength; i++) {
            GSFPlayerItemString.attachedItems.push(stringify_GSFPlayerItem(attachedItems.method<Il2Cpp.Object>("get_Item").invoke(i)))
        }
    }

    return GSFPlayerItemString
}

function stringify_GSFItem (GSFItem: Il2Cpp.Object) {
    // dump gsfitem info to root
    var GSFItemString: GSFItemInterface = {
        name: GSFItem.field<Il2Cpp.String>("name").value.toString(),
        oid: stringify_GSFOID(GSFItem.field<Il2Cpp.Object>("oid").value),
        IsABed: GSFItem.method<boolean>("get_IsABed").invoke(),
        IsACrib: GSFItem.method<boolean>("get_IsACrib").invoke(),
        IsAGem: GSFItem.method<boolean>("get_IsAGem").invoke(),
        IsAStroller: GSFItem.method<boolean>("get_IsAStroller").invoke(),
        IsClassic: GSFItem.method<boolean>("get_IsClassic").invoke(),
        IsClassicDiamond: GSFItem.method<boolean>("get_IsClassicDiamond").invoke(),
        IsClassicDiamondRegular: GSFItem.method<boolean>("get_IsClassicDiamondRegular").invoke(),
        IsClassicDiamondSmall: GSFItem.method<boolean>("get_IsClassicDiamondSmall").invoke(),
        IsClassicNoDuplicates: GSFItem.method<boolean>("get_IsClassicNoDuplicates").invoke(),
        IsClassicRegular: GSFItem.method<boolean>("get_IsClassicRegular").invoke(),
        IsClassicSmall: GSFItem.method<boolean>("get_IsClassicSmall").invoke(),
        IsCompetitionFood: GSFItem.method<boolean>("get_IsCompetitionFood").invoke(),
        IsContainer3D: GSFItem.method<boolean>("get_IsContainer3D").invoke(),
        IsHarvestable: GSFItem.method<boolean>("get_IsHarvestable").invoke(),
        IsSlag: GSFItem.method<boolean>("get_IsSlag").invoke(),
        acceptsPresentable: GSFItem.field<boolean>("acceptsPresentable").value.valueOf(),
        decayDuration: GSFItem.field<number>("decayDuration").value,
        depth: GSFItem.field<number>("depth").value,
        growthRate: GSFItem.field<number>("growthRate").value,
        height: GSFItem.field<number>("height").value,
        isPresentable: GSFItem.field<boolean>("isPresentable").value.valueOf(),
        isTradeable: GSFItem.field<boolean>("isTradeable").value.valueOf(),
        isUserSellable: GSFItem.field<boolean>("isUserSellable").value.valueOf(),
        matureDuration: GSFItem.field<number>("matureDuration").value,
        qualityIndex: GSFItem.field<number>("qualityIndex").value,
        quantity: GSFItem.field<number>("quantity").value,
        returnToDockNotAllowed: GSFItem.field<boolean>("returnToDockNotAllowed").value.valueOf(),
        sellPrice: GSFItem.field<number>("sellPrice").value,
        width: GSFItem.field<number>("width").value,
        slotIds: [],
        itemCategories: [],
        assetMap: [],
        assetPackages: [],
    }
    // dump slotids info to subobject
    const slotIds = GSFItem.field<Il2Cpp.Object>("slotIds").value
    if (!slotIds.isNull()) {
        const slotIdsLength = slotIds.method<number>("get_Count").invoke()
        for (var i = 0; i < slotIdsLength; i++) {
            GSFItemString.slotIds.push(stringify_GSFOID(slotIds.method<Il2Cpp.Object>("get_Item").invoke(i)))
        }
    }

    // dump itemcategory info to array
    const itemCategories = GSFItem.field<Il2Cpp.Object>("itemCategories").value
    if (!itemCategories.isNull()) {
        const itemCategoriesLength = itemCategories.method<number>("get_Count").invoke()
        for (var i = 0; i < itemCategoriesLength; i++) {
            GSFItemString.itemCategories.push(stringify_GSFItemCategory(itemCategories.method<Il2Cpp.Object>("get_Item").invoke(i)))
        }
    }

    // dump assetmap info to array
    // copy contained dictionary to array of dictionary's contained lists
    var assetMap = GSFItem.field<Il2Cpp.Object>("assetMap").value
    var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()
    var assetMapLength = assetMap.method<number>("get_Count").invoke()
    var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
    assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)
    // parse contained lists and push their GSFAssets
    for (var assetList of assetMapArray) {
        var assetListLength = assetList.method<number>("get_Count").invoke();
        for (let i = 0; i < assetListLength; i++) {
            GSFItemString.assetMap.push(stringify_GSFAsset(assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }

    // dump assetPackages
    var assetPackages = GSFItem.field<Il2Cpp.Object>("assetPackages").value;
    var assetPackagesLength = assetPackages.method<number>("get_Count").invoke();
    for (let i = 0; i < assetPackagesLength; i++) {
        GSFItemString.assetPackages.push(stringify_GSFAssetPackage(assetPackages.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
    }

    return GSFItemString
}

function stringify_GSFOID (GSFOID: Il2Cpp.Object, safe?: boolean) {
    const GSFOIDString: GSFOIDInterface = {
        objectClass: GSFOID.field<number>("objectClass").value,
        type: GSFOID.field<number>("type").value,
        server: GSFOID.field<number>("server").value,
        num: GSFOID.field<number>("num").value
    }
    return GSFOIDString
}

function stringify_GSFAsset (GSFAsset: Il2Cpp.Object) {
    const GSFAssetString: GSFAssetInterface = {
        resName: GSFAsset.field<Il2Cpp.String>("resName").value.toString(),
        groupName: GSFAsset.field<Il2Cpp.String>("groupName").value.toString(),
        assetTypeName: GSFAsset.field<Il2Cpp.String>("assetTypeName").value.toString(),
        cdnId: GSFAsset.field<Il2Cpp.String>("cdnId").value.toString()
    }
    return GSFAssetString
}

function stringify_GSFItemCategory (GSFItemCategory: Il2Cpp.Object) {
    const GSFItemCategoryString: GSFItemCategoryInterface = {
        name: GSFItemCategory.field<Il2Cpp.String>("name").value.toString(),
        isOutdoor: GSFItemCategory.field<boolean>("isOutdoor").value.valueOf(),
        isWalkover: GSFItemCategory.field<boolean>("isWalkover").value.valueOf(),
        parentId: GSFItemCategory.field<Il2Cpp.Object>("parentId").value.isNull() ? undefined : stringify_GSFOID(GSFItemCategory.field<Il2Cpp.Object>("parentId").value),
        showInDock: GSFItemCategory.field<boolean>("showInDock").value.valueOf(),
        ordinal: GSFItemCategory.field<number>("ordinal").value,
        ruleProperty: present(GSFItemCategory, "ruleProperty") ? stringify_GSFRuleProperty(GSFItemCategory.field<Il2Cpp.Object>("ruleProperty").value) : null,
        locked: get_stringify_boolean(GSFItemCategory, "locked"),
        isMultiplayer: get_stringify_boolean(GSFItemCategory, "isMultiplayer"),
        isPlayerHosted: get_stringify_boolean(GSFItemCategory, "isPlayerHosted"),
        isPlayedOffline: get_stringify_boolean(GSFItemCategory, "isPlayedOffline"),
        lockReasons: [],
        assetMap: [],
        assetPackages: [],
    }

    // dump lockReasons
    var lockReasons = GSFItemCategory.field<Il2Cpp.Object>("lockReasons").value;
    if (!lockReasons.isNull()) {
        var lockReasonsLength = lockReasons.method<number>("get_Count").invoke();
        for (let i = 0; i < lockReasonsLength; i++) {
            GSFItemCategoryString.lockReasons.push(lockReasons.method<Il2Cpp.String>("get_Item", 1).invoke(i).toString())
        }
    }

    // dump assetmap info to array
    // copy contained dictionary to array of dictionary's contained lists
    var assetMap = GSFItemCategory.field<Il2Cpp.Object>("assetMap").value
    if (!assetMap.isNull()) {
        var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()
        var assetMapLength = assetMap.method<number>("get_Count").invoke()
        var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
        assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)
        // parse contained lists and push their GSFAssets
        for (var assetList of assetMapArray) {
            var assetListLength = assetList.method<number>("get_Count").invoke();
            for (let i = 0; i < assetListLength; i++) {
                GSFItemCategoryString.assetMap.push(stringify_GSFAsset(assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
            }
        }
    }

    // dump assetPackages
    var assetPackages = GSFItemCategory.field<Il2Cpp.Object>("assetPackages").value;
    if (!assetPackages.isNull()) {
        var assetPackagesLength = assetPackages.method<number>("get_Count").invoke();
        for (let i = 0; i < assetPackagesLength; i++) {
            GSFItemCategoryString.assetPackages.push(stringify_GSFAssetPackage(assetPackages.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }

    return GSFItemCategoryString
}

function stringify_GSFAssetPackage (GSFAssetPackage: Il2Cpp.Object) {
    const GSFAssetPackageString: GSFAssetPackageInterface = {
        pTag: get_stringify_string(GSFAssetPackage, "pTag"),
        createDate: get_stringify_DateTime(GSFAssetPackage, "createDate"),
        assetMap: [],
        assetPackages: [],
    }

    // dump assetmap info to array
    // copy contained dictionary to array of dictionary's contained lists
    var assetMap = GSFAssetPackage.field<Il2Cpp.Object>("assetMap").value
    var assetMapValues = assetMap.method<Il2Cpp.Object>("get_Values").invoke()
    var assetMapLength = assetMap.method<number>("get_Count").invoke()
    var assetMapArray = Il2Cpp.array<Il2Cpp.Object>(List(), assetMapLength)
    assetMapValues.method<Il2Cpp.Object>("CopyTo").invoke(assetMapArray, 0)
    // parse contained lists and push their GSFAssets
    for (var assetList of assetMapArray) {
        var assetListLength = assetList.method<number>("get_Count").invoke();
        for (let i = 0; i < assetListLength; i++) {
            GSFAssetPackageString.assetMap.push(stringify_GSFAsset(assetList.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
        }
    }

    // dump assetPackages
    var assetPackages = GSFAssetPackage.field<Il2Cpp.Object>("assetPackages").value;
    var assetPackagesLength = assetPackages.method<number>("get_Count").invoke();
    for (let i = 0; i < assetPackagesLength; i++) {
        GSFAssetPackageString.assetPackages.push(stringify_GSFAssetPackage(assetPackages.method<Il2Cpp.Object>("get_Item", 1).invoke(i)))
    }

    return GSFAssetPackageString
}

function stringify_GSFRuleProperty (GSFRuleProperty: Il2Cpp.Object) {
    const GSFRulePropertyString: GSFRulePropertyInterface = {
        ID: get_stringify_GSFOID(GSFRuleProperty, "ID"),
        parentID: get_stringify_GSFOID(GSFRuleProperty, "parentID"),
        components: [],
        parentComponents: [],
        properties: new Map<string, string>(),
        childrenGroup: new Map<string, GSFRulePropertyInterface[]>(),
        lookup: new Map<string, string>(),
    }

    // components import
    var components = GSFRuleProperty.field<Il2Cpp.Object>("components").value
    var componentsLength = components.method<number>("get_Count").invoke();
    for (let i = 0; i < componentsLength; i++) {
        GSFRulePropertyString.components.push(components.method<Il2Cpp.String>("get_Item", 1).invoke(i).toString())
    }

    // parentComponents import
    var parentComponents = GSFRuleProperty.field<Il2Cpp.Object>("parentComponents").value
    var parentComponentsLength = parentComponents.method<number>("get_Count").invoke();
    for (let i = 0; i < parentComponentsLength; i++) {
        GSFRulePropertyString.parentComponents.push(parentComponents.method<Il2Cpp.String>("get_Item", 1).invoke(i).toString())
    }

    // properties import
    const properties = GSFRuleProperty.field<Il2Cpp.Object>("properties").value
    const propertiesValues = properties.field<Il2Cpp.Array<Il2Cpp.String>>("values").value;
    const propertiesKeys = properties.field<Il2Cpp.Array<Il2Cpp.String>>("keys").value;
    for (var i = 0; i < propertiesKeys.length; i++) {
        GSFRulePropertyString.properties.set(propertiesKeys.get(i).toString(), propertiesValues.get(i).toString())
    }

    // childrenGroup import
    const childrenGroup = GSFRuleProperty.field<Il2Cpp.Object>("childrenGroup").value
    const childrenGroupValues = childrenGroup.field<Il2Cpp.Array<Il2Cpp.Object>>("values").value;
    const childrenGroupKeys = childrenGroup.field<Il2Cpp.Array<Il2Cpp.String>>("keys").value;
    for (var i = 0; i < childrenGroupKeys.length; i++) {
        // extract values from valueList
        const GSFRulePropertyList = childrenGroupValues.get(i)
        const GSFRulePropertyListLength = GSFRulePropertyList.method<number>("get_Count").invoke()
        var GSFRulePropertyArray: GSFRulePropertyInterface[] = [];
        for (var i = 0; i < GSFRulePropertyListLength; i++) {
            GSFRulePropertyArray.push(stringify_GSFRuleProperty(GSFRulePropertyList.method<Il2Cpp.Object>("get_Item").invoke(i)))
        }
        GSFRulePropertyString.childrenGroup.set(childrenGroupKeys.get(i).toString(), GSFRulePropertyArray)
    }

    // lookup import
    const lookup = GSFRuleProperty.field<Il2Cpp.Object>("lookup").value
    const lookupValues = lookup.field<Il2Cpp.Array<Il2Cpp.String>>("values").value;
    const lookupKeys = lookup.field<Il2Cpp.Array<Il2Cpp.String>>("keys").value;
    for (var i = 0; i < lookupKeys.length; i++) {
        GSFRulePropertyString.lookup.set(lookupKeys.get(i).toString(), lookupValues.get(i).toString())
    }

    return GSFRulePropertyString
}

// ------- PACKET FAKING --------
// from-scratch creation of game messages. this is way harder, because we need to make sure the game keeps its
// internal state in order wrt last message sent, any outstanding queries etc.
// we also have to understand the extremely long inheritance chain involved in these messages, which sucks

function replace_GSFPlayerItem_list (GSFPlayerItemList: Il2Cpp.Object, objNumUpper: number, objNumLower: number) {
    GSFPlayerItemList.method("Clear").invoke()
    for (var i = objNumUpper; i > objNumLower; i--) {
        GSFPlayerItemList.method("Add", 1).invoke(create_GSFPlayerItem(create_GSFOID(4, 6, 0, i)))
    }
    return GSFPlayerItemList
}

function create_GSFOID (svcClass: number, objType: number, server: number, objNum: number) : Il2Cpp.Object {
    const GSFOID = AssemblyCSharp().class("GSFOID").alloc();
    GSFOID.method(".ctor", 4).invoke(svcClass, objType, server, objNum)
    return GSFOID
}

function create_GSFPlayerItem (oid: Il2Cpp.Object) {
    const GSFPlayerItem = AssemblyCSharp().class("GSFPlayerItem").alloc();
    GSFPlayerItem.method(".ctor").invoke()
    GSFPlayerItem.field<Il2Cpp.Object>("itemID").value = oid
    return GSFPlayerItem
}

function append_Il2CppObject_list (main: Il2Cpp.Object, append: Il2Cpp.Object) : Il2Cpp.Object {
    var append_count = append.method<number>("get_Count").invoke();
    for (let i = 0; i < append_count; i++) {
        var append_item = append.method<Il2Cpp.Object>("get_Item", 1).invoke(i)
        main.method("Add", 1).invoke(append_item)
    }
    return main
}

//    console.log(created_request)

    // // serialize request
    // // get protocol output
    // const GSFIProtocolOutput = AssemblyCSharp.class("GSFIProtocolOutput");
    // console.log(GSFIProtocolOutput.methods)
    // GSFIProtocolOutput.method(".cctor").implementation = function () {
    //     this.method(".cctor").invoke();
    // }
    // var output = GSFIProtocolOutput.alloc()
    // output.method(".ctor").invoke()
    // // get protocol enum
    // const ProtocolType = AssemblyCSharp.class("ProtocolType");
    // const Bit = ProtocolType.field<Il2Cpp.ValueType>("Bit").value;
    // // call serializer
    // created_request.method("SerializeMembers").invoke(Bit, output);
// }

function create_gsfgetassetsbyoidssvc_request (gsfoids_list: Il2Cpp.Object) {
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp-firstpass").image;
    const GSFGetAssetsByOIDsSvcRequest = AssemblyCSharp.class("GSFGetAssetsByOIDsSvc").nested("GSFRequest");
    const new_request = GSFGetAssetsByOIDsSvcRequest.alloc();
    new_request.method(".ctor", 1).invoke(gsfoids_list);
    return new_request;
}

// function create_GSFGetPublicItemsByOIDsSvc_request(
//     oids: Il2Cpp.Object,
//     langlocalePairID: Il2Cpp.Object,
//     tierID: Il2Cpp.Object | null,
//     birthDate: Il2Cpp.Object | null,
//     registrationDate: Il2Cpp.Object | null,
//     previewDate: Il2Cpp.Object | null,
//     isPreviewEnabled: boolean) : Il2Cpp.Object
//     {
//     const GSFGetPublicItemsByOIDsSvc_request = AssemblyCSharp().class("GSFGetPublicItemsByOIDsSvc").nested("GSFRequest").alloc()
//     GSFGetPublicItemsByOIDsSvc_request.method(".ctor", 7).invoke(oids, langlocalePairID, tierID, birthDate, registrationDate, previewDate, isPreviewEnabled)
//     return GSFGetPublicItemsByOIDsSvc_request
// }

function create_GSFGetPublicAssetsByOIDsSvc_request () {

    // needs old gsfrequestmessage logic removing

    // determine gsfoids to query
    const lowerIndex = create_GSFGetPublicAssetsByOIDsSvc_request_lasthandled
    const higherIndex = (create_GSFGetPublicAssetsByOIDsSvc_request_lasthandled += create_GSFGetPublicAssetsByOIDsSvc_request_step)

    // make list
    const listClass = List().inflate(AssemblyCSharp().class("GSFOID"))
    const gsfoidList = listClass.alloc()
    gsfoidList.method(".ctor").invoke()

    // for (var i = lowerIndex; i < higherIndex; i++) {
        // gsfoidList.method("Add", 1).invoke(create_GSFOID(gsfoidReferenceList[i][0], gsfoidReferenceList[i][1], gsfoidReferenceList[i][2], gsfoidReferenceList[i][3]))
        gsfoidList.method("Add", 1).invoke(create_GSFOID(4, 6, 0, 9618477))
        gsfoidList.method("Add", 1).invoke(create_GSFOID(4, 6, 0, 9618477))
        gsfoidList.method("Add", 1).invoke(create_GSFOID(4, 6, 0, 9618477))
        gsfoidList.method("Add", 1).invoke(create_GSFOID(4, 6, 0, 9618477))
        gsfoidList.method("Add", 1).invoke(create_GSFOID(4, 6, 0, 9618477))
    // }

    const GSFOtherPlayerDetails = AssemblyCSharp().class("GSFSession")
    Il2Cpp.gc.choose(GSFOtherPlayerDetails).forEach((instance: Il2Cpp.Object) => {
        // generate params for gsfrequestmessage
        var serviceClass = AssemblyCSharp().class("ServiceClass").field<Il2Cpp.ValueType>("UserServer").value
        var messageType = 570

        // generate request
        var GSFRequest = AssemblyCSharp().class("GSFGetPublicAssetsByOIDsSvc").nested("GSFRequest").alloc()
        var oids = gsfoidList
        var langlocalePairID = create_GSFOID(4, 19, 0, 8452423)
        var tierID = create_GSFOID(4, 38, 0, 9220128)
        const nullableDate = Il2Cpp.domain.assembly("mscorlib").image.class("System.Nullable`1").inflate(Il2Cpp.domain.assembly("mscorlib").image.class("System.DateTime"))
        var birthDate = new Il2Cpp.ValueType(Il2Cpp.alloc(nullableDate.actualInstanceSize), nullableDate.type);
        birthDate.field<boolean>("hasValue").value = false
        var registrationDate = new Il2Cpp.ValueType(Il2Cpp.alloc(nullableDate.actualInstanceSize), nullableDate.type);
        registrationDate.field<boolean>("hasValue").value = false
        var previewDate = new Il2Cpp.ValueType(Il2Cpp.alloc(nullableDate.actualInstanceSize), nullableDate.type);
        previewDate.field<boolean>("hasValue").value = false
        var isPreviewEnabled = false

        GSFRequest.method(".ctor", 7).invoke(oids, langlocalePairID, tierID, birthDate, registrationDate, previewDate, isPreviewEnabled)

        // generate gsfrequestmessage + send
        var GSFRequestMessage = AssemblyCSharp().class("GSFRequestMessage").alloc()
        GSFRequestMessage.method(".ctor", 3).invoke(serviceClass, messageType, GSFRequest)
        console.log(stringify(str_Il2Cpp_Object(GSFRequestMessage, 1)))
        instance.method("WriteMessage", 1).invoke(GSFRequestMessage)
        // console.log(instance.field<Il2Cpp.Object>("statsType").value.field<Il2Cpp.String>("v").value)
        // console.log(instance.field<Il2Cpp.Object>("level").value)
    })
}

function create_GSFGetShowcaseAvatarSvc_request() {
    const GSFGetShowcaseAvatarSvc_request = AssemblyCSharp().class("GSFGetShowcaseAvatarSvc").nested("GSFRequest")
    const GSFRequest = GSFGetShowcaseAvatarSvc_request.alloc()
    GSFRequest.method(".ctor", 1).invoke(create_GSFOID(4, 11, 2, create_GSFGetShowcaseAvatarSvc_request_lasthandled--))
    create_and_send_GSFRequestMessage(GSFRequest, 621)
}

function create_and_send_GSFRequestMessage(GSFRequest: Il2Cpp.Object, messageType: number) {
    
    // generate GSFRequestMessage
    var serviceClass = AssemblyCSharp().class("ServiceClass").field<Il2Cpp.ValueType>("UserServer").value
    var GSFRequestMessage = AssemblyCSharp().class("GSFRequestMessage").alloc()
    GSFRequestMessage.method(".ctor", 3).invoke(serviceClass, messageType, GSFRequest)
    console.log(stringify(str_Il2Cpp_Object(GSFRequestMessage, 1)))

    // send on "all channels" [always so far just one]
    const GSFSessions = AssemblyCSharp().class("GSFSession")
    Il2Cpp.gc.choose(GSFSessions)[0].method("WriteMessage", 1).invoke(GSFRequestMessage)
    console.log("message of type " + messageType + " sent...")

}

// ------ STRINGIFY2 -------
// unsatisfied with the inflexibility and verbosity of the previous interface method, this is an improved approach using runtime reflection
// to automatically generate json strings from any provided object. naturally this requires an enormous amount of edge-case handling, and
// most internal c++ structures have to be implemented by hand, AND we have to evade unity's constant self-referencing. but the end result
// is much faster and incredibly helpful.

function stringify(str: any) {
    return JSON.stringify(str, null, 4)
}

function str_field(Il2Cpp_Object: Il2Cpp.Object | Il2Cpp.Class, fieldName: string, indent: number | undefined) {
    // shorthand to quickly get stringified singletons from an object's field
    const retrievedObject = get_safe(Il2Cpp_Object, fieldName)
    return retrievedObject === null ? null : str_Il2Cpp_Singleton(retrievedObject.value,  retrievedObject.type.class, indent)
}

function get_safe(Il2Cpp_Object: Il2Cpp.Object | Il2Cpp.Class, fieldName: string) {
    // safely get Il2Cpp.Object and Il2Cpp.type of valuetype/object field from object/class. works on both dynamic and static fields
    // also convert valuetypes, maybe

    // cast object to class, or just use object if primitive
    const checker = Il2Cpp_Object instanceof Il2Cpp.Class || Il2Cpp_Object.class === undefined ? Il2Cpp_Object : Il2Cpp_Object.class
    //@ts-ignore
    const get_from: Il2Cpp.Object | Il2Cpp.Class = checker.field(fieldName).isStatic && !(Il2Cpp_Object instanceof Il2Cpp.Class) ? Il2Cpp_Object.class : Il2Cpp_Object

    // switch (get_from.field<Il2Cpp.Object>(fieldName).type.class.fullName.toString()) {
    //     case "System.Nullable`1":
    //     return get_from.field<Il2Cpp.ValueType>(fieldName).value.box();
    // default:
    //     return get_from.field<Il2Cpp.Object>(fieldName).value
    // }

    return { value: get_from.field<Il2Cpp.Object>(fieldName).value, type: get_from.field<Il2Cpp.Object>(fieldName).type }

}

function search(assembly: string, searchString: string, exclusions: string[]) {
    return Il2Cpp.domain.assembly(assembly).image.classes.filter((klass) => klass.fullName.includes(searchString) && !exclusions.includes(klass.fullName)).map((klass) => klass.fullName)
}

function hook_str(assembly: string, klasses: string[], subklasses: string[] | null, method: string, before: boolean, returned: boolean, after: boolean, params: boolean, logging_enabled: boolean) {
    const indent = logging_enabled ? 1 : undefined
    for (const klass of klasses) {
        var foundklass = ass(assembly).class(klass)
        var klassName = foundklass.fullName
        if (subklasses) {
            for (const subklass of subklasses) {
                foundklass = foundklass.nested(subklass)
                klassName += foundklass.fullName
            }
        }
        for (const foundmethod of foundklass.methods) {
            if (foundmethod.name == method) {
                console.log("replacing " + foundmethod.name + " of " + foundklass.name)
                //@ts-ignore
                foundmethod.implementation = function (...args : Il2Cpp.Object[]) {
                    log_num += 1
                    const printNum = log_num.toString().padStart(6, "0")
                    const printClass = klassName
                    const printMethod = foundmethod.name
                    const paramCount = foundmethod.parameterCount
                    const className = this instanceof Il2Cpp.Class ? this.fullName : this instanceof Il2Cpp.Object ? this.class.fullName : this.type.class.fullName
                    console.log("\n")
                    console.log("------- " + printClass + " [" + printMethod + "] -------")
                    if (params) {
                        console.log("logging params...")
                        args.forEach((arg, index) => {
                            console.log("arg " + (index + 1) + "/" + args.length + " of type " + ((arg.class == null) ? "<unknown>" : arg.class.fullName))
                            const output = stringify(str_Il2Cpp_Singleton(arg, arg.class, indent)) 
                            console.log(output)
                            write_log(printNum + " " + className + "/" + printMethod + "_param" + index + ".json", output)
                        })
                    }
                    if (before) {
                        console.log("logging before...")
                        const output = stringify(str_Il2Cpp_Object(this, indent))
                        console.log(output)
                        write_log(printNum + " " + className + "/" + printMethod + "_before.json", output)
                    }
                    const foundreturned = this.method<Il2Cpp.Object>(method, paramCount).invoke(...args);
                    if (returned) {
                        if (foundreturned != null) {
                            console.log("logging returned...")
                            const output = stringify(str_Il2Cpp_Object(foundreturned, indent))
                            console.log(output)
                            write_log(printNum + " " + className + "/" + printMethod + "_returned.json", output)
                        } else {
                            console.log("returned null, skipping returned")
                        }
                    }
                    if (after) {
                        console.log("logging after...")
                        const output = stringify(str_Il2Cpp_Object(this, indent))
                        console.log(output)
                        write_log(printNum + " " + className + "/" + printMethod + "_after.json", output)
                    }
                    console.log("------- " + printClass + " [" + printMethod + "] -------")
                }
            }
        };  
    } 
}

function test_str() {
    const GetPublicItemsByOIDs_response_des = AssemblyCSharp().class("GSFGetPublicItemsByOIDsSvc").nested("GSFResponse").method("DeserializeMembers");
    //@ts-ignore
    GetPublicItemsByOIDs_response_des.implementation = function (
        protocol: Il2Cpp.Object,
        input: Il2Cpp.Object
    ) {
        console.log("\n")
        console.log("------- GetPublicItemsByOIDs [response, des] -------")
        this.method("DeserializeMembers").invoke(protocol, input);
        console.log(JSON.stringify(str_Il2Cpp_Object(this), null, 4))
        console.log("------- GetPublicItemsByOIDs [response, des] -------")
    };   
}

function log_indented(message: string, indent: number | null | undefined) {
    if (indent) { console.log("  ".repeat(indent) + message)}
}

// function get_Il2Cpp_Field(Il2Cpp_Object: Il2Cpp.Object, Il2Cpp_Field: Il2Cpp.Field) {
//     // check field type, splitting on generics to find iterables
//     switch (Il2Cpp_Field.type.name.split("<", 1)[0]) {
//         case "System.Boolean":
//             return Il2Cpp_Object.field<boolean>(Il2Cpp_Field.name).value
//         case "System.String":
//             return Il2Cpp_Object.field<Il2Cpp.String>(Il2Cpp_Field.name).value
//         case "System.Int16":
//         case "System.Int32":
//         case "System.Int64":
//             return Il2Cpp_Object.field<number>(Il2Cpp_Field.name).value
//         default:
//             return Il2Cpp_Object.field<Il2Cpp.Object>(Il2Cpp_Field.name).value
//     }
// }


// function get_Il2Cpp_Object(Il2Cpp_Object: Il2Cpp.Object | Il2Cpp.Class, field: Il2Cpp.Field) {
//     // drop field value to object, boxing any valuetypes in the process
//     // if valuetypes were retrieved directly/generically as objects, we would not be able to retrieve their fields or methods

//     const fieldType = field.type.class.name
//     switch (fieldType) {
//         case "System.Nullable":
//             return Il2Cpp_Object.field<Il2Cpp.ValueType>(field.name).value.box();
//         default:
//             return Il2Cpp_Object.field<Il2Cpp.Object>(field.name).value
//     }
// }

function str_Il2Cpp_Singleton(Il2Cpp_Singleton: Il2Cpp.Object, Il2Cpp_SingletonClass: Il2Cpp.Class | null, indent?: number): any {
    if (Il2Cpp_SingletonClass == null) {return '<errorSingleton: singletonClass of ' + Il2Cpp_Singleton + ' was null>'}

    // handle single object. the core trunk of the recursion of this method
    // add cases here for new objects as you find errors and exceptions in the generic stringifying

    // handle primitives first, due to different null function
    if (Il2Cpp_Singleton == null) { return null }
    // check field type, splitting on generics to find iterables
    switch (Il2Cpp_SingletonClass.fullName.toString()) {
        case "System.Boolean":
            log_indented("handling as boolean", indent)
            return Il2Cpp_Singleton.valueOf()
        case "System.String":
        case "System.Char":
            log_indented("handling as string", indent)
            return Il2Cpp_Singleton.toString()
        case "System.IntPtr":
        case "System.Bit":
        case "System.Byte":
        case "System.Int16":
        case "System.Int32":
        case "System.Int64":
        case "System.Single":
        case "System.Double":
        case "System.Float":
            log_indented("handling as number", indent)
            return Il2Cpp_Singleton as unknown as number
        case "System.IO.MemoryStream":
        case "System.IO.BinaryWriter":
        case "System.IO.BinaryReader":
        case "System.IO.Stream":
        case "GSFSession":
        case "SessionManager":
        case "SessionContext":
        case "IPetBehaviour":
        case "GSFEncryptedString":
            // currently unsupported types. break here with null to prevent crashes
            return UNSUPPORTED + Il2Cpp_SingletonClass.fullName.toString()
        default:
    }

    // return null objects as null
    if (Il2Cpp_Singleton.isNull()) { return null }

    // handle arrays
    if (Il2Cpp_Singleton.constructor.name == "Array") {
        log_indented("handling as array", indent)
        //@ts-ignore
        return str_Array(Il2Cpp_Singleton, indent ? indent + 1 : undefined)
    }

    // handle enums
    if (Il2Cpp_SingletonClass.isEnum) {
        log_indented("handling as enum", indent)
        return str_Il2Cpp_Singleton(Il2Cpp_Singleton.field<Il2Cpp.Object>("value__").value, Il2Cpp_Singleton.field<Il2Cpp.Object>("value__").value.class, indent ? indent : undefined)
    }

    // handle objects second
    switch (Il2Cpp_SingletonClass.fullName.toString().split("`",1)[0]) {
        case "GSFOID":
            log_indented("handling as GSFOID", indent)
            return str_GSFOID(Il2Cpp_Singleton)
        case "GSFPlayerMaze":
            log_indented("handling as GSFPlayerMaze", indent)
            return str_GSFPlayerMaze(Il2Cpp_Singleton, indent)
        case "UnityEngine.Vector3":
            log_indented("handling as Vector3", indent)
            return str_UnityEngine_Vector3(Il2Cpp_Singleton, indent)
        case "UnityEngine.Quaternion":
            log_indented("handling as Quaternion", indent)
            return str_UnityEngine_Quaternion(Il2Cpp_Singleton, indent)
        case "System.TimeSpan":
            log_indented("handling as TimeSpan", indent)
            //@ts-ignore
            return str_System_TimeSpan(Il2Cpp_Singleton)
        case "System.DateTime":
            log_indented("handling as DateTime", indent)
            //@ts-ignore
            return str_System_DateTime(Il2Cpp_Singleton)
        case "System.Collections.Generic.List":
            log_indented("handling as list", indent)
            return str_Systems_Collections_Generic_List(Il2Cpp_Singleton, indent)
        case "System.Collections.Generic.Dictionary":
            log_indented("handling as dict", indent)
            return str_Systems_Collections_Generic_Dictionary(Il2Cpp_Singleton, indent)
        case "System.Nullable":
            log_indented("handling as nullable", indent)
            return Il2Cpp_Singleton.method<boolean>("get_HasValue").invoke() ? str_Il2Cpp_Singleton(Il2Cpp_Singleton.method<Il2Cpp.Object>("get_Value").invoke(), Il2Cpp_SingletonClass.generics[0], indent ? indent + 1 : undefined) : null
        case "System.Type":
            log_indented("handling as System.Type", indent)
            return Il2Cpp_Singleton.toString()
        case "System.Delegate":
        case "CallbackDelegate":
        case "System.EventHandler":
        case "System.Action":
            return str_System_Delegate(Il2Cpp_Singleton, indent)
        case "ISessionManager":
            return str_ISessionManager(Il2Cpp_Singleton, indent)
        default:
            log_indented("fallback, handling as generic object...", indent)
            return str_Il2Cpp_Object(Il2Cpp_Singleton, indent ? indent + 1 : undefined)
    }
}

function str_Il2Cpp_Object(Il2Cpp_ObjectRaw: Il2Cpp.Object | Il2Cpp.Class | Il2Cpp.ValueType, indent?: number, template?: Object) {
    if (Il2Cpp_ObjectRaw.isNull()) {return '<errorObject: object was null>'}

    // check type of incoming object and reduce to object or class
    // using new variable for object to shut compiler up
    var Il2Cpp_Object: Il2Cpp.Object | Il2Cpp.Class
    let Il2Cpp_ObjectClasses: Il2Cpp.Class[] = []
    switch (Il2Cpp_ObjectRaw.constructor.name){
        case "Object":
        default:
            //@ts-ignore
            Il2Cpp_Object = Il2Cpp_ObjectRaw
            //@ts-ignore
            Il2Cpp_ObjectClasses = [Il2Cpp_Object.class]
            break
        case "Class":
            //@ts-ignore
            Il2Cpp_Object = Il2Cpp_ObjectRaw
            //@ts-ignore
            Il2Cpp_ObjectClasses = [Il2Cpp_Object]
            break
        case "ValueType":
            //@ts-ignore
            Il2Cpp_Object = Il2Cpp_ObjectRaw.box()
            //@ts-ignore
            Il2Cpp_ObjectClasses = [Il2Cpp_Object.class]
            break
    }

    // push inherited classes to classes
    while (Il2Cpp_ObjectClasses[Il2Cpp_ObjectClasses.length-1].parent != null) {
        //@ts-ignore
        Il2Cpp_ObjectClasses.push(Il2Cpp_ObjectClasses[Il2Cpp_ObjectClasses.length-1].parent)
    }
    
    // iterate fields and stringify
    var Il2Cpp_ObjectString: Record<string,any> = {}
    if (template) {Il2Cpp_ObjectString = template}
    log_indented("iterating object: " + Il2Cpp_Object.toString(), indent)
    Il2Cpp_ObjectClasses.forEach((klass) => {
        klass.fields.forEach((field) => {
            log_indented("field " + field.name + " of type " + field.type + ":", indent)
            // skip backing fields, auto-generated fields that infinitely recurse
            if (template && Object.keys(template).includes(field.name)) {
                log_indented("found in template, skipped", indent)
            } else if (field.name.includes("__BackingField")) {
                log_indented("backing field, skipped", indent)
            } else if (field.isStatic) {
                log_indented("static, skipped", indent)
            } else {
                Il2Cpp_ObjectString[field.name] = str_field(Il2Cpp_Object, field.name, indent ? indent + 1 : indent)
            }
        })
    })

    return Il2Cpp_ObjectString
}

function str_Array(Il2Cpp_Array: Il2Cpp.Array<Il2Cpp.Object>, indent?: number) {
    var Il2Cpp_ArrayString = []
    for (const singleton of Il2Cpp_Array) {
        Il2Cpp_ArrayString.push(str_Il2Cpp_Singleton(singleton, Il2Cpp_Array.elementType.class, indent))
    } 
    return Il2Cpp_ArrayString
}

function str_Systems_Collections_Generic_List(Il2Cpp_List: Il2Cpp.Object, indent?: number) {
    if (Il2Cpp_List.isNull()) {return null}
    var Il2Cpp_ListString: any[] = []

    // iterate list and stringify
    var Il2Cpp_ListLength = Il2Cpp_List.method<number>("get_Count").invoke();
    for (let i = 0; i < Il2Cpp_ListLength; i++) {
        // TODO: we fucked up this line, no longer handles valuetypes
        Il2Cpp_ListString.push(str_Il2Cpp_Singleton(Il2Cpp_List.method<Il2Cpp.Object>("get_Item", 1).invoke(i), Il2Cpp_List.class.generics[0], indent))
    }

    return Il2Cpp_ListString
}

function str_Systems_Collections_Generic_Dictionary(Il2Cpp_Dictionary: Il2Cpp.Object, indent?: number) {
    if (Il2Cpp_Dictionary.isNull()) {return null}
    // if empty return empty object
    const Il2Cpp_DictionaryLength = Il2Cpp_Dictionary.method<number>("get_Count").invoke()
    if (Il2Cpp_DictionaryLength == 0) {return {}}

    const Il2Cpp_DictionaryKeys = Il2Cpp.array<any>(Il2Cpp_Dictionary.class.generics[0], Il2Cpp_DictionaryLength)
    const Il2Cpp_DictionaryValues = Il2Cpp.array<any>(Il2Cpp_Dictionary.class.generics[1], Il2Cpp_DictionaryLength)

    Il2Cpp_Dictionary.method<Il2Cpp.Object>("get_Keys").invoke().method("CopyTo").invoke(Il2Cpp_DictionaryKeys, 0)
    Il2Cpp_Dictionary.method<Il2Cpp.Object>("get_Values").invoke().method("CopyTo").invoke(Il2Cpp_DictionaryValues, 0)

    // stringify as object if keys can be safely defined as strings.
    // else stringify as map
    var Il2Cpp_DictionaryParsedKeys = [], Il2Cpp_DictionaryString
    for (const Il2Cpp_DictionaryKey of Il2Cpp_DictionaryKeys) {
        Il2Cpp_DictionaryParsedKeys.push(str_Il2Cpp_Singleton(Il2Cpp_DictionaryKey, Il2Cpp_Dictionary.class.generics[0], indent))
    }
    if (["String", "number", "boolean"].includes(Il2Cpp_DictionaryParsedKeys[0].constructor.name)) {
        Il2Cpp_DictionaryString = {}
        for (var i = 0; i < Il2Cpp_DictionaryLength; i++) {
            //@ts-ignore
            Il2Cpp_DictionaryString[Il2Cpp_DictionaryParsedKeys[i]] = str_Il2Cpp_Singleton(Il2Cpp_DictionaryValues.get(i), Il2Cpp_Dictionary.class.generics[1], indent)
        }
    } else {
        Il2Cpp_DictionaryString = []
        for (var i = 0; i < Il2Cpp_DictionaryLength; i++) {
            Il2Cpp_DictionaryString.push({
                key: Il2Cpp_DictionaryParsedKeys[i],
                value: str_Il2Cpp_Singleton(Il2Cpp_DictionaryValues.get(i), Il2Cpp_Dictionary.class.generics[1], indent),
            })
        }
    }

    return Il2Cpp_DictionaryString
}

function str_GSFOID(GSFOID: Il2Cpp.Object) {
    return {
        objectClass: GSFOID.field<number>("objectClass").value,
        type: GSFOID.field<number>("type").value,
        server: GSFOID.field<number>("server").value,
        num: GSFOID.field<number>("num").value
    }
}

function str_GSFPlayerMaze(GSFPlayerMaze: Il2Cpp.Object, indent: number | undefined) {
    str_Il2Cpp_Object(GSFPlayerMaze, indent,
        {
            parent: UNSUPPORTED
        }
    ) 
}

function str_UnityEngine_Vector3(UnityEngine_Vector3: Il2Cpp.Object, indent: number | undefined) {
    return {
        x: str_field(UnityEngine_Vector3, "x", indent),
        y: str_field(UnityEngine_Vector3, "y", indent),
        z: str_field(UnityEngine_Vector3, "z", indent)
    }
}

function str_UnityEngine_Quaternion(UnityEngine_Quaternion: Il2Cpp.Object, indent: number | undefined) {
    return {
        x: str_field(UnityEngine_Quaternion, "x", indent),
        y: str_field(UnityEngine_Quaternion, "y", indent),
        z: str_field(UnityEngine_Quaternion, "z", indent),
        w: str_field(UnityEngine_Quaternion, "w", indent),
    }
}

function str_System_TimeSpan(System_TimeSpan: Il2Cpp.ValueType) {
    // https://stackoverflow.com/questions/2906022/timespan-to-iso8601-duration-format-string
    return Il2Cpp.domain.assembly("System.Xml").image.class("System.Xml.XmlConvert").method<Il2Cpp.String>("ToString", 1).overload("System.TimeSpan").invoke(System_TimeSpan)
}

function str_System_DateTime(System_DateTime: Il2Cpp.ValueType) {
    return System_DateTime.method<Il2Cpp.String>("ToString", 1).invoke(Il2Cpp.string("o"))
}

function str_System_Delegate(System_Delegate: Il2Cpp.Object, indent: number | undefined) {
    str_Il2Cpp_Object(System_Delegate, indent,
        {
            m_target: System_Delegate.tryField<Il2Cpp.Object>("m_target")?.value === null ? System_Delegate.field<Il2Cpp.Object>("m_target").value.class.fullName + ", ToString: " + System_Delegate.field<Il2Cpp.Object>("m_target").value.toString() : null
        }
    )
}

function str_ISessionManager(ISessionManager: Il2Cpp.Object, indent: number | undefined) {
    str_Il2Cpp_Object(ISessionManager, indent,
        {
            mUserSession: UNSUPPORTED,
            mSyncSession: UNSUPPORTED
        }
    )
}

// ------- PERFORM -------
// this acts as a real-time playground for functions, since frida automatically updates what happens here
// if you change it. thus it's a dumping ground of trace functions, functions to be uncommented once a
// certain screen is reached, etc.

Il2Cpp.perform(function() {

    // found:
    // gsfbitstream: handles object -> bitstream conversion

    const filtered_class_names = ["gsfbitstream",
    "gsftextutils", 
    "gstbitprotocolcodec", 
    "kinztime", 
    "bitinput", 
    "intmodexs", 
    "gsfsession", 
    "gsfwebsocket",
    "resultcode"
]

    // DISABLE PLAYER TIMEOUT
    modify_GSFHeartbeatSvc_request_ctor();

    // Il2Cpp.trace(true)
    // .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
    // .filterClasses(klass => klass.fullName.toString().toLowerCase().includes("interactiveobject") && !filtered_class_names.includes(klass.name.toString().toLowerCase()))
    // .and()
    // .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
    // .filterMethods(klass => klass.name.toString().toLowerCase().includes("interactiveobject") && !filtered_class_names.includes(klass.name.toString().toLowerCase()))
    // .and()
    // .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
    // .filterParameters(klass => klass.type.class.fullName.toString().toLowerCase().includes("interactiveobject") || klass.name.toLowerCase().toString().includes("interactiveobject"))
    // .and()
    // .attach();

    // Il2Cpp.backtrace()
    // .classes(AssemblyCSharp_reg().class("MountPlayer"))
    // .and()
    // .attach();

    // hook_str("Assembly-CSharp", ["ContainerController"], [], "Initialize", true, true, true, true, false)
    // hook_str("Assembly-CSharp-firstpass", ["GSFPlayerItem"], [], "DeserializeMembers", false, false, true, false, false)
    // hook_str("Assembly-CSharp-firstpass", ["GSFItem"], [], ".ctor", false, false, true, false, false)

    // hook_str("Assembly-CSharp", ["PetBaseController"], null, "ConsumeFoodItem", true, true, true, true, false)
    // hook_str("Assembly-CSharp-firstpass", ["DockServices"], null, "FullDecayInventoryItem", true, true, true, true, false)
    // hook_str("Assembly-CSharp-firstpass", ["DockServices"], null, "OnFullDecayInventoryItemHandler", true, true, true, true, false)

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFChangePlayerStatNotify"], 
    // ["GSFRequest"], 
    // "DeserializeMembers", false, false, true, false, false);

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFAddEventSvc"], 
    // ["GSFRequest"], 
    // ".ctor", false, false, true, false, false);
    
    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFAddEventSvc",], 
    // ["GSFResponse"], 
    // "DeserializeMembers", false, false, true, false, false);

    // hook_str("Assembly-CSharp-firstpass", 
    // ["ShopServices"], 
    // [], 
    // "GetStoreItemByStoreItemId", false, true, false, false, false);

    // modify_GetAssetsByOIDs_request_ctor();

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFStoreItem"], 
    // [], 
    // "DeserializeMembers", false, false, true, false, false);


    // const GSFOtherPlayerDetails = AssemblyCSharp().class("ShopServices")
    // Il2Cpp.gc.choose(GSFOtherPlayerDetails).forEach((instance: Il2Cpp.Object) => {
    //     console.log(instance)
    //     var newvar = instance.method<Il2Cpp.Object>("GetStoreItemByStoreItemId", 1).invoke(create_GSFOID(4, 73, 0, 9618837))
    //     console.log(newvar.class)
    //     wait(5000)
    //     console.log(newvar.method<number>("get_Count").invoke())
    //     // console.log(instance.field<Il2Cpp.Object>("statsType").value.field<Il2Cpp.String>("v").value)
    //     // console.log(instance.field<Il2Cpp.Object>("level").value)
    // })

    hook_str("Assembly-CSharp-firstpass", 
    ["GSFResponseMessage"], 
    [], 
    "DeserializeMembers", false, true, true, false, false);

    hook_str("Assembly-CSharp-firstpass", 
    ["GSFRequestMessage"], 
    [], 
    ".ctor", false, true, true, false, false);

    // modify_WowGameController_ctor();

    // hook_str("Assembly-CSharp", 
    // ["Game.WheelOfWow.WowGameController"], 
    // [], 
    // ".ctor", false, false, true, false, false);

    // console.log(Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Material").methods)

    // hook_str("UnityEngine.CoreModule", 
    // ["UnityEngine.ResourcesAPI"], 
    // [], 
    // "FindShaderByName", false, true, false, false, false);

    // hook_str("Assembly-CSharp-firstpass", 
    // search("Assembly-CSharp-firstpass", "GSF", filtered_class_names), 
    // [], 
    // ".ctor", false, false, true, false, false);

    // Il2Cpp.trace(true)
    // // .assemblies(Il2Cpp.domain.assembly("UnityEngine.CoreModule"))
    // // .filterClasses(klass => klass.fullName.toString().includes("GSFChangePlayerStatNotify") || klass.isSubclassOf(AssemblyCSharp().class("GSFChangePlayerStatNotify"), true))
    // // .and()
    // .assemblies(Il2Cpp.domain.assembly("UnityEngine.CoreModule"))
    // .filterClasses(klass => klass.fullName.toString().toLowerCase().includes("shader") && !filtered_class_names.includes(klass.name.toString().toLowerCase()))
    // .and()
    // .assemblies(Il2Cpp.domain.assembly("UnityEngine.CoreModule"))
    // .filterMethods(klass => klass.name.toString().toLowerCase().includes("shader") && !filtered_class_names.includes(klass.name.toString().toLowerCase()))
    // .and()
    // .assemblies(Il2Cpp.domain.assembly("UnityEngine.CoreModule"))
    // .filterParameters(klass => klass.type.class.fullName.toString().toLowerCase().includes("shader") || klass.name.toLowerCase().toString().includes("shader"))
    // .and()
    // .attach();

    // -------- COMPLETED TASKS --------
    // the various things that this file is able to achieve within webkinz
    
    // ENABLES CAPTURING OF ITEMS
    // modify_GSFGetPublicItemsByOIDsSvc_ctor();
    // log_GetPublicItemsByOIDs_response_des();

    // ENABLES CAPTURING OF AVATARACCENTS
    // modify_GSFGetPublicAvatarAccentsByOIDsSvc_ctor();
    // log_GSFGetPublicAvatarAccentsByOIDsSvc_response_des(true)

    // ENABLES CAPTURING OF SHOWCASEAVATARS
    // modify_GSFGetShowcaseAvatarsSvc_ctor(8, 250);
    // log_GSFGetShowcaseAvatarsSvc_response_des();

    // LOG LOGGER
    // Il2Cpp.trace(true)
    // .assemblies(Il2Cpp.domain.assembly("UnityEngine.CoreModule"))
    // .filterMethods(klass => klass.name.toLowerCase().includes("log"))
    // .and()
    // .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp-firstpass"))
    // .filterMethods(klass => klass.name.toLowerCase().includes("log"))
    // .and()
    // .attach();

    // ENABLES CAPTURING/CREATION OF SHOWCASEAVATAR

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFGetShowcaseAvatarSvc"], 
    // ["GSFResponse"], 
    // "DeserializeMembers", false, false, true, false, false);

    // setInterval(create_GSFGetShowcaseAvatarSvc_request, 7500);

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFGetAssetsByOIDsSvc"], 
    // ["GSFResponse"], 
    // ".ctor", false, false, true, false, false);

    // hook_str("Assembly-CSharp-firstpass", 
    // ["GSFSession"], 
    // [], 
    // "WriteMessage", false, false, false, true, false);

    // const GSFOtherPlayerDetails = AssemblyCSharp().class("GSFSession")
    // Il2Cpp.gc.choose(GSFOtherPlayerDetails).forEach((instance: Il2Cpp.Object) => {
    //     var serviceClass = AssemblyCSharp().class("ServiceClass").field<Il2Cpp.ValueType>("UserServer").value
    //     var messageType = 179
    //     console.log("okay")
    //     var GSFRequest = AssemblyCSharp().class("GSFGetAssetsByOIDsSvc").nested("GSFRequest").alloc()
    //     var gsfoidlist = List().inflate(AssemblyCSharp().class("GSFOID")).alloc()
    //     gsfoidlist.method(".ctor").invoke()
    //     gsfoidlist.method("Add", 1).invoke(create_GSFOID(4, 60, 0, 4677291))
    //     gsfoidlist.method("Add", 1).invoke(create_GSFOID(4, 60, 0, 4677291))
    //     gsfoidlist.method("Add", 1).invoke(create_GSFOID(4, 60, 0, 4677291))
    //     GSFRequest.method(".ctor", 1).invoke(gsfoidlist)
    //     var GSFRequestMessage = AssemblyCSharp().class("GSFRequestMessage").alloc()
    //     GSFRequestMessage.method(".ctor", 3).invoke(serviceClass, messageType, GSFRequest)
    //     console.log(stringify(str_Il2Cpp_Object(GSFRequestMessage, 1)))
    //     instance.method("WriteMessage", 1).invoke(GSFRequestMessage)
    //     // console.log(instance.field<Il2Cpp.Object>("statsType").value.field<Il2Cpp.String>("v").value)
    //     // console.log(instance.field<Il2Cpp.Object>("level").value)
    // })

    console.log("reset successful")
})
