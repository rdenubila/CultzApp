apiURL = "http://www.meatballs.com.vc/cultz/";

android = {
	projectNumber: "1005283282385",
	api: "AIzaSyCU_9YUa6RWC3DZPUOgQgx3VmRut4DldYA",
	appId: "c960c2f2-d524-4ccf-bf5a-0b9385f1e8c4"
}

document.addEventListener("deviceready", ready, false);


function ready(){

	initFB = true;
	checkInit();


	// Enable to debug issues.
	// window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

	var notificationOpenedCallback = function(jsonData) {
	console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
	};

	window.plugins.OneSignal.init(
		android.appId, {
			googleProjectNumber: android.projectNumber},
			notificationOpenedCallback);

	// Show an alert box if a notification comes in when the user is in your app.
	window.plugins.OneSignal.enableInAppAlertNotification(true);

}


function notificationOpenedCallback(data){
	console.log(data);
}


function statusChangeCallback(response) {
	if (response.status === 'connected') {
		getUserData();
	} else if (response.status === 'not_authorized') {
		loginFB();
		$("#loading").fadeOut("fast");
	} else {
		loginFB();
		$("#loading").fadeOut("fast");
	}
}


function getUserData(){
	facebookConnectPlugin.api('/me?fields=id,name,email', [], function(response) {
		login( response );
	}, function (response) { alert(JSON.stringify(response)) });
}

function getFriendsFB(){
	$("#loading").fadeIn("fast");

	facebookConnectPlugin.api('me/friends?fields=id&limit=999', ["user_friends"], function(response) {
		getFriendsBD( response );
	}, function (response) { alert(JSON.stringify(response)) });
}

function inviteFriends(){
	facebookConnectPlugin.ui({
	    method: 'apprequests', 
	    message: 'Conheça o Quiz Cultz!',
	    data: 'tracking information for the user'
	});
}


function checkLoginState() {
	
	$("#loading").fadeIn("fast");

	facebookConnectPlugin.getLoginStatus( 
		function(response) {
			statusChangeCallback(response);
		},
        function (response) { alert(JSON.stringify(response)) }
    );

}


function loginFB(){
	
	facebookConnectPlugin.login( ["email", "user_friends"],
        function (response) { statusChangeCallback(response); },
        function (response) { alert(JSON.stringify(response)) });
}


function getDeviceData(){
	window.plugins.OneSignal.getIds(function(ids) {

		console.log("---- SALVA TOKEN ----");
		console.log(ids);
		console.log(userLogado);
		
		$.getJSON( apiURL+"setPushToken.php", {id: userLogado.id, push_token: ids.pushToken, userid: ids.userId } ).done(function( data ) {

			console.log(data)

			if(!data.result){
				alerta(data.error);
			}

		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	});

	geoLocation();
}


function sendPushTo(user, titulo, msg){
	console.log("---- ENVIAR MSG ----");
	console.log(msg);
	console.log(user);
	if(user.userid)

		var notificationObj = { 
			headings: {en: titulo},
			contents: {en: msg},
			include_player_ids: [user.userid]
		};

		window.plugins.OneSignal.postNotification(notificationObj,
	    function(successResponse) {
	      console.log("Notification Post Success:", successResponse);
	    },
	    function (failedResponse) {
	      console.log("Notification Post Failed: ", failedResponse);
	      alert("Notification Post Failed:\n" + JSON.stringify(failedResponse));
	    }
	  );
}


function geoLocation(){
	//
    //
    // after deviceready
    //
    //

    // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
    //  in order to prompt the user for Location permission.
    window.navigator.geolocation.getCurrentPosition(function(location) {
        console.log('Location from Phonegap');
    });

    var bgGeo = window.plugins.backgroundGeoLocation;

    /**
    * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
    */
    var yourAjaxCallback = function(response) {
        ////
        // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
        //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        //
        //
        bgGeo.finish();
    };

    /**
    * This callback will be executed every time a geolocation is recorded in the background.
    */
    var callbackFn = function(location) {
        console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
        // Do your HTTP request here to POST location to your server.
        //
        //
        yourAjaxCallback.call(this);
    };

    var failureFn = function(error) {
        console.log('BackgroundGeoLocation error');
    }

    // BackgroundGeoLocation is highly configurable.
    bgGeo.configure(callbackFn, failureFn, {
        url: apiURL+'setGeolocation.php', // <-- Android ONLY:  your server url to send locations to
        params: {
            auth_token: 'user_secret_auth_token',    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
            id_user: userLogado.id                              //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
        },
        headers: {                                   // <-- Android ONLY:  Optional HTTP headers sent to your configured #url when persisting locations
            "X-Foo": "BAR"
        },
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
        notificationText: 'ENABLED', // <-- android only, customize the text of the notification
        activityType: 'AutomotiveNavigation',
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
    });

    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
    bgGeo.start();

    // If you wish to turn OFF background-tracking, call the #stop method.
    // bgGeo.stop()

}