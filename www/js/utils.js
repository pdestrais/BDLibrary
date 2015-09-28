/**
 * Utility methods
 */

function createDesignDoc(name, mapFunction, reduceFunction) {
  var ddoc = {
    _id: '_design/' + name,
    views: {
    }
  };
  if (reduceFunction)
	  ddoc.views[name] = { map: mapFunction.toString(), reduce: reduceFunction.toString() };
  else
	  ddoc.views[name] = { map: mapFunction.toString() };
  return ddoc;
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
//        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
// modified version to return 32 characters as a cloudant id
        return s ? p.substr(0,4) + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function showText (htmlId, message, secs) {
	$(htmlId).text(message);
	$(htmlId).show();
	setTimeout(function() {
	    $("htmlId").fadeOut(1000);
	}, secs*1000);

}

function fixedEncodeURIComponent (str) {
	  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
	    return '%' + c.charCodeAt(0).toString(16);
	  });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function cleanText(textToClean) {
  textToClean = textToClean.replace(/\t/g, '');
  textToClean = textToClean.replace(/\n/g, '');
  return textToClean;
}
