apiURL = "http://localhost/Cultz/sistema/";


window.fbAsyncInit = function() {
	FB.init({
		appId      : '1908908612666620',
		xfbml      : true,
		version    : 'v2.4'
	});

	initFB = true;
	checkInit();

};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


//localStorage.removeItem("user");

function statusChangeCallback(response) {
	if (response.status === 'connected') {
		getUserData();
	} else if (response.status === 'not_authorized') {
		//loginFB();
		$("#loading").fadeOut("fast");

		localStorage.clear();
		trocaTela("instrucao");

	} else {
		loginFB();
		$("#loading").fadeOut("fast");
	}
}

function getUserData(){
	FB.api('/me?fields=id,name,email', function(response) {
		login( response );
	});
}



function checkLoginState() {
	
	$("#loading").fadeIn("fast");

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

function loginFB(){
	FB.login(function(response) {
		statusChangeCallback(response);
	}, {scope: 'email, user_friends'});
}



function getFriendsFB(){
	$("#loading").fadeIn("fast");

	FB.api('me/permissions', function(response) {
		console.log(response.data);

		var canGetFriends = false;
		for(i=0; i<response.data.length; i++){
			d = response.data[i];
			if(d.permission=="user_friends" && d.status=="granted"){
				FB.api('me/friends?fields=id&limit=999', function(response) {
					getFriendsBD( response );
				});
				canGetFriends = true;
			}
		}

		if(!canGetFriends){
			FB.login(function(response) {
				getFriendsFB();
			}, {scope: 'email, user_friends'});
		}
	});

}

function inviteFriends(){
	FB.ui({
	    method: 'apprequests', 
	    message: 'Conheça o Quiz Cultz!', 
	    function(response){
		  console.log(response);
		}
	});
}


function getDeviceData(){
}

function sendPushTo(user, titulo, msg){
	console.log("---- ENVIAR MSG ----");
	console.log(msg);
	console.log(user);
}
