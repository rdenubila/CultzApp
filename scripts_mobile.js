var apiURL = "http://www.quizcultz.com.br/webservice/";

var android = {
	projectNumber: "1005283282385",
	api: "AIzaSyCU_9YUa6RWC3DZPUOgQgx3VmRut4DldYA",
	appId: "c960c2f2-d524-4ccf-bf5a-0b9385f1e8c4"
}

document.addEventListener("deviceready", ready, false);

document.addEventListener("resume", onResume, false);

function onResume() {
    console.log("RESUME");
    trocaTela('andamento');
}


function ready(){

	//initFB = true;
	//checkInit();


	// Enable to debug issues.
	// window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

	var notificationOpenedCallback = function(jsonData) {
	console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
	};

	/* OLD
	window.plugins.OneSignal.init(
		android.appId, {
			googleProjectNumber: android.projectNumber},
			notificationOpenedCallback);*/
	
	window.plugins.OneSignal
		.startInit(android.appId)
		.handleNotificationOpened(notificationOpenedCallback)
		.endInit();

	// Show an alert box if a notification comes in when the user is in your app.
	//window.plugins.OneSignal.enableInAppAlertNotification(true);

}


function notificationOpenedCallback(data){
	console.log(data);
}


function statusChangeCallback(response) {
	if (response.status === 'connected') {
		is_userLoggedInFB = true;
		getUserData_goToAndamento();
	} else if (response.status === 'not_authorized') {
		//loginFB(statusChangeCallback);
		$("#loading").fadeOut("fast");
		localStorage.clear();
		trocaTela("instrucao");
	} else {
		loginFB(statusChangeCallback);
		$("#loading").fadeOut("fast");
	}
}


function getUserData_goToAndamento(){
	facebookConnectPlugin.api('/me?fields=id,name,email', [],
		function (response) { login(response, 'andamento'); },
		function (response) { alert(JSON.stringify(response)); }
	);
}

function getUserData(){
	facebookConnectPlugin.api('/me?fields=id,name,email', [],
		function (response) { login(response); },
		function (response) { alert(JSON.stringify(response)); }
	);
}

function getFriendsFB(){
	$("#loading").fadeIn("fast");

	if (is_userLoggedInFB)
	{
		facebookConnectPlugin.api('me/friends?fields=id&limit=999', ["user_friends"], function(response) {
			getFriendsBD( response );
		}, function (response) { alert(JSON.stringify(response)) });
	}
	else
		$("#lista_fb").append("<li onclick='inviteFriendsLoginFB()'><p class='aviso'>Não encontrou quem você procurava? Toque aqui e chame seu amigo para jogar o Quiz Cultz.</p></li>")
}

function inviteFriendsLoginFB()
{
	loginFB(inviteFriendsLoginFB_success);
}

function inviteFriendsLoginFB_success(response)
{
	if (response.status === 'connected') {
		is_userLoggedInFB = true;
		getUserData();
	} else {
		$("#loading").fadeOut("fast");
	}
}

function inviteFriends(){
	facebookConnectPlugin.showDialog({
	    method: 'apprequests', 
	    message: 'Conheça o Quiz Cultz!'},
	    function(response){
			console.log(response);
		},
		function(response){
			console.log(response);
		}
	);
}

function checkLoginState(successCallback) {
	
	$("#loading").fadeIn("fast");

	facebookConnectPlugin.getLoginStatus( 
		successCallback,
        function (response) { 
        	console.log(JSON.stringify(response)) 
        }
    );

}


function loginFB(successCallback){
	facebookConnectPlugin.login( ["email", "user_friends"],
        successCallback,
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
	    }
	  );
}
