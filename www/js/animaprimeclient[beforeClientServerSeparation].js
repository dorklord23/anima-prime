"use strict";

// THIS IS USING JQUERY 2.1.4 AND JQUERY MOBILE 1.4.5

function totalValue(selector) {
        var total = 0;
        var stringToInt = 0;

        $(selector).each(function(index) {
            //console.log( $(this).attr("id") + " index " + index + " " + $(this).val() );
            stringToInt = isNaN( parseInt( $(this).val() ) ) ? 0 : parseInt( $(this).val() );
            total += stringToInt;
        });

        return total;
}

var i = 0;
var j = 0;

var bonusDices = 0;
var totalDices = 0;

//var woundDealt = 0;

var dice = "";

var methodResult = {},
    maneuverRoll  = {},
    strikeRoll  = {},
    achievementRoll  = {};

var goal = {
    "name" : "",
    "difficulty" : 1,
    "achieved" : false,
    "effect" : function() {
        if ( this.achieved ) {
            //code
        }
    }
};

var soulboundWeapon = {
    "name" : "",
    "owner" : "",
    "description" : "",
    "slots" : 1,
    "equipped" : false,
    "effects" : []
};

var eidolon = {
    "name" : "",
    "level" : 0,
    "defense" : 2,
    "type" : "",
    "summoned" : false,
    "weakness" : {},

    "wounds" : {
        "maxNumber" : 1,
        "currentNumber" : 0
    },

    "dicePools" : {
        "action" : {
			//"maxUsed" : 3,
            "maxNumber" : 2,
            "currentNumber" : 0
        },
        "strike" : {
            //"maxUsed" : 6,
            "maxUsed" : { "forStrike" : 6, "forAchievement" : 4 },
			//"maxNumber" : Infinity,
            "currentNumber" : 2
        },
        "charge" : {
			//"maxUsed" : Infinity,
            "maxNumber" : 4,
            "currentNumber" : 0
        }
    },

    "skill" : {"name" : "Firearms", "rating" : 4, "marked" : false}
};

var enemy = {
    //DUMMY OBJECT AS A SURROGATE FOR THE REAL ONE VIA AJAX
    "name" : "",
    "eidolon" : false, // Whether it's an eidolon or not
    "defense" : 2,
    "type" : "squad", // individual, squad, or swarm

    "wounds" : {
        "maxNumber" : 3,
        "currentNumber" : 0
    }
};

var character = {
    "name" : "",
    "passion" : "",
    "traits" : ["", "", ""],

    "defense" : {
        "normal" : 2,
        "elemental" : {"electricity" : 0, "fire" : 0, "frost" : 0},
        "total" : function() {
            var total = this.defense.normal + this.defense.elemental.electricity + this.defense.elemental.fire + this.defense.elemental.frost;
            return total;
        }
    },

    "age" : 0,
    "background" : "",
    "myTurn" : true,

    "soulboundWeapons" : [],
    "eidolons" : [],

    "wounds" : {
        "maxNumber" : 3,
        "currentNumber" : 0
    },

    "awesomeTokens" : {
        //"maxNumber" : Infinity,
        "currentNumber" : 0
    },

    "dicePools" : {
        "action" : {
			"maxUsed" : 3,
            "maxNumber" : 10,
            "currentNumber" : 8
        },
        "strike" : {
            //"maxUsed" : 6,
            "maxUsed" : { "forStrike" : 6, "forAchievement" : 4 },
			//"maxNumber" : Infinity,
            "currentNumber" : 2
        },
        "charge" : {
			//"maxUsed" : Infinity,
            "maxNumber" : 6,
            "currentNumber" : 0
        }
    },

    "skills" : [
        {"name" : "Firearms", "rating" : 4, "marked" : false},
		{"name" : "Acrobatics", "rating" : 3, "marked" : false},
		{"name" : "Skill 3", "rating" : 2, "marked" : false}
    ],

    "powers" : [], // Array of Objects

    "conditions" : [], // Array of Objects (buff and/or debuffs)
    "immunity" : [], // Array of Objects (charge powers and condition)

	"diceRolls" : {
        "maxDiceEarnedFromManeuver" : 5,
        "maneuverBonusDices" : 0,

		"maneuver" : function(skillUsed, actionPoolDices/*, bonusDices*/) {
            var rollResult = [],
                strikeDiceEarned = 0,
                chargeDiceEarned = 0,
                awesomeTokenEarned = 0;
            //var skillUsed = {};

			//bonusDices = bonusDices === undefined ? 0 : bonusDices;
            skillUsed.marked = true;
			totalDices = skillUsed.rating + actionPoolDices + character.diceRolls.maneuverBonusDices;
			character.dicePools.action.currentNumber -= actionPoolDices;

			for (i = 1; i <= totalDices; i++) {
				rollResult.push(Math.floor(Math.random() * 6) + 1);
			};

			for (j of rollResult) {
				if (j > 2 && j < 6) {
					//ONE DICE GOES TO THE STRIKE POOL
					//(character.dicePools.strike.currentNumber)++;
                    strikeDiceEarned++;
				} else
				if (j === 6) {
					//ONE DICE GOES TO THE CHARGE POOL
					//(character.dicePools.charge.currentNumber)++;
                    chargeDiceEarned++;
				}
			};

            if ( (strikeDiceEarned + chargeDiceEarned) === 0) {
                //THE DICE ROLL ONLY GIVES 1 AND 2
                //RETURNS actionPoolDices TO THE ACTION POOL
                character.dicePools.action.currentNumber += actionPoolDices;
            } else
            if ( (strikeDiceEarned + chargeDiceEarned) >= 5) {
                // IF THE DICES EARNED FROM A SINGLE MANEUVER IS NO LESS THAN FIVE,
                // THAN THE TURN PLAYER ACQUIRES ONE AWESOME TOKEN

                awesomeTokenEarned++;

                if ( (strikeDiceEarned + chargeDiceEarned) > character.diceRolls.maxDiceEarnedFromManeuver ) {
                    //MAXIMUM DICES EARNED FROM A SINGLE MANEUVER ARE NORMALLY  FIVE  DICES (maxDiceEarnedFromManeuver)
                    //PLAYER DECIDES WHICH DICE GO TO WHICH POOL

                    //TODO HERE
                }
            }

			return {
                "rollResult" : rollResult,
                "strikeDiceEarned" : strikeDiceEarned,
                "chargeDiceEarned" : chargeDiceEarned,
                "awesomeTokenEarned" : awesomeTokenEarned
            };
		},

        "strikeElement" : "normal",
        "strikeBonusDices" : {"individual" : 0, "squad" : 0, "swarm" : 0},

		"strike" : function(target, strikePoolDices) {
            var rollResult = [],
                successfulStrike = 0;

			var totalDices = strikePoolDices + character.diceRolls.strikeBonusDices[target.type];
			character.dicePools.strike.currentNumber -= strikePoolDices;

            for (i = 1; i <= totalDices; i++) {
				rollResult.push(Math.floor(Math.random() * 6) + 1);
			}

            for (j of rollResult) {
				if (j > 2 ) {
					successfulStrike++;
				}
			}

            //DEAL DAMAGE TO THE ENEMY
            //rounded down to the nearest integer
            //woundDealt = Math.floor(successfulStrike / enemy.defense);
            //console.log("strike result " + rollResult.toString());

            return {
                "rollResult" : rollResult,
                "successfulStrike" : successfulStrike,
                "strikeElement" : character.diceRolls.strikeElement
            };
		},

        "achievementBonusDices" : 0,

		"achievement" : function(skillUsed, strikePoolDices/*, bonusDices*/) {
            var rollResult = [],
                successfulAchievement = 0;

			//bonusDices = bonusDices === undefined ? 0 : bonusDices;
            skillUsed.marked = true;
			totalDices = skillUsed.rating + strikePoolDices + character.diceRolls.achievementBonusDices;
			character.dicePools.strike.currentNumber -= strikePoolDices;

            for (i = 1; i <= totalDices; i++) {
				rollResult.push(Math.floor(Math.random() * 6) + 1);
			}

            for (j of rollResult) {
				if (j > 2 ) {
					successfulAchievement++;
				}
			}
            //console.log("Achievement Result " + rollResult.toString());

            return {
                "rollResult" : rollResult,
                "successfulAchievement" : successfulAchievement
            }
		}
	},

    "battle" : {
        "attack" : function(target, strikeResult) {
            /* MOCK CODE *
             * var command = {"text" : "attack", "targetID" : target.ID, "strikeResult" : strikeResult};
             * webSocketObject.send(command);
             * ========= */
        },

        "defend" : function(attacker, strikeResult) {
            /* SUSTAIN DAMAGE FROM AN ENEMY
             * When a data sent from server, check whether it's an attack or not
             * ================================================================= */
            // TODO HERE
            // DON'T FORGET TO IMPLEMENT IMMUNITY FROM CERTAIN ATTACKS

            // Rounded down to the nearest integer
            var woundDealt = Math.floor(strikeResult.successfulStrike / this.defense.total() );
            this.wounds.currentNumber += woundDealt;
            //console.log("strike result " + rollResult.toString());
        }
    },

    "updateStatus" : function() {
        $('[id]').each(function(){
            var id = $('[id="'+this.id+'"]');
            if(id.length>1 && id[0]==this) {
                console.log('Duplicate id '+this.id);
                alert('duplicate found\nCheck console');
            }
        });

        var skillSelection = "";

        // CONFLICT PAGE //
        if  ( this.myTurn ) {
            $("#gamepad a").removeClass("ui-state-disabled");
        }
        else {
            $("#gamepad a").addClass("ui-state-disabled");
        }

        $("#current_wound").html(this.wounds.currentNumber);
        $("#max_wound").html(this.wounds.maxNumber);

        $("#current_token").html(this.awesomeTokens.currentNumber);

        $("#current_action").html(this.dicePools.action.currentNumber);
        $("#max_action").html(this.dicePools.action.maxNumber);

        $("#current_strike").html(this.dicePools.strike.currentNumber);

        $("#current_charge").html(this.dicePools.charge.currentNumber);
        $("#max_charge").html(this.dicePools.charge.maxNumber);
        // CONFLICT PAGE //

        // MANEUVER DIALOG PAGE //
        $("#skill_used option").each(function(index) {
            var availableSkills = character.skills[index];
            $(this).attr("value", availableSkills.rating).html(availableSkills.name + " (" + availableSkills.rating + " dices)");
        });

        var str = "";

        for (j = 1; j <= this.dicePools.action.currentNumber; j++) {
            dice = j > 1 ? " dices" : " dice";

            if (j > character.dicePools.action.maxUsed) {
                break;
            }

            str += '<option value="' + j + '">' + j + dice + '</option>';
        }

        $("#action_dice_used").html(str);
        $("#maneuver_bonus_dice_used").val(character.diceRolls.maneuverBonusDices);
        // MANEUVER DIALOG PAGE //

        // STRIKE DIALOG PAGE //
        str = "";

        for (j = 1; j <= this.dicePools.strike.currentNumber; j++) {
            dice = j > 1 ? " dices" : " dice";

            if (j > character.dicePools.strike.maxUsed.forStrike) {
                break;
            }

            str += '<option value="' + j + '">' + j + dice + '</option>';
        }

        $("#strike_dice_used").html(str);
        $("#strike_bonus_dice_used").val(character.diceRolls.strikeBonusDices.squad);
        // STRIKE DIALOG PAGE //

        // ACHIEVEMENT DIALOG PAGE //
        str = "";

        for (j = 1; j <= this.dicePools.strike.currentNumber; j++) {
            dice = j > 1 ? " dices" : " dice";

            if (j > character.dicePools.strike.maxUsed.forAchievement) {
                break;
            }

            str += '<option value="' + j + '">' + j + dice + '</option>';
        }

        $("#strike_dice_used_for_achievement").html(str);
        $("#achievement_bonus_dice_used").val(character.diceRolls.achievementBonusDices);
        // ACHIEVEMENT DIALOG PAGE //
    },

    "initialise" : function() {
        // TODO : LOADING CHARACTER'S DATA FROM DATABASE

        // this.powers is an Array of Objects
        for ( var power of this.powers ) {
            // PASSIVE POWERS
            if (power.category === "passive") {
                power.effect();
            }
        }
    },

    "turn" : {
        "start" : function() {
            //TODO HERE
        },
        "finish" : function() {
            //TODO HERE
        }
    }
};

// SCRIPT TO RUN ON PAGE SHOW

$(document).on('pagecreate', '#conflict_page', function(){

    character.initialise();

    $( "body" ).on( "swiperight", function(event) {
        $("#left_button").click();
    }).on( "swipeleft", function(event) {
        $("#right_button").click()
    });

    $("#maneuver_button").click(function() {
        if (character.dicePools.action.currentNumber < 1) {
            alert("You have no action dices");
            return false;
        }
        //character.myTurn = false;
    });

    $("#strike_button").click(function() {
        if (character.dicePools.strike.currentNumber < 1) {
            alert("You have no strike dices");
            return false;
        }
        //character.myTurn = false;
    });

    $("#achievement_button").click(function() {
        if (character.dicePools.strike.currentNumber < 1) {
            alert("You have no strike dices");
            return false;
        }
        //character.myTurn = false;
    });

    // IF YOU HAVE NO CHARGE DICES, THE CHARGE POWERS ARE DISABLED,
    // BUT YOU COULD STILL SEE THE LIST

    $("#catching_your_breath_button").click(function() {
        var diceAmountDifference = character.dicePools.action.maxNumber - character.dicePools.action.currentNumber;

        switch (diceAmountDifference) {
            case 0:
                alert("You have reached action dice maximum limit");
                return false;
                break;
            case 1:
                character.dicePools.action.currentNumber++;
                break;
            default:
                character.dicePools.action.currentNumber += 2;
        }
        //character.myTurn = false;
        character.updateStatus();
    });

});

$(document).on('pageshow', '#conflict_page', function(){

    character.updateStatus();

});

$(document).on('pagecreate', '#maneuver_dialog_page', function(){
    character.updateStatus();
    // parseInt("") returns NaN

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

        var skillUsed = character.skills[index],
            actionPoolDices = isNaN( parseInt( $("#action_dice_used").val() ) ) ? 0 : parseInt( $("#action_dice_used").val() );
            //bonusDices = isNaN( parseInt( $("#maneuver_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#maneuver_bonus_dice_used").val() );

        maneuverRoll = character.diceRolls.maneuver(skillUsed, actionPoolDices/*, bonusDices*/);
        //console.log(maneuverRoll);
    });
});

$(document).on('pageshow', '#maneuver_result_page', function(){
    /*console.log("skillUsed " + character.skills[index].name);
    console.log("actionPoolDices " + actionPoolDices);
    console.log("bonusDices " + bonusDices);

    console.log("rollResult " + maneuverRoll.rollResult.toString());
    console.log("strikeDiceEarned " + maneuverRoll.strikeDiceEarned);
    console.log("chargeDiceEarned " + maneuverRoll.chargeDiceEarned);
    console.log("awesomeTokenEarned " + maneuverRoll.awesomeTokenEarned);*/

    // SAVE THE RESULTS..
    character.awesomeTokens.currentNumber += maneuverRoll.awesomeTokenEarned;
    character.dicePools.strike.currentNumber += maneuverRoll.strikeDiceEarned;
    character.dicePools.charge.currentNumber += maneuverRoll.chargeDiceEarned;

    if (character.dicePools.charge.currentNumber > character.dicePools.charge.maxNumber) {
        character.dicePools.charge.currentNumber = character.dicePools.charge.maxNumber;
    }

    // THEN DISPLAY THEM
    //console.log(maneuverRoll);
    $("#maneuverRollResult").html( maneuverRoll.rollResult.toString() );
    $("#strikeDiceEarned").html( maneuverRoll.strikeDiceEarned );
    $("#chargeDiceEarned").html( maneuverRoll.chargeDiceEarned );
    $("#awesomeTokenEarned").html( maneuverRoll.awesomeTokenEarned );

    // RESETTING THE MANEUVER RESULT
    //maneuverRoll = {};
});

$(document).on('pagecreate', '#strike_dialog_page', function(){
    character.updateStatus();
    // parseInt("") returns NaN

    //RESETTING DEFAULT SELECTED VALUE FOR <select class="form-elements"> ELEMENTS
    $("select.form-elements").val("");

    $(".form-elements").change(function() {
        $("#total_dice_used").html( totalValue(".form-elements") );
    });

    $("#calculate_strike").click(function() {
        var strikePoolDices = isNaN( parseInt( $("#strike_dice_used").val() ) ) ? 0 : parseInt( $("#strike_dice_used").val() );
            //bonusDices = isNaN( parseInt( $("#strike_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#strike_bonus_dice_used").val() );

        strikeRoll = character.diceRolls.strike(enemy, strikePoolDices);
    });
});

$(document).on('pageshow', '#strike_result_page', function(){

    // DISPLAY THE RESULTS
    $("#strikeRollResult").html( strikeRoll.rollResult.toString() );
    $("#successfulStrike").html( strikeRoll.successfulStrike );

    // RESETTING THE STRIKE RESULT
    strikeRoll = {};
});

$(document).on('pagecreate', '#achievement_dialog_page', function(){
    character.updateStatus();
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

        var skillUsed = character.skills[index],
            strikePoolDices = isNaN( parseInt( $("#strike_dice_used_for_achievement").val() ) ) ? 0 : parseInt( $("#strike_dice_used_for_achievement").val() );
            //bonusDices = isNaN( parseInt( $("#achievement_bonus_dice_used").val() ) ) ? 0 : parseInt( $("#achievement_bonus_dice_used").val() );

        achievementRoll = character.diceRolls.achievement(skillUsed, strikePoolDices/*, bonusDices*/);
    });
});

$(document).on('pageshow', '#achievement_result_page', function(){

    // DISPLAY THE RESULTS
    $("#achievementRollResult").html( achievementRoll.rollResult.toString() );
    $("#successfulAchievement").html( achievementRoll.successfulAchievement );

    // RESETTING THE ACHIEVEMENT RESULT
    achievementRoll = {};
});