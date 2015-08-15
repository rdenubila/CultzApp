
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
        function (response) { alert(JSON.stringify(response)) },
        function (response) { alert(JSON.stringify(response)) });
}