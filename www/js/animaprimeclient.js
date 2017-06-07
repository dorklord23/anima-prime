"use strict";

/* DEPENDENCIES:
 *
 * JQUERY 2.1.4
 * JQUERY MOBILE 1.4.5
 * SOCKET.IO 1.3.7
 */

var serverAddress = "http://localhost:8081",
    socket = io(serverAddress),

    /*maneuverRoll = {},
    strikeRoll = {},
    achievementRoll = {},*/

    localCharacter = {},

    characterTemplate = {
        "name" : "Gabriella",
        "passion" : "",
        "traits" : ["Sarcastic", "Cheerful", "Reckless"],
        "age" : 22,
        "background" : "Asli Pontianak",
        "soulboundWeapons" : [""],
        "eidolons" : [""],

        "skills" : [
            {"name" : "Firearms", "rating" : 4, "marked" : false},
            {"name" : "Acrobatics", "rating" : 3, "marked" : false},
            {"name" : "Skill 3", "rating" : 2, "marked" : false}
        ],

        "powers" : [""],
        "conditions" : [""],
        "immunities" : [""]
    };

// TODO : Differentiate initializing the character and refreshing/reloading it
function loadCharacter(sentData, pageName, operationType) {
    socket.emit("loadCharacter", sentData, function(characterFromServer) {
        var interfaceMethods = {
            "defense" : {"total" : function(strikeElement) {
                var total = characterFromServer.defense.normal + characterFromServer.defense.elemental[strikeElement];
                return total;
            }},

            "currentlyEquippedSoulboundWeapon" : function() {
                for (var sWeapon of characterFromServer.soulboundWeapons) {
                    if (soulboundWeaponList[sWeapon].isEquipped &&
                        soulboundWeaponList[sWeapon].owner === characterFromServer.name ) {
                        return sWeapon;
                    };
                };
            },

            "diceRolls" :{
                "maneuverResult" : {},
                "maneuver" : function(skillUsed, actionPoolDices) {
                    var sentData = {"characterName" : characterFromServer.name, "skillUsed" : skillUsed, "actionPoolDices" : actionPoolDices};

                    socket.emit("maneuverRoll", sentData, function(rollResultFromServer) {
                        console.log("rollResultFromServer : %o", rollResultFromServer);
                        interfaceMethods.diceRolls.maneuverResult = rollResultFromServer;
                        $.extend(localCharacter, interfaceMethods);
                        page.show("maneuver", localCharacter);
                        console.log("localCharacter : %o", localCharacter);
                    });
                },

                "strikeResult" : {},
                "strike" : function(target, strikePoolDices) {
                    var sentData = {"characterName" : characterFromServer.name, "target" : target, "strikePoolDices" : strikePoolDices};

                    socket.emit("strikeRoll", sentData, function(rollResultFromServer) {
                        console.log("rollResultFromServer : %o", rollResultFromServer);
                        interfaceMethods.diceRolls.strikeResult = rollResultFromServer;
                        $.extend(localCharacter, interfaceMethods);
                        page.show("strike", localCharacter);
                        console.log("localCharacter : %o", localCharacter);
                    });
                },

                "achievementResult" : {},
                "achievement" : function(skillUsed, strikePoolDices) {

                }
            }
        };

        localCharacter =  $.extend({}, characterFromServer, interfaceMethods);

        //Only uncomment this for debugging
        //console.log(dataFromServer);

        page[operationType](pageName, localCharacter);
    });
};

/*
loadCharacter(function(localCharacter) {
    // Do something with localCharacter
});
*/

function totalValue(selector) {
    var total = 0,
        stringToInt = 0;

    $(selector).each(function(index) {
        //console.log( $(this).attr("id") + " index " + index + " " + $(this).val() );
        stringToInt = isNaN( parseInt( $(this).val() ) ) ? 0 : parseInt( $(this).val() );
        total += stringToInt;
    });

    return total;
}

var page = {
    "update" : function(pageName, sourceCharacter) {
        $('[id]').each(function(){
            var id = $('[id="' + this.id + '"]');
            if(id.length > 1 && id[0] === this) {
                console.log('Duplicate id ' + this.id);
                alert('duplicate found\nCheck console');
            }
        });

        var skillSelection = "";

        switch (pageName) {
            case "conflict":
                // CONFLICT PAGE //
                if  ( true/*this.myTurn*/ ) {
                    $("#gamepad a").removeClass("ui-state-disabled");
                }
                else {
                    $("#gamepad a").addClass("ui-state-disabled");
                }

                $("#current_wound").html(sourceCharacter.wounds.currentNumber);
                $("#max_wound").html(sourceCharacter.wounds.maxNumber);

                $("#current_token").html(sourceCharacter.awesomeTokens.currentNumber);

                $("#current_action").html(sourceCharacter.dicePools.action.currentNumber);
                $("#max_action").html(sourceCharacter.dicePools.action.maxNumber);

                $("#current_strike").html(sourceCharacter.dicePools.strike.currentNumber);

                $("#current_charge").html(sourceCharacter.dicePools.charge.currentNumber);
                $("#max_charge").html(sourceCharacter.dicePools.charge.maxNumber);
                // CONFLICT PAGE //
                break;

            case "maneuver":
                // MANEUVER DIALOG PAGE //
                $("#skill_used option").each(function(index) {
                    var availableSkills = sourceCharacter.skills[index];
                    $(this).attr("value", availableSkills.rating).html(availableSkills.name + " (" + availableSkills.rating + " dices)");
                });

                var str = "";

                for (var j = 1; j <= sourceCharacter.dicePools.action.currentNumber; j++) {
                    var dice = j > 1 ? " dices" : " dice";

                    if (j > sourceCharacter.dicePools.action.maxUsed) {
                        break;
                    }

                    str += '<option value="' + j + '">' + j + dice + '</option>';
                }

                $("#action_dice_used").html(str);
                $("#maneuver_bonus_dice_used").val(sourceCharacter.diceRolls.maneuverBonusDices);
                // MANEUVER DIALOG PAGE //
                break;

            case "strike":
                // STRIKE DIALOG PAGE //
                str = "";

                for (j = 1; j <= sourceCharacter.dicePools.strike.currentNumber; j++) {
                    dice = j > 1 ? " dices" : " dice";

                    if (j > sourceCharacter.dicePools.strike.maxUsed.forStrike) {
                        break;
                    }

                    str += '<option value="' + j + '">' + j + dice + '</option>';
                }

                $("#strike_dice_used").html(str);
                $("#strike_bonus_dice_used").val(sourceCharacter.diceRolls.strikeBonusDices.squad);
                // STRIKE DIALOG PAGE //
                break;

            case "achievement":
                // ACHIEVEMENT DIALOG PAGE //
                $("#skill_used option").each(function(index) {
                    var availableSkills = sourceCharacter.skills[index];
                    $(this).attr("value", availableSkills.rating).html(availableSkills.name + " (" + availableSkills.rating + " dices)");
                });

                str = "";

                for (j = 1; j <= sourceCharacter.dicePools.strike.currentNumber; j++) {
                    dice = j > 1 ? " dices" : " dice";

                    if (j > sourceCharacter.dicePools.strike.maxUsed.forAchievement) {
                        break;
                    }

                    str += '<option value="' + j + '">' + j + dice + '</option>';
                }

                $("#strike_dice_used_for_achievement").html(str);
                $("#achievement_bonus_dice_used").val(sourceCharacter.diceRolls.achievementBonusDices);
                // ACHIEVEMENT DIALOG PAGE //
                break;
            }

        },

        "create" : function(pageName, sourceCharacter) {
            switch (pageName) {
            case "conflict":
            $( "body" ).on( "swiperight", function(event) {
                $("#left_button").click();
            }).on( "swipeleft", function(event) {
                $("#right_button").click();
            });

            $("#maneuver_button").click(function() {
                if (sourceCharacter.dicePools.action.currentNumber < 1) {
                    alert("You have no action dices");
                    return false;
                }
                //character.myTurn = false;
            });

            $("#strike_button").click(function() {
                if (sourceCharacter.dicePools.strike.currentNumber < 1) {
                    alert("You have no strike dices");
                    return false;
                }
                //character.myTurn = false;
            });

            $("#achievement_button").click(function() {
                if (sourceCharacter.dicePools.strike.currentNumber < 1) {
                    alert("You have no strike dices");
                    return false;
                }
                //character.myTurn = false;
            });

            // IF YOU HAVE NO CHARGE DICES, THE CHARGE POWERS ARE DISABLED,
            // BUT YOU COULD STILL SEE THE LIST

            $("#catching_your_breath_button").click(function() {
                var diceAmountDifference = sourceCharacter.dicePools.action.maxNumber - sourceCharacter.dicePools.action.currentNumber;

                switch (diceAmountDifference) {
                    case 0:
                        alert("You have reached action dice maximum limit");
                        return false;
                        break;
                    case 1:
                        sourceCharacter.dicePools.action.currentNumber++;
                        break;
                    default:
                        sourceCharacter.dicePools.action.currentNumber += 2;
                }
                //character.myTurn = false;
                page.update(pageName, sourceCharacter);
                //loadCharacter(characterName);
            });
            break;

            case "maneuver":
            //RESETTING DEFAULT SELECTED VALUE FOR <select class="form-elements"> ELEMENTS
            $("select.form-elements").val("");

            $(".form-elements").change(function() {
                $("#total_dice_used").html( totalValue(".form-elements") );
            });

            $("#calculate_maneuver").click(function() {
                //alert($("#skill_used").val());return false;
                switch ( $("#skill_used").val()  ) {
                    case "4":
                        var index = 0;
                        break;
                    case "3":
                        var index = 1;
                        break;
                    case "2":
                        var index = 2;
                        break;
                    default:
                        alert('Have you chose a skill yet?');
                        return false;
                }

                var skillUsed = sourceCharacter.skills[index],
                    actionPoolDices = isNaN( parseInt( $("#action_dice_used").val() ) ) ? 0 : parseInt( $("#action_dice_used").val() );
                    //bonusDices = isNaN( parseInt( $("#maneuver_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#maneuver_bonus_dice_used").val() );

                /*maneuverRoll = */sourceCharacter.diceRolls.maneuver(skillUsed, actionPoolDices/*, bonusDices*/);
                //console.log(maneuverRoll);
            });
            break;

            case "strike":
                // parseInt("") returns NaN

                //RESETTING DEFAULT SELECTED VALUE FOR <select class="form-elements"> ELEMENTS
                $("select.form-elements").val("");

                $(".form-elements").change(function() {
                    $("#total_dice_used").html( totalValue(".form-elements") );
                });

                $("#calculate_strike").click(function() {
                    var strikePoolDices = isNaN( parseInt( $("#strike_dice_used").val() ) ) ? 0 : parseInt( $("#strike_dice_used").val() );
                    //bonusDices = isNaN( parseInt( $("#strike_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#strike_bonus_dice_used").val() );

                    strikeRoll = sourceCharacter.diceRolls.strike(enemy, strikePoolDices);
                });
                break;

            case "achievement":
                // parseInt("") returns NaN

                //RESETTING DEFAULT SELECTED VALUE FOR <select class="form-elements"> ELEMENTS
                $("select.form-elements").val("");

                $(".form-elements").change(function() {
                    $("#total_dice_used").html( totalValue(".form-elements") );
                });

                $("#calculate_achievement").click(function() {
                    //alert($("#skill_used").val());return false;
                    switch ( $("#skill_used").val()  ) {
                        case "4":
                            var index = 0;
                            break;
                        case "3":
                            var index = 1;
                            break;
                        case "2":
                            var index = 2;
                            break;
                        default:
                            alert('Have you chose a skill yet?');
                            return false;
                    };

                    var skillUsed = sourceCharacter.skills[index],
                        strikePoolDices = isNaN( parseInt( $("#strike_dice_used_for_achievement").val() ) ) ? 0 : parseInt( $("#strike_dice_used_for_achievement").val() );
                        //bonusDices = isNaN( parseInt( $("#achievement_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#achievement_bonus_dice_used").val() );

                    achievementRoll = sourceCharacter.diceRolls.achievement(skillUsed, strikePoolDices);
                });
                break;
            }
        },

        "show" : function(pageName, sourceCharacter) {
            switch (pageName) {
            case "conflict":
                // NOT USED
                break;
            case "maneuver":
                // SAVE THE RESULTS..
                sourceCharacter.awesomeTokens.currentNumber += sourceCharacter.diceRolls.maneuverResult.awesomeTokenEarned;
                sourceCharacter.dicePools.strike.currentNumber += sourceCharacter.diceRolls.maneuverResult.strikeDiceEarned;
                sourceCharacter.dicePools.charge.currentNumber += sourceCharacter.diceRolls.maneuverResult.chargeDiceEarned;

                if (sourceCharacter.dicePools.charge.currentNumber > sourceCharacter.dicePools.charge.maxNumber) {
                    sourceCharacter.dicePools.charge.currentNumber = sourceCharacter.dicePools.charge.maxNumber;
                }

                // THEN DISPLAY THEM
                //console.log(maneuverRoll);
                //console.log("sourceCharacter.diceRolls.maneuverResult : %o",sourceCharacter.diceRolls.maneuverResult);break;
                $("#maneuverRollResult").html( sourceCharacter.diceRolls.maneuverResult.rollResult.toString() );
                $("#strikeDiceEarned").html( sourceCharacter.diceRolls.maneuverResult.strikeDiceEarned );
                $("#chargeDiceEarned").html( sourceCharacter.diceRolls.maneuverResult.chargeDiceEarned );
                $("#awesomeTokenEarned").html( sourceCharacter.diceRolls.maneuverResult.awesomeTokenEarned );
                break;

            case "strike":
                // DISPLAY THE RESULTS
                $("#strikeRollResult").html( strikeRoll.rollResult.toString() );
                $("#successfulStrike").html( strikeRoll.successfulStrike );

                // RESETTING THE STRIKE RESULT
                strikeRoll = {};
                break;

            case "achievement":
                // DISPLAY THE RESULTS
                $("#achievementRollResult").html( achievementRoll.rollResult.toString() );
                $("#successfulAchievement").html( achievementRoll.successfulAchievement );

                // RESETTING THE ACHIEVEMENT RESULT
                achievementRoll = {};
                break;
            }
        }
};

// ====================================================================================

// EVENT LISTENERS
socket.on('connect', function() {
    console.log("Connected to %s", serverAddress);
});

socket.on('disconnect', function() {
    console.log("Disconnected from %s", serverAddress);
});

$(document).on('pagecreate', '#conflict_page', function(){
    loadCharacter(characterTemplate, "conflict", "update");
    loadCharacter(characterTemplate.name, "conflict", "create");
});

$(document).on('pageshow', '#conflict_page', function(){
    loadCharacter(characterTemplate.name, "conflict", "update");
});

$(document).on('pagecreate', '#maneuver_dialog_page', function() {
    loadCharacter(characterTemplate.name, "maneuver", "update");
    loadCharacter(characterTemplate.name, "maneuver", "create");
});

$(document).on('pageshow', '#maneuver_result_page', function() {
    loadCharacter(characterTemplate.name, "maneuver", "update");
    //loadCharacter(characterTemplate.name, "maneuver", "show");
});

$(document).on('pagecreate', '#strike_dialog_page', function() {
    loadCharacter(characterTemplate.name, "strike", "update");
    loadCharacter(characterTemplate.name, "strike", "create");
});

$(document).on('pageshow', '#strike_result_page', function() {
    loadCharacter(characterTemplate.name, "strike", "update");
    loadCharacter(characterTemplate.name, "strike", "show");
});

$(document).on('pagecreate', '#achievement_dialog_page', function(){
    loadCharacter(characterTemplate.name, "achievement", "update");
    loadCharacter(characterTemplate.name, "achievement", "create");
});

$(document).on('pageshow', '#achievement_result_page', function(){
    loadCharacter(characterTemplate.name, "achievement", "update");
    loadCharacter(characterTemplate.name, "achievement", "show");
});