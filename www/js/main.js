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
            interstitial:'ca-app-pub-9249695405712287/3927718795'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', 
      interstitial: 'ca-app-pub-9249695405712287/5312118508'
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
        $(".dropList").select2();
        $('#simplemenu').sidr();
        window.ga.startTrackerWithId('UA-88579601-15', 1, function(msg) {
            window.ga.trackView('Home');
        });  
        initApp();
        askRating();
        //document.getElementById('screen').style.display = 'none';     
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
	$.get(url, function(data) {processXmlDocumentDirections(data); });    $("span").remove();
    $(".dropList").select2();
}

function processXmlDocumentDirections(xml)
{
    var list = $("#MainMobileContent_directionList");
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
	var routeTag = xml.getElementsByTagName("route");
	var directionsTag = routeTag[0].getElementsByTagName("directions");	
	var directionTag = directionsTag[0].getElementsByTagName("direction");

	for (var i=0; i<directionTag.length;i++)
	{
		var nameTag = directionTag[i].getElementsByTagName("name");
		var displayTag = directionTag[i].getElementsByTagName("dd");
        var direction = nameTag[0].firstChild.data;
		var directionDisplay = displayTag[0].firstChild.data;
        $(list).append($("<option />").val(direction).text(directionDisplay));
	}
	$(list).val(0);
}

function getStops()
{
    reset();
    var url = "http://www.ctabustracker.com/bustime/map/getStopsForRouteDirection.jsp?route=" + $("#MainMobileContent_routeList").val() + "&direction=" + $("#MainMobileContent_directionList").val();
	$.get(url, function(data) {  processXmlDocumentStops(data); });
    $("span").remove();
    $(".dropList").select2();
}

function processXmlDocumentStops(xml)
{
        var list = $("#MainMobileContent_stopList");
        $(list).empty();
        $(list).append($("<option disabled/>").val("0").text("- Select Stop -"));
		var routeTag = xml.getElementsByTagName("route");
		var stopsTag = routeTag[0].getElementsByTagName("stops");	
		if(stopsTag != null)
		{
			var stopTag = stopsTag[0].getElementsByTagName("stop");

			for(var i=0; i<stopTag.length;i++)
			{
				var name = stopTag[i].getElementsByTagName("name")[0].firstChild.data;
				var id = stopTag[i].getElementsByTagName("id")[0].firstChild.data;
                $(list).append($("<option />").val(id).text(name));
			}
		}
        $(list).val(0);
}

function getArrivalTimes() {
    reset();
    var url = "http://www.ctabustracker.com/bustime/eta/getStopPredictionsETA.jsp?route=" + $("#MainMobileContent_routeList").val() + "&stop=" + $("#MainMobileContent_stopList").val();
	$.get(url, function(data) {  processXmlDocumentPredictions(data); });       
    $("span").remove();
    $(".dropList").select2();
}

function processXmlDocumentPredictions(xml)
{
        var outputContainer = $('.js-next-bus-results');
		var stopTag = xml.getElementsByTagName("stop");
		var predsTag = stopTag[0].getElementsByTagName("pre");
        var results = '<table id="tblResults" cellpadding="0" cellspacing="0">'

		if(predsTag != null)
		{
            document.getElementById('btnSave').style.visibility = "visible";
		    results = results.concat('<tr class="header"><th>ROUTE</th><th>DESTINATION</th><th>ARRIVAL</th></tr><tr><td class="spacer" colspan="3"></td></tr>');
			for(var i=0; i<predsTag.length;i++)
			{
				var arrival = predsTag[i].getElementsByTagName("pt")[0].firstChild.data + " " + predsTag[i].getElementsByTagName("pu")[0].firstChild.data;
				var route = predsTag[i].getElementsByTagName("rd")[0].firstChild.data;
				var destination = predsTag[i].getElementsByTagName("fd")[0].firstChild.data;
                results = results.concat('<tr class="predictions">');
                results = results.concat("<td>" + route + "</td>" + "<td>" + destination + "</td>" + "<td>" + arrival + "</td>");
			    results = results.concat('</tr><tr><td class="spacer" colspan="3"></td></tr>');
			}
		}
        else
        {
            results = results.concat("<tr><td>No upcoming arrivals</td></tr>");
        }
        results = results + "</table>";
        $(outputContainer).html(results).show();
}


function displayError(error) {
}



function reset() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#message").text('');        
}

function saveFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var newFave = $('#MainMobileContent_routeList option:selected').val() + ">" + $("#MainMobileContent_directionList option:selected").val() + ">" + $("#MainMobileContent_stopList option:selected").val() + ":" + $('#MainMobileContent_routeList option:selected').text() + " > " + $("#MainMobileContent_directionList option:selected").text() + " > " + $("#MainMobileContent_stopList option:selected").text();
        if (favStop == null)
        {
            favStop = newFave;
        }   
        else if(favStop.indexOf(newFave) == -1)
        {
            favStop = favStop + "|" + newFave;               
        }
        else
        {
            $("#message").text('Stop is already favorited!!');
            return;
        }
        localStorage.setItem("Favorites", favStop);
        $("#message").text('Stop added to favorites!!');
}