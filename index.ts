export function jsonQueryStringify(query : any) : string {
	if(query !== null && typeof query === "object") {
		if("toJSON" in query){
			return encodeURIComponent(JSON.stringify(query));
		} else if(arrayLike(query)) {
			let json = "[";
			let first=true;
			for(let i=0;i<query.length;i++){
				if(first){ first = false; } else { json += "," }
				json += jsonQueryStringify(query[i]);
			}
			json += "]";
			return json;
		} else {
			let json = "{";
			let first = true;
			for (let property in query) {
				if (query.hasOwnProperty(property)) {
					if (first) {
						first = false;
					} else {
						json += "&"
					}
					let value: any = query[property];
					json += encodeURIComponent(quotePropertyIfNecessary(property)) + "=" + jsonQueryStringify(value);
				}
			}
			json += "}";
			return json;
		}
	} else return encodeURIComponent(JSON.stringify(query));
}

export function jsonQueryParse<T>(json : string) : T {
	json = decodeURIComponent(json);
	let index : number = 0;
	function consumeQuotedPropertyName() : string {
		let name = "\"";
		//Skip quote
		index += 1;
		while(json[index] != '"'){
			name += json[index];
			if(json[index] == '\\'){
				index += 1;
				name += json[index];
			}
			index += 1;
		}
		//Skip end quote
		index += 1;
		name += "\"";
		return JSON.parse(name);
	}
	function consumePropertyName() : string {
		let name = "";
		while(json[index] != "="){
			name += json[index];
			index += 1;
		}
		return name;
	}
	function consume() : any {
		let character = json[index];
		index += 1;
		if (character == "[") {
			let result: any[] = [];
			while(json[index] != "]"){
				result.push(consume());
				if(json[index] == ",") index += 1;
			}
			index += 1;
			return result as any as T;
		}
		else if (character == "{") {
			let result : any = {};
			while(json[index] != "}"){
				let propertyName : string;
				if(json[index] == '"'){
					propertyName = consumeQuotedPropertyName();
				} else {
					propertyName = consumePropertyName();
				}
				//Consume equals
				index += 1;
				//Consume value
				result[propertyName] = consume();
				if(json[index] == "&"){ index += 1; }
			}
			index += 1;
			return result as any as T;
		} else if (character == '"') {
			let str = '"';
			while(json[index] != '"'){
				str += json[index];
				if(json[index] == '\\'){
					index += 1;
					str += json[index];
				}
				index += 1;
			}
			str += '"';
			index += 1;
			return JSON.parse(str);
		} else if(character == 't') {
			index += 3;
			return true;
		} else if(character == 'n') {
			index += 3;
			return null;
		} else if(character == 'f') {
			index += 4;
			return false;
		} else if(character == 'u') {
			index += 8;
			return undefined;
		} else if(isNumericDeclarationStart.test(character)) {
			let number = character;
			while(isNumericDeclarationCharacter.test(json[index])){
				number += json[index];
				index += 1;
			}
			return JSON.parse(number);
		} else {
			throw new Error("Not expecting '" + character + "'");
		}
	}
	return consume() as T;
}

export function jsonQueryStringifyObjectBare(query : object) : string {
	let result = jsonQueryStringify(query);
	return result.substring(1, result.length - 1);
}

export function jsonQueryParseObjectBare<T>(json : string) : T {
	return jsonQueryParse<T>("{" + json + "}");
}


let quotesNecessary = /^"|[=]/;
function quotePropertyIfNecessary(str : string){
	if(quotesNecessary.test(str)){
		return JSON.stringify(str);
	} else {
		return str;
	}
}

let isNumericDeclarationCharacter = /[\deE+\-.]/;
let isNumericDeclarationStart = /[\-\d]/;
let isInteger = /\d+/;
function arrayLike(obj : object){
	if(!("length" in obj)){ return false; }
	for(let prop in obj){
		if(obj.hasOwnProperty(prop)) {
			if (prop !== "length" && !isInteger.test(prop)) {
				return false;
			}
		}
	}
	return true;
}
