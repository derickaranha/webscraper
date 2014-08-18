var cheerio = require('cheerio');
var http = require('http');
var url = require('url');

exports.showPage = function(req, res) {
	var urlString = req.query.siteUrl;
	console.log("Site URL: "+ urlString);
	if(urlString == undefined) { 
		writePage(res);
		return ; 
	}

	var urlObj = url.parse(urlString);
	var pathName = urlObj.path;
	var hostName = urlObj.host;
	if(hostName == null) {
		writePage(res);
		return ;
	}
	console.log("Host: "+ hostName + ", Path: "+ pathName);
	var req_opts = {
		host: hostName,
		path: pathName
	};
	getDetailsForURL(req_opts, res);
};


function writePage(res, textObj){
	res.writeHead(200, {
		"Content-Type": "text/html"
	});
	res.write("<html><head><meta charset='UTF-8' />");
	res.write("</head><body><table>");
	if(textObj != undefined){
		res.write(JSON.stringify(textObj, null, '\t'));
	} else {
		res.write("Invalid URL");
	}
	res.end("</table></body></html>");
}


/**
* Returns JSON object with details for every word 
* contained in a <p> tag.
* Input requires a HTML URL
*/
function getDetailsForURL(req_opts, res) {
	var response_text = "";
	var textDetails = {};
	var request = http.request(req_opts, function(resp) {
		if (resp.statusCode != 200) {
			console.log("Unexpected Response code: "+ resp.statusCode);
			//throw "Error: " + resp.statusCode;
		};
		resp.setEncoding("utf8");
		resp.on("data", function(chunk) {
			response_text += chunk;
		});
		resp.on("end", function() {
			textDetails = getDetailsForText(response_text);
			writePage(res, textDetails);
		});

	});
	request.on("error", function(e) {
		console.log("Error Message: "+ e.message);
		//throw "Error: " + e.message;
	});

	request.end();
	return textDetails;
}


/**
* Returns JSON object with details for every word 
* contained in a <p> tag.
* Input requires HTML text
*/
function getDetailsForText(htmlText) {
	$ = cheerio.load(htmlText);
	//console.log(htmlText);
	var txtDetails = [];
	$("p").each(function(i, txt) {
		var pDets = {
			'default': {},
			'ele-details': []
		};
		txtDetails.push(getTextDetails($(txt), pDets));
	});
	return txtDetails;

}

function getTextDetails(node, dets) {
	var chLength = node.length;
	for (var k = 0; k < chLength; k++) {
		var ele = node[k];
		if (ele.type == "tag") {
			var cloneDetails = getDeepClone(dets);
			if (ele.name == "font") {
				cloneDetails.default['font-size'] = $(ele).attr("size");
				cloneDetails.default['color'] = $(ele).attr("color");
			} else if (ele.name == 'b') {
				cloneDetails.default['bold'] = true;
			} else if (ele.name == 'strong' || $(ele).css('font-weight') == 'bold') {
				cloneDetails.default['bold'] = true;
			} else if (ele.name == 'i' || ele.name == 'em' || $(ele).css('font-style') == 'italic') {
				cloneDetails.default['italic'] = true;
			} else if (ele.name == 'u' || $(ele).css('text-decoration') == 'underline') {
				cloneDetails.default['underline'] = true;
			}
			if ($(ele).css('font-size') != undefined) {
				cloneDetails.default['font-size'] = $(ele).css('font-size');
			}
			if ($(ele).css('color') != undefined) {
				cloneDetails.default['color'] = $(ele).css('color');
			}
			getTextDetails(ele.children, cloneDetails);
		} else if (ele.type == "text" && matchFilterExpression(ele.data)) {

			var dataArray = ele.data.split(' ');
			for (var n = 0; n < dataArray.length; n++) {
				var m = {};
				m[dataArray[n]] = dets.default;
				dets['ele-details'].push(m);
			}
		}
	}
	return dets['ele-details'];
};

/**
* Additional Filtering for Text
*/
function matchFilterExpression(txt){
	return /[a-zA-Z]/.test(txt);
}

function getDeepClone(oldObject) {
	var newObject = {
		'default': {},
		'ele-details': []
	};
	newObject['default']['font-size'] = oldObject['default']['font-size'];
	newObject['default']['bold'] = oldObject['default']['bold'];
	newObject['default']['italic'] = oldObject['default']['italic'];
	newObject['default']['underline'] = oldObject['default']['underline'];
	newObject['default']['color'] = oldObject['default']['color'];
	newObject['ele-details'] = oldObject['ele-details'];
	return newObject;
}

var testHTML = "<html><head><style type=\"text/css\">p.style1{ font-size: 11px;color: blue;}</style></head><body>" +
	"<div>" +
	"<p><font size=\"10\">First para with font size tag. This is <b><i>some</i></b> sample text</font></p>" +
	"<p style=\"font-size:12px;\">Second para with a style attribute (no space after font-size). <u>This <i>is</i></u> <b>some</b> sample <b>text</b> </p>" +
	"<p style=\"font-size :12px;color:red\">Third para with a style attribute. This is <b>some</b> sample text </p>" +
	"<p class=\"style1\">Fourth para with css class attribute. This is <b>some</b> sample text </p>" +
	"</div></body></html>";