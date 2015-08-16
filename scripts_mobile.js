apiURL = "http://meatballs.com.vc/cultz/";


document.addEventListener("deviceready", ready, false);


function ready(){

	initFB = true;
	checkInit();

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