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
            interstitial:'ca-app-pub-9249695405712287/3416685158'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', 
      interstitial: 'ca-app-pub-9249695405712287/1066062756'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
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
            document.getElementById('screen').style.display = 'none';     
        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { 
            document.getElementById('screen').style.display = 'none';     
        });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
    }

   function checkFirstUse()
    {
        //window.ga.startTrackerWithId('UA-88579601-10', 1, function(msg) {
        //    window.ga.trackView('Home');
        //});  
        //initApp();
        //askRating();
        document.getElementById('screen').style.display = 'none';     
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1225698349',
                android: 'market://details?id=com.chicago.free'
               }
};
 
AppRate.promptForRating(false);
}

function loadFaves()
{
    window.location = "Favorites.html";
    window.ga.trackView('Favorites');
}

    function getDirections() {
        reset();

        var url = "http://www.ctabustracker.com/bustime/map/getDirectionsStopsForRoute.jsp?route=" + $("#MainMobileContent_routeList").val();
		$.get(url, function(data) {processXmlDocumentDirections(data); });
        $("span").remove();
        $(".dropList").select2();
    }

    function processXmlDocumentDirections(xml)
	{
        var list = $("#MainMobileContent_routeList");

			var routeTag = xml.getElementsByTagName("route");
			var directionsTag = routeTag[0].getElementsByTagName("directions");	
			var directionTag = directionsTag[0].getElementsByTagName("direction");
			var stopsTag = null;
			if(directionTag.length > 0)											//@12
				stopsTag = directionTag[0].getElementsByTagName("stops");

			var directions = [];

			for (var i=0; i<directionTag.length;i++)
			{
				var nameTag = directionTag[i].getElementsByTagName("name");
				var displayTag = directionTag[i].getElementsByTagName("dd");
				var rtpiFeedName = cd.Utils.getElementData(directionTag[i], "rtpiFeedName"); //@24
				var direction = nameTag[0].firstChild.data;
				var directionDisplay = displayTag[0].firstChild.data;

				var direction = new cd.Direction(direction, rtpiFeedName, directionDisplay); //@24
				directions.push(direction);
			}
			setDirections(directions);        }

function setDirections(directions)
	{
		g_directions = {};
		
        var list = $("#MainMobileContent_routeList");
        $(list).empty();
        $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a direction...", "");
        
		for (var i=0; i<directions.length; i++)
		{
			var direction = directions[i];

			g_directions[ direction.toFeedColonNameString() ] = direction;

			var option = new Option(direction.getDisplayDirection(), direction.toFeedColonNameString()); //@25
			$(list).append(option);
		}
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
            url: "http://www.nextconnect.riderta.com/Arrivals.aspx/getStops",
            data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + "}",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null || msg.d.length == 0) {
                    $("#MainMobileContent_stopList").text("No stops	found");
                    displayError("RTA is currently having issues with real-time arrivals. We are working on fixing the issue. Thank you for your patience.");
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
        $(".dropList").select2();
    }

    function getArrivalTimes(refresh) {
        if (!refresh) {
            reset(true);
            $("#stopWait").removeClass("hidden");
        }

        $.ajax({
            type: "POST",
            url: "http://www.nextconnect.riderta.com/Arrivals.aspx/getStopTimes",
            data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + ",	stopID:	" + $("#MainMobileContent_stopList").val() + ", useArrivalTimes:	" + settings.arrivals + "}",
            contentType: "application/json;	charset=utf-8",
            dataType: "json",
            success: function (msg) {
                if (msg.d == null) {
                    msg.d = { errorMessage: "RTA is currently having issues with real-time arrivals. We are working on fixing the issue. Thank you for your patience." };
                }

                if (msg.d.errorMessage == null && (msg.d.stops == null || msg.d.stops[0].crossings == null || msg.d.stops[0].crossings.length == 0))
                    msg.d.errorMessage = "No upcoming stop times found";

                if (msg.d.errorMessage != null) {
                    displayError(msg.d.errorMessage);
                    return;
                }

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
            }
        });
        $("span").remove();
        $(".dropList").select2();
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


var	TransitMaster =	TransitMaster || {};

TransitMaster.StopTimes = function (options) {
    var settings = { arrivals: null, headingLabel: null, includeStops: true };
    $.extend(settings, options);

    var timer = null;
    var initialView = true;
    $('#simplemenu').sidr();

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




    return {
        displayError: displayError
    };
}