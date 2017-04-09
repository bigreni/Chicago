    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            checkFirstUse();
        }
    }
    var admobid = {};
    if (/(android)/i.test(navigator.userAgent)) {
        admobid = { // for Android
            banner: 'ca-app-pub-1683858134373419/7790106682',
            interstitial:'ca-app-pub-9249695405712287/7485127953'
            //banner: 'ca-app-pub-3886850395157773/3411786244'
            //interstitial: 'ca-app-pub-9249695405712287/3301233156'
        };
    }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        // display the banner at startup
        //createSelectedBanner();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }
    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) {

        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
    }

   function checkFirstUse()
    {
		TransitMaster.StopTimes({arrivals: true, headingLabel: "Arrival"});        askRating();
        initApp();
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                android: 'market://details?id=com.bridgeport.free'
               }
};
 
AppRate.promptForRating(false);
}

var	TransitMaster =	TransitMaster || {};

TransitMaster.StopTimes = function (options) {
    var settings = { arrivals: null, headingLabel: null, includeStops: true };
    $.extend(settings, options);

    var timer = null;
    var initialView = true;

    initialize();

    function initialize() {
        $("#MainMobileContent_routeList").bind("change", function () {
            var temp = $("#MainContent_routeList").val();

            if (temp != "") {
                $.cookie("route", temp, { expires: 30 });
                getDirections();
            }
        });

        $("#MainMobileContent_directionList").bind("change", function () {
            var temp = $("#MainContent_directionList").val();

            if (temp != "") {
                $.cookie("direction", temp, { expires: 30 });
                reset();

                if (settings.includeStops)
                    getStops();
            }
        });

        if (settings.includeStops) {
            $("#MainMobileContent_stopList").bind("change", function () {
                var temp = $("#MainMobileContent_stopList").val();

                if (temp != "") {
                    $.cookie("stop", temp, { expires: 30 });
                    getArrivalTimes();
                }
            });
        }

        getRoutes();
    }


    function checkListCookie(key, list) {
        if (initialView) {
            var temp = $.cookie(key);
            if (temp != null && $("#" + list + " option[value=" + temp + "]").length > 0) {
                $("#" + list).val(temp).change();
                return true;
            }
            else
                initialView = false;
        }

        return false;
    }

    function getRoutes() {
        $("#routeWait").removeClass("hidden");

        $.ajax({
            type: "POST",
            url: "http://tmweb.pacebus.com/TMWebWatch/Arrivals.aspx/getRoutes",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null || msg.d.length == 0) {
                    $("#MainMobileContent_routeList").text("No routes found");
                    return; 
                }

                var list = $("#MainMobileContent_routeList");

                $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a route...", "0");
                $.each(msg.d, function (index, item) {
                    $(list).append($("<option />").val(item.id).text(item.name));
                    //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
                });
                $(list).val('0');
                checkListCookie("route", "MainMobileContent_routeList");
            },
            error: function () {
                $("#MainMobileContent_routeList").text("Failed to load routes");
            },
            complete: function (jqXHR, textStatus) {
                $("#routeWait").addClass("hidden");
            }
        });
        $("span").remove();
        $(".dropList").select2();
        //$("span").remove();
    }

    function getDirections() {
        reset();

        // Clear cookies if	this is	a new selection
        if (!initialView) {
            $.cookie("direction", null);
            $.cookie("stop", null);
        }

        if (settings.includeStops) {
            $("#MainMobileContent_stopList").get(0).options.length = 0;
        }


        var list = $("#MainMobileContent_directionList");
        $(list).empty();
        $("#MainMobileContent_stopList").empty();
        $(list).get(0).options.length = 0;
        //$("#MainMobileContent_directionList").text("Loading	directions...");
        $("#directionWait").removeClass("hidden");

        $.ajax({
            type: "POST",
            url: "http://tmweb.pacebus.com/TMWebWatch/Arrivals.aspx/getDirections",
            data: "{routeID: " + $("#MainMobileContent_routeList").val() + "}",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null || msg.d.length == 0) {
                    $("#MainMobileContent_directionList").text("No directions found");
                    return;
                }

                $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a direction...", "");
                $.each(msg.d, function (index, item) {
                    $(list).append($("<option />").val(item.id).text(item.name));
                    //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
                });

                checkListCookie("direction", "MainMobileContent_directionList");

                if (!settings.includeStops)
                    initialView = false;
            },
            error: function () {
                $("#MainMobileContent_directionList").text("Failed to load directions");
            },
            complete: function (jqXHR, textStatus) {
                $("#directionWait").addClass("hidden");
            }
        });
        $("span").remove();
        $(".dropList").select2();        //$("span").remove();
    }

    function getStops() {
        // Clear cookies if	this is	a new selection
        if (!initialView)
            $.cookie("stop", null);

        var list = $("#MainMobileContent_stopList");

        $(list).get(0).options.length = 0;
        $("#MainMobileContent_stopList").text("Loading stops...");
        $("#stopWait").removeClass("hidden");

        $.ajax({
            type: "POST",
            url: "http://tmweb.pacebus.com/TMWebWatch/Arrivals.aspx/getStops",
            data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + "}",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null || msg.d.length == 0) {
                    $("#MainMobileContent_stopList").text("No stops	found");
                    return;
                }
                $(list).empty();
                $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a stop...", "");

                $.each(msg.d, function (index, item) {
                    $(list).append($("<option />").val(item.id).text(item.name));
                    //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
                });

                checkListCookie("stop", "MainMobileContent_stopList");

                initialView = false;
            },
            error: function () {
                $("#MainMobileContent_stopList").text("Failed to load stops");
            },
            complete: function (jqXHR, textStatus) {
                $("#stopWait").addClass("hidden");
            }
        });
        $("span").remove();
        $(".dropList").select2();        //$("span").remove();
    }

    function getArrivalTimes(refresh) {
        if (!refresh) {
            reset(true);
            $("#stopWait").removeClass("hidden");
        }

        $.ajax({
            type: "POST",
            url: "http://tmweb.pacebus.com/TMWebWatch/Arrivals.aspx/getStopTimes",
            data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + ",	stopID:	" + $("#MainMobileContent_stopList").val() + ", useArrivalTimes:	" + settings.arrivals + "}",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null) {
                    msg.d = { errorMessage: "Sorry, an	internal error has occurred" };
                }

if (msg.d.errorMessage == null && (msg.d.routeStops == null || msg.d.routeStops[0].stops == null || msg.d.routeStops[0].stops[0].crossings == null || msg.d.routeStops[0].stops[0].crossings.length == 0))
					msg.d.errorMessage = "No upcoming stop times found";

				if (msg.d.errorMessage != null)
				{
					displayError(msg.d.errorMessage);
					return;
				}

				msg.d.stops = msg.d.routeStops[0].stops;

				var count = msg.d.stops[0].crossings.length;
				msg.d.heading = "Next " + (count > 1 ? count : "") + " Vehicle " + settings.headingLabel + (count > 1 ? "s" : "");

				var result = $("#stopTemplate").render(msg.d);

				if (refresh)
					$("#resultBox").html($(result).html());
				else
					displayResultsBox(result);

				if (!refresh)
					timer = window.setInterval(function () {
						getArrivalTimes(true);
					}, 30000);
			},
			error: function () {
				displayError("Failed to	load stop times");
			},
			complete: function (jqXHR, textStatus) {
				$("#stopWait").addClass("hidden");
			}        });
        $("span").remove();
        $(".dropList").select2();        //$("span").remove();
    }

    function displayError(error) {
        reset(true);
        displayResultsBox($("#errorTemplate").render({ error: error }));
    }

    function displayResultsBox(html) {
        // Unfortunately IE9 leaves	artifacts
        var radius = $("#contentBox").css("border-radius");

        $(html).hide().appendTo("#contentBox").toggle(500, function () {
            $("#contentBox").css("border-radius", radius);
            $(this).animate({ opacity: "1" }, 200);
        });
    }

    function reset(instantRemove) {
        if (timer != null) {
            window.clearInterval(timer);
            timer = null;
        }

        if ($("#resultBox").length > 0) {
            if (instantRemove)
                $("#resultBox").remove();
            else
                removeResultBox();
        }
    }

    function removeResultBox() {
        // Unfortunately IE9 leaves	artifacts
        var shadow = $("#contentBox").css("box-shadow");
        var shadowHide = shadow;

        $("#resultBox").animate({ opacity: "0" }, 200, function () {
            $("#contentBox").css("box-shadow", shadowHide);
            $(this).toggle(500, function () {
                $("#contentBox").css("box-shadow", shadow);
                $(this).remove();
            })
        });
    }

    return {
        displayError: displayError
    };
}