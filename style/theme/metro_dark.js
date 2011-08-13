// ==UserScript==
// @name          DeskSMS Metro Dark
// @namespace     http://userstyles.org
// @description	  A re-themed metro like version of Koush's DeskSMS because the white makes my Eyes Bleed. Very Minimalistic with re padded boxes and header.
// @author        wavedashdoc
// @homepage      http://userstyles.org/styles/52318
// @include       http://clockworkmod.com/*
// @include       https://clockworkmod.com/*
// @include       http://*.clockworkmod.com/*
// @include       https://*.clockworkmod.com/*
// @include       clockworkmod.com/desksms/#*
// @run-at        document-start
// ==/UserScript==
(function() {
var css = "body \n\n{\n    margin: 0px;\n    padding: 0px;\n    font-family: 'Droid Sans', sans-serif;\n    \n    font-size: 14px;\n    background-color: #222222 !important;\n    color: black;\n}\n\n \n.page-header\n\n{\n\n    padding: 10px;\n    background-color: #000000 !important;\n    color: #EEEEEE;\n\n\n}\n\n.grey-header \n\n{\n\n    background-color:  #222222 !important;\n    color: black; \n\n}\n\n.send-message-container\n\n {\n\n    padding: 9px;\n    margin: 40px;\n    background-color: #222222 !important;\n    \n}\n\n.page-header \n\n{\n\n    padding: 5px !important;\n    background-color: #222222;\n    color: #EEEEEE;\n\n}\n\n.desksms-header a\n {\n\n    font-weight: bold;\n    color: #E27318 !important;\n\n}\n\n.message-panel-footer \n\n{\n\n    background-color: #222222 !important;\n    padding-top: 4px;\n    padding-bottom: 8px !important;\n    padding-left: 8px;\n    padding-right: 8px;\n    font-size: 12px;\n\n}\n\n.message-content\n\n {\n\n    background-color:#222222 !important;\n    color: #F1F1F1 !important;\n    font-weight: normal !important;   \n\n}\n\n.content-container \n\n{\n\n    width: 50%;\n    min-width: 300px;\n    min-height: 200px;\n    margin-left: auto;\n    margin-right: auto;\n    background-color:  #222222 !important;\n\n}\n\ninput.rounded\n\n {\n\n    -webkit-border-radius: 20px !important;\n    -moz-border-radius: 20px !important;\n    border-radius: 5px; \n    height: 25px;\n    padding: 4px;\n  \n}\n\n   \n\n.contact-call \n\n{\n\nheight: 0 !important;\n    width: 0 !important;\n    background: url('http://goo.gl/EIUvl') no-repeat !important; \n    padding-left: 0px !important;\n    padding-top: 0px !important;\n    color:  transparent !important;\n\n}\n\n.contact-text \n\n{\n\n    height: 0 !important;\n    width: 0 !important;\n    background: url('http://goo.gl/ufss5') no-repeat !important; \n    padding-left: 0px !important;\n    padding-top: 0px !important;\n    color:  transparent !important;\n\n}\n\n.contact-delete\n\n{\n\n    height: 0 !important;\n    width: 0 !important;\n    background: url('http://goo.gl/EEZWa') no-repeat !important; \n    padding-left: 0px !important;\n    padding-top: 0px !important;\n    color:  transparent !important;\n\n}\n\n.content-status \n\n{\n\n    padding: 20px;\n    font-size: 24px;\n    background-color: #222222 !important;\n\n}\n\n.contact-text-container \n\n{\n\n    display: inline;\n    margin-bottom: 8px;\n    background-color: #222222!important;\n\n}\n\n.contact-header\n\n {\n\n    float: left;\n    display: inline;\n    width: 20%;\n    margin-top: 20px;\n    color: #F1F1F1 !important;\n\n}\n\n.contact-messages-internal\n {\n\n    padding: 8px;\n    background-color: #222222 !important;\n\n}\n\n\n.contact-text-character-count \n\n{\n\n    padding: 6px;\n    font-weight: normal !important;\n    color: #E27318 !important;\n\n}\n\n\n.contact-name\n {\n\n    font-size: 18px;\n    font-weight: bold;\n    color: #7cc6de !important;\n\n}\n\n.message-from \n{\n\n    font-weight: bold;\n    color: #7cc6de !important;\n\n}\n\n.contact-action-confirm-yes\n {\n\n    padding-right: 20px;\n    color: #59ec32 !important;\n\n}\n\n.contact-action-confirm-no\n\n{\n\n    padding-right: 20px;\n    color: #cd3512 !important;\n\n}\n\n\n.contact-action-confirm-dialog\n {\n\n    padding-top: 4px;\n    padding-bottom: 4px;\n    color: #aeaeae !important\n\n}\n\n.contact-search\n\n {\n   \n     padding: 10px !important;\n\n}\n\n#contact-search \n{\n\n    width: 300px;\n    height: 20px !important;\n    font-size: 18px !important;\n    padding-right: 100px !important;\n   \n}\n\n\n.conversation-unread\n {\n\n    display: table-cell;\n    width: 6px;\n    background-color: #E27318 !important;\n\n}\n\n\n\n\n\n\n.triangle-border\n\n {\n	position:relative;\n	\n	margin:1em 0 3em;\n	border:5px solid #7cc6de !important;\n	color:#333;\n	background:#222222 !important;\n	\n	-webkit-border-radius:10px;\n	-moz-border-radius:10px;\n	border-radius:10px;\n        background:-webkit-gradient(linear, 0 0, 0 100%, from(#222222), to(#222222)) !important;\n	background:-moz-linear-gradient(#222222, #222222) !important;\n	background:-o-linear-gradient(#222222, #222222) !important;\n	background:linear-gradient(#222222, #222222) !important;\n\n}\n\n\n\n.triangle-border.left:before\n\n {\n	top:10px; \n	bottom:auto;\n	left:-30px; \n	border-width:15px 30px 15px 0;\n	border-color: transparent #7cc6de !important;\n        \n      \n        \n }\n\n\n.triangle-border.left:after {\n	top:16px; \n	bottom:auto;\n	left:-21px; \n	border-width:9px 21px 9px 0;\n	border-color:transparent #fff;\n}\n\n\n\n\n\n.triangle-border.right:before \n\n{\n	top:10px; \n	bottom:auto;\n    left:auto;\n	right:-30px; \n	border-width:15px 0 15px 30px;\n	border-color:transparent #7cc6de !important;\n        \n}\n\n\n.triangle-border.right:after \n\n{\n	top:16px; \n	bottom:auto;\n    left:auto;\n	right:-21px; \n	border-width:9px 0 9px 21px;\n	border-color:transparent #fff;\n        \n}";
if (typeof GM_addStyle != "undefined") {
	GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
	PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
	addStyle(css);
} else {
	var heads = document.getElementsByTagName("head");
	if (heads.length > 0) {
		var node = document.createElement("style");
		node.type = "text/css";
		node.appendChild(document.createTextNode(css));
		heads[0].appendChild(node); 
	}
}
})();
