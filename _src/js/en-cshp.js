var customEn = require('./customen');


jQuery(document).ready(function($){
	var facebook_app_info = {
	      appId            : '925803530921208',
	      autoLogAppEvents : true,
	      xfbml            : true,
	      version          : 'v2.11'
	    };

    window.fbAsyncInit = function() {
	    FB.init(facebook_app_info);
	    var customen = customEn($);
	    customen.fieldPosition();
    	customen.shareSocial(facebook_app_info);
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

});

jQuery(window).ready(function($){
	
});