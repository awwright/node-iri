"use strict";

var assert = require('assert').strict;
var iri = require('../');
var IRI = iri.IRI;

function testConversion(irival, urival){
	it(irival, function(){
		assert.equal(new IRI(irival).toURIString(), urival);
		assert.equal(new IRI(urival).toIRIString(), irival);
	});
}

describe('Interface', function(){
	describe("new IRI(<http://example.com/>)", function(){
		var t = new IRI('http://example.com/');
		it(".nodeType() === 'IRI'", function(){ assert.equal(t.scheme(), 'http'); });
		it(".toNT()", function(){ assert.equal(t.toNT(), '<http://example.com/>'); });
		it(".n3()", function(){ assert.equal(t.n3(), '<http://example.com/>'); });
		it(".defrag() is self", function(){ assert.equal(t.defrag().value, 'http://example.com/'); });
		it(".isAbsolute() is true", function(){ assert.equal(t.isAbsolute(), true); });
		it(".toAbsolute() is self", function(){ assert.equal(t.toAbsolute().value, 'http://example.com/'); });
		it(".authority() === 'example.com'", function(){ assert.equal(t.authority(), 'example.com'); });
		it(".fragment() is null", function(){ assert.equal(t.fragment(), null); });
		it(".hierpart() === '//example.com/'", function(){ assert.equal(t.hierpart(), '//example.com/'); });
		it(".host() === 'example.com'", function(){ assert.equal(t.host(), 'example.com'); });
		it(".path() === '/'", function(){ assert.equal(t.path(), '/'); });
		it(".port() is null", function(){ assert.equal(t.port(), null); });
		it(".query() is null", function(){ assert.equal(t.query(), null); });
		it(".resolveReference(absoluteURI)", function(){ assert.equal(t.resolveReference('http://xyz.example.org/123').value, 'http://xyz.example.org/123'); });
		it(".resolveReference(path)", function(){ assert.equal(t.resolveReference('/a/b/c').value, 'http://example.com/a/b/c'); });
		it(".resolveReference(authority)", function(){ assert.equal(t.resolveReference('//example.org/1?x').value, 'http://example.org/1?x'); });
		it(".resolveReference(relative)", function(){ assert.equal(t.resolveReference('b/c.js').value, 'http://example.com/b/c.js'); });
		it(".resolveReference(decend)", function(){ assert.equal(t.resolveReference('../..').value, 'http://example.com/'); });
		it(".resolveReference(query)", function(){ assert.equal(t.resolveReference('?query').value, 'http://example.com/?query'); });
		it(".scheme() === 'http'", function(){ assert.equal(t.scheme(), 'http'); });
		it(".userinfo() is null", function(){ assert.equal(t.userinfo(), null); });
	});
	describe("(new iri.IRI(<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>))", function(){
		var t = new iri.IRI('https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455');
		it(".nodeType() === 'IRI'", function(){ assert.equal(t.nodeType(), 'IRI'); });
		it(".toNT()", function(){ assert.equal(t.toNT(), '<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>'); });
		it(".n3()", function(){ assert.equal(t.n3(), '<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>'); });
		it(".defrag() strips fragment", function(){ assert.equal(t.defrag().value, 'https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2'); });
		it(".isAbsolute() is false", function(){ assert.equal(t.isAbsolute(), false); });
		it(".toAbsolute() strips fragment", function(){ assert.equal(t.toAbsolute().value, 'https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2'); });
		it(".authority() === 'user:pass@a.example.com:8080'", function(){ assert.equal(t.authority(), 'user:pass@a.example.com:8080'); });
		it(".fragment()", function(){ assert.equal(t.fragment(), '#455'); });
		it(".hierpart()", function(){ assert.equal(t.hierpart(), '//user:pass@a.example.com:8080/b/c/d/'); });
		it(".host() === 'a.example.com'", function(){ assert.equal(t.host(), 'a.example.com'); });
		it(".path() === '/b/c/d/?123&aa=1&aa=2'", function(){ assert.equal(t.path(), '/b/c/d/'); });
		it(".port() is '8080'", function(){ assert.equal(t.port(), '8080'); });
		it(".query()", function(){ assert.equal(t.query(), '?123&aa=1&aa=2'); });
		it(".resolveReference(absoluteURI)", function(){ assert.equal(t.resolveReference('http://xyz.example.org/123').value, 'http://xyz.example.org/123'); });
		it(".resolveReference(path)", function(){ assert.equal(t.resolveReference('/a/b/c').value, 'https://user:pass@a.example.com:8080/a/b/c'); });
		it(".resolveReference(authority)", function(){ assert.equal(t.resolveReference('//example.org/1?x').value, 'https://example.org/1?x'); });
		it(".resolveReference(relative)", function(){ assert.equal(t.resolveReference('b/c.js').value, 'https://user:pass@a.example.com:8080/b/c/d/b/c.js'); });
		it(".resolveReference(cwd)", function(){ assert.equal(t.resolveReference('.').value, 'https://user:pass@a.example.com:8080/b/c/d/'); });
		it(".resolveReference(decend)", function(){ assert.equal(t.resolveReference('../..').value, 'https://user:pass@a.example.com:8080/b/'); });
		it(".resolveReference(query)", function(){ assert.equal(t.resolveReference('?query').value, 'https://user:pass@a.example.com:8080/b/c/d/?query'); });
		it(".scheme() === 'https'", function(){ assert.equal(t.scheme(), 'https'); });
		it(".userinfo()", function(){ assert.equal(t.userinfo(), 'user:pass'); });
	});
	describe("(new iri.IRI(<http://a/b/c/d;p?q>))", function(){
		// The examples from RFC 3986
		var t = new iri.IRI('http://a/b/c/d;p?q');
		it(".resolveReference(<g:h>)", function(){ assert.equal(t.resolveReference("g:h").value, "g:h"); });
		it(".resolveReference(<g>)", function(){ assert.equal(t.resolveReference("g").value, "http://a/b/c/g"); });
		it(".resolveReference(<./g>)", function(){ assert.equal(t.resolveReference("./g").value, "http://a/b/c/g"); });
		it(".resolveReference(<g/>)", function(){ assert.equal(t.resolveReference("g/").value, "http://a/b/c/g/"); });
		it(".resolveReference(</g>)", function(){ assert.equal(t.resolveReference("/g").value, "http://a/g"); });
		it(".resolveReference(<//g>)", function(){ assert.equal(t.resolveReference("//g").value, "http://g"); });
		it(".resolveReference(<?y>)", function(){ assert.equal(t.resolveReference("?y").value, "http://a/b/c/d;p?y"); });
		it(".resolveReference(<g?y>)", function(){ assert.equal(t.resolveReference("g?y").value, "http://a/b/c/g?y"); });
		it(".resolveReference(<#s>)", function(){ assert.equal(t.resolveReference("#s").value, "http://a/b/c/d;p?q#s"); });
		it(".resolveReference(<g#s>)", function(){ assert.equal(t.resolveReference("g#s").value, "http://a/b/c/g#s"); });
		it(".resolveReference(<g?y#s>)", function(){ assert.equal(t.resolveReference("g?y#s").value, "http://a/b/c/g?y#s"); });
		it(".resolveReference(<;x>)", function(){ assert.equal(t.resolveReference(";x").value, "http://a/b/c/;x"); });
		it(".resolveReference(<g;x>)", function(){ assert.equal(t.resolveReference("g;x").value, "http://a/b/c/g;x"); });
		it(".resolveReference(<g;x?y#s>)", function(){ assert.equal(t.resolveReference("g;x?y#s").value, "http://a/b/c/g;x?y#s"); });
		it(".resolveReference(<>)", function(){ assert.equal(t.resolveReference("").value, "http://a/b/c/d;p?q"); });
		it(".resolveReference(<.>)", function(){ assert.equal(t.resolveReference(".").value, "http://a/b/c/"); });
		it(".resolveReference(<./>)", function(){ assert.equal(t.resolveReference("./").value, "http://a/b/c/"); });
		it(".resolveReference(<..>)", function(){ assert.equal(t.resolveReference("..").value, "http://a/b/"); });
		it(".resolveReference(<../>)", function(){ assert.equal(t.resolveReference("../").value, "http://a/b/"); });
		it(".resolveReference(<../g>)", function(){ assert.equal(t.resolveReference("../g").value, "http://a/b/g"); });
		it(".resolveReference(<../..>)", function(){ assert.equal(t.resolveReference("../..").value, "http://a/"); });
		it(".resolveReference(<../../>)", function(){ assert.equal(t.resolveReference("../../").value, "http://a/"); });
		it(".resolveReference(<../../g>)", function(){ assert.equal(t.resolveReference("../../g").value, "http://a/g"); });
		it(".resolveReference(<../../../g>)", function(){ assert.equal(t.resolveReference("../../../g").value, "http://a/g"); });
		it(".resolveReference(<../../../../g>)", function(){ assert.equal(t.resolveReference("../../../../g").value, "http://a/g"); });
		it(".resolveReference(</./g>)", function(){ assert.equal(t.resolveReference("/./g").value, "http://a/g"); });
		it(".resolveReference(</../g>)", function(){ assert.equal(t.resolveReference("/../g").value, "http://a/g"); });
		it(".resolveReference(<g.>)", function(){ assert.equal(t.resolveReference("g.").value, "http://a/b/c/g."); });
		it(".resolveReference(<.g>)", function(){ assert.equal(t.resolveReference(".g").value, "http://a/b/c/.g"); });
		it(".resolveReference(<g..>)", function(){ assert.equal(t.resolveReference("g..").value, "http://a/b/c/g.."); });
		it(".resolveReference(<..g>)", function(){ assert.equal(t.resolveReference("..g").value, "http://a/b/c/..g"); });
		it(".resolveReference(<./../g>)", function(){ assert.equal(t.resolveReference("./../g").value, "http://a/b/g"); });
		it(".resolveReference(<./g/.>)", function(){ assert.equal(t.resolveReference("./g/.").value, "http://a/b/c/g/"); });
		it(".resolveReference(<g/./h>)", function(){ assert.equal(t.resolveReference("g/./h").value, "http://a/b/c/g/h"); });
		it(".resolveReference(<g/../h>)", function(){ assert.equal(t.resolveReference("g/../h").value, "http://a/b/c/h"); });
		it(".resolveReference(<g;x=1/./y>)", function(){ assert.equal(t.resolveReference("g;x=1/./y").value, "http://a/b/c/g;x=1/y"); });
		it(".resolveReference(<g;x=1/../y>)", function(){ assert.equal(t.resolveReference("g;x=1/../y").value, "http://a/b/c/y"); });
		it(".resolveReference(<g?y/./x>)", function(){ assert.equal(t.resolveReference("g?y/./x").value, "http://a/b/c/g?y/./x"); });
		it(".resolveReference(<g?y/../x>)", function(){ assert.equal(t.resolveReference("g?y/../x").value, "http://a/b/c/g?y/../x"); });
		it(".resolveReference(<g#s/./x>)", function(){ assert.equal(t.resolveReference("g#s/./x").value, "http://a/b/c/g#s/./x"); });
		it(".resolveReference(<g#s/../x>)", function(){ assert.equal(t.resolveReference("g#s/../x").value, "http://a/b/c/g#s/../x"); });
	});
	describe("IRI to URI conversion", function(){
		var t = new IRI('http://www.example.org/red%09ros\xE9#red');
		it(".toURIString()", function(){ assert.equal(t.toURIString(), "http://www.example.org/red%09ros%C3%A9#red"); });
	});
	describe("IRI to URI conversion with surrogate pairs", function(){
		var t = new IRI('http://example.com/\uD800\uDF00\uD800\uDF01\uD800\uDF02');
		it(".toURIString()", function(){ assert.equal(t.toURIString(), "http://example.com/%F0%90%8C%80%F0%90%8C%81%F0%90%8C%82"); });
	});
	describe("IRI<->URI conversion", function(){
		describe("Standard examples", function(){
			testConversion('http://www.example.org/red%09ros\xE9#red', 'http://www.example.org/red%09ros%C3%A9#red');
			testConversion('http://example.com/\uD800\uDF00\uD800\uDF01\uD800\uDF02', 'http://example.com/%F0%90%8C%80%F0%90%8C%81%F0%90%8C%82');
			testConversion('http://www.example.org/r\xE9sum\xE9.html', 'http://www.example.org/r%C3%A9sum%C3%A9.html');
			testConversion('http://www.example.org/%2F', 'http://www.example.org/%2F');
		});
		describe("Reserved characters are not encoded", function(){
			testConversion('http://www.example.org/%3A', 'http://www.example.org/%3A');
			testConversion('http://www.example.org/%2F', 'http://www.example.org/%2F');
			testConversion('http://www.example.org/%3F', 'http://www.example.org/%3F');
			testConversion('http://www.example.org/%23', 'http://www.example.org/%23');
			testConversion('http://www.example.org/%5B', 'http://www.example.org/%5B');
			testConversion('http://www.example.org/%5D', 'http://www.example.org/%5D');
			testConversion('http://www.example.org/%40', 'http://www.example.org/%40');
			testConversion('http://www.example.org/%20', 'http://www.example.org/%20');
			testConversion('http://www.example.org/%21', 'http://www.example.org/%21');
			testConversion('http://www.example.org/%24', 'http://www.example.org/%24');
			testConversion('http://www.example.org/%26', 'http://www.example.org/%26');
			testConversion('http://www.example.org/%27', 'http://www.example.org/%27');
			testConversion('http://www.example.org/%28', 'http://www.example.org/%28');
			testConversion('http://www.example.org/%29', 'http://www.example.org/%29');
			testConversion('http://www.example.org/%2A', 'http://www.example.org/%2A');
			testConversion('http://www.example.org/%2B', 'http://www.example.org/%2B');
			testConversion('http://www.example.org/%2C', 'http://www.example.org/%2C');
			testConversion('http://www.example.org/%3B', 'http://www.example.org/%3B');
			testConversion('http://www.example.org/%3D', 'http://www.example.org/%3D');
		});
	});
});
