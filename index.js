var api = exports;

api.encodeString = function encodeString(s) {
	var out = "";
	var skip = false;
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(!skip) {
			var code = s.charCodeAt(i);
			if(55296 <= code && code <= 56319) {
				var low = s.charCodeAt(i + 1);
				code = (code - 55296) * 1024 + (low - 56320) + 65536;
				skip = true;
			}
			if(code > 1114111) { throw new Error("Char out of range"); }
			var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
			if(code >= 65536) {
				out += "\\U" + hex.slice(-8);
			} else {
				if(code >= 127 || code <= 31) {
					switch(code) {
						case 9:	out += "\\t"; break;
						case 10: out += "\\n"; break;
						case 13: out += "\\r"; break;
						default: out += "\\u" + hex.slice(-4); break;
					}
				} else {
					switch(code) {
						case 34: out += '\\"'; break;
						case 92: out += "\\\\"; break;
						default: out += s.charAt(i); break;
					}
				}
			}
		} else {
			skip = !skip;
		}
	}
	return out;
}

/**
 * IRI
 */
api.IRI = IRI;
function IRI(iri) { this.value = iri; };
IRI.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
//IRI.prototype = new api.RDFNode;
IRI.prototype.toString = function toString() { return this.value; }
IRI.prototype.nodeType = function nodeType() { return "IRI"; };
IRI.prototype.toNT = function toNT() { return "<" + api.encodeString(this.value) + ">"; };
IRI.prototype.n3 = function n3() { return this.toNT(); }
IRI.prototype.defrag = function defrag() {
	var i = this.value.indexOf("#");
	return (i < 0) ? this : new IRI(this.value.slice(0, i));
}
IRI.prototype.isAbsolute = function isAbsolute() {
	return this.scheme()!=null && this.hierpart()!=null && this.fragment()==null;
}
IRI.prototype.toAbsolute = function toAbsolute() {
	if(this.scheme() == null || this.hierpart() == null) { throw new Error("IRI must have a scheme and a hierpart!"); }
	return this.resolveReference(this.value).defrag();
}
IRI.prototype.getAuthority = function authority() {
	var hierpart = this.hierpart();
	if(hierpart.substring(0, 2) != "//") return null;
	var authority = hierpart.slice(2);
	var q = authority.indexOf("/");
	return q>=0 ? authority.substring(0, q) : authority;
}
IRI.prototype.getFragment = function fragment() {
	var i = this.value.indexOf("#");
	return (i<0) ? null : this.value.slice(i);
}
IRI.prototype.getHierpart = function hierpart() {
	var hierpart = this.value;
	var q = hierpart.indexOf("?");
	if(q >= 0) {
		hierpart = hierpart.substring(0, q);
	} else {
		q = hierpart.indexOf("#");
		if(q >= 0) hierpart = hierpart.substring(0, q);
	}
	var q2 = this.scheme();
	if(q2 != null) hierpart = hierpart.slice(1 + q2.length);
	return hierpart;
}
IRI.prototype.getHost = function host() {
	var host = this.authority();
	var q = host.indexOf("@");
	if(q >= 0) host = host.slice(++q);
	if(host.indexOf("[") == 0) {
		q = host.indexOf("]");
		if(q > 0) return host.substring(0, q);
	}
	q = host.lastIndexOf(":");
	return q >= 0 ? host.substring(0, q) : host;
}
IRI.prototype.getPath = function path() {
	var q = this.authority();
	if(q == null) return this.hierpart();
	return this.hierpart().slice(q.length + 2);
}
IRI.prototype.getPort = function port() {
	var host = this.authority();
	var q = host.indexOf("@");
	if(q >= 0) host = host.slice(++q);
	if(host.indexOf("[") == 0) {
		q = host.indexOf("]");
		if(q > 0) return host.substring(0, q);
	}
	q = host.lastIndexOf(":");
	if(q < 0) return null;
	host = host.slice(++q);
	return host.length == 0 ? null : host;
}
IRI.prototype.getQuery = function query() {
	var q = this.value.indexOf("?");
	if(q < 0) return null;
	var f = this.value.indexOf("#");
	if(f < 0) return this.value.slice(q);
	return this.value.substring(q, f)
}
api.removeDotSegments = function removeDotSegments(input) {
	var output = "";
	var q = 0;
	while(input.length > 0) {
		if(input.substr(0, 3) == "../" || input.substr(0, 2) == "./") {
			input = input.slice(input.indexOf("/"));
		}else if(input == "/.") {
			input = "/";
		}else if(input.substr(0, 3) == "/./") {
			input = input.slice(2);
		}else if(input.substr(0, 4) == "/../" || input == "/..") {
			input = (input=="/..") ? "/" : input.slice(3);
			q = output.lastIndexOf("/");
			output = (q>=0) ? output.substring(0, q) : "";
		}else if(input.substr(0, 2) == ".." || input.substr(0, 1) == ".") {
			input = input.slice(input.indexOf("."));
			q = input.indexOf(".");
			if(q >= 0) input = input.slice(q);
		}else {
			if(input.substr(0, 1) == "/") {
				output += "/";
				input = input.slice(1);
			}
			q = input.indexOf("/");
			if(q < 0) {
				output += input;
				input = "";
			}else {
				output += input.substring(0, q);
				input = input.slice(q);
			}
		}
	}
	return output;
}
IRI.prototype.resolveReference = function resolveReference(ref) {
	var reference;
	if(typeof ref == "string") {
		reference = new IRI(ref);
	}else if(ref.nodeType && ref.nodeType() == "IRI") {
		reference = ref;
	}else {
		throw new Error("Expected IRI or String");
	}
	var T = {scheme:"", authority:"", path:"", query:"", fragment:""};
	var q = "";
	if(reference.scheme() != null) {
		T.scheme = reference.scheme();
		q = reference.authority();
		T.authority += q!=null ? "//"+q : "";
		T.path = api.removeDotSegments(reference.path());
		T.query += reference.query()||'';
	}else {
		q = reference.authority();
		if(q != null) {
			T.authority = q!=null ? "//"+q : "";
			T.path = api.removeDotSegments(reference.path());
			T.query += reference.query()||'';
		}else {
			q = reference.path();
			if(q == "" || q == null) {
				T.path = this.path();
				q = reference.query();
				if(q != null) {
					T.query += q;
				}else {
					q = this.query();
					T.query += q!=null ? q : "";
				}
			}else {
				if(q.substring(0, 1) == "/") {
					T.path = api.removeDotSegments(q);
				}else {
					if(this.path() != null) {
						var q2 = this.path().lastIndexOf("/");
						if(q2 >= 0) {
							T.path = this.path().substring(0, ++q2);
						}
						T.path += reference.path();
					}else {
						T.path = "/" + q
					}
					T.path = api.removeDotSegments(T.path);
				}
				T.query += reference.query()||'';
			}
			q = this.authority();
			T.authority = q!=null ? "//" + q : "";
		}
		T.scheme = this.scheme();
	}
	T.fragment = reference.fragment()||'';
	return new IRI(T.scheme + ":" + T.authority + T.path + T.query + T.fragment);
}
IRI.prototype.getScheme = function scheme() {
	var scheme = this.value.match(IRI.SCHEME_MATCH);
	return (scheme == null) ? null : scheme.shift().slice(0, -1);
}
IRI.prototype.getUserinfo = function userinfo() {
	var authority = this.authority();
	var q = authority.indexOf("@");
	return (q < 0) ? null : authority.substring(0, q);
}
IRI.prototype.toURIString = function toURIString(){
	return this.value.replace(/([\uA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g, function(a){return encodeURI(a);});
}
IRI.prototype.toIRIString = function toIRIString(){
	// HEXDIG requires capital characters
	// 80-BF is following bytes, (%[89AB][0-9A-F])
	// 00-7F no bytes follow (%[0-7][0-9A-F])(%[89AB][0-9A-F]){0}
	// C0-DF one byte follows (%[CD][0-9A-F])(%[89AB][0-9A-F]){1}
	// E0-EF two bytes follow (%[E][0-9A-F])(%[89AB][0-9A-F]){2}
	// F0-F7 three bytes follow (%[F][0-7])(%[89AB][0-9A-F]){3}
	// F8-FB four bytes follow (%[F][89AB])(%[89AB][0-9A-F]){4}
	// FC-FD five bytes follow (%[F][CD])(%[89AB][0-9A-F]){5}
	var utf8regexp = /%([2-7][0-9A-F])|%[CD][0-9A-F](%[89AB][0-9A-F])|%[E][0-9A-F](%[89AB][0-9A-F]){2}|%[F][0-7](%[89AB][0-9A-F]){3}|%[F][89AB](%[89AB][0-9A-F]){4}|%[F][CD](%[89AB][0-9A-F]){5}/g;
	// reserved characters := gen-delims, space, and sub-delims
	// : / ? # [ ] @   ! $ & ' ( ) * + , ; =
	var reserved = [ '3A', '2F', '3F', '23', '5B', '5D', '40', '20', '21', '24', '26', '27', '28', '29', '2A', '2B', '2C', '3B', '3D'];
	var iri = this.toString().replace(utf8regexp, function(a, b){
		if(reserved.indexOf(b)>=0) return a;
		return decodeURIComponent(a);
	});
	return iri;
}

IRI.prototype.toIRI = function toIRI(){
	return new IRI(this.toIRIString());
}

// Alias old names to new ones
IRI.prototype.authority = IRI.prototype.getAuthority;
IRI.prototype.hierpart = IRI.prototype.getHierpart;
IRI.prototype.scheme = IRI.prototype.getScheme;
IRI.prototype.path = IRI.prototype.getPath;
IRI.prototype.query = IRI.prototype.getQuery;
IRI.prototype.fragment = IRI.prototype.getFragment;
IRI.prototype.userinfo = IRI.prototype.getUserinfo;
IRI.prototype.host = IRI.prototype.getHost;
IRI.prototype.port = IRI.prototype.getPort;

// Create a new IRI object and decode UTF-8 escaped characters
api.fromURI = function fromURI(uri){
	return new IRI(uri).toIRI();
}

api.toIRIString = function toIRIString(uri){
	return new IRI(uri).toIRIString();
}
