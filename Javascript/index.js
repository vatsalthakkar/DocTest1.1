const fs = require('fs')
  , filename1 = "../Documents/base.txt",
  filename2="../Documents/test.txt";
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var path = require("path");
var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';
var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);
var stdNouns=[];
var stdVerbs=[];
var stdAdjectives=[];
var testNouns=[];
var testVerbs=[];
var testAdjectives=[];

//Reading the standard file
var stdData=fs.readFileSync(filename1, 'utf8');
var stdWords=tokenizer.tokenize(stdData);
var stdTag=tagger.tag(stdWords); //POS tagger to get verbs,nouns etc.

//Reading the test file
var testData=fs.readFileSync(filename2, 'utf8');
var testWords=tokenizer.tokenize(testData);
var testTag=tagger.tag(testWords);//POS tagger to get verbs,nouns etc.


//Looking for POS in standard document
for(var i=0;i<stdTag.length;i++){

	//if the word is noun add in noun array
	if(stdTag[i][1]=='NN'|'NNS'|'NNP'|'NNPS'){
		stdNouns.push(stdTag[i][0]);
	}
	//else if the word is adjective add in adjective array
	else if(stdTag[i][1]=='JJ'|'JJS'|'JJR'){
		stdAdjectives.push(stdTag[i][0]);
	}
	//if the word is verb add in verb array
	else if(stdTag[i][1]=='VB'|'VBD'|'VBG'|'VBN'|'VBP'|'VBZ'){
		stdVerbs.push(stdTag[i][0]);
	}
}

//Looking for POS in test document
for(var i=0;i<testTag.length;i++){

	//if the word is noun add in noun array
	if(testTag[i][1]=='NN'|'NNS'|'NNP'|'NNPS'){
		testNouns.push(testTag[i][0]);
	}
	//else if the word is adjective add in adjective array
	else if(testTag[i][1]=='JJ'|'JJS'|'JJR'){
		testAdjectives.push(testTag[i][0]);
	}
	//if the word is verb add in verb array
	else if(testTag[i][1]=='VB'|'VBD'|'VBG'|'VBN'|'VBP'|'VBZ'){
		testVerbs.push(testTag[i][0]);
	}
}


//finding the similarity between both documents
var match = natural.JaroWinklerDistance(testData,stdData);


//Looking for spelling mistakes w.r.t standard document
var corpus = stdWords;
var spellcheck = new natural.Spellcheck(corpus);
var spellErr=0;
for(var i=0;i<testWords.length;i++){
	if(!spellcheck.isCorrect(testWords[i])){
		spellErr++;
	}
}

//Validating word count
var status;
var note;
var marks=0;
var wordRange=(stdWords*15)/100;
if(testWords.length<=stdWords.length-wordRange  || testWords.length>=stdWords.length+wordRange){
	status="REJECTED";
	note="Word count in test document is out of the allowed range";
	console.log("DOCUMENT REJECTED");
}
else{
	status="ACCEPTED";
	var deduct= (100*spellErr)/testWords.length;
	marks=(match*100)-deduct;
	console.log('Similarity between test and base:'+(marks*100)+'%');
	if(marks>=80){
		note="DISTINCTION DOCUMENT";
	}
	else if(marks>=60){
		note="FIRST CLASS DOCUMENT";
	}
	else if(marks>=35){
		note="SECOND CLASS DOCUMENT";
	}
	else{
		note="EXTREMELY POOR DOCUMENT"
	}
}

createJSON();

function createJSON(){
	var result={
		base:{
			word_count:stdWords.length,
			nouns: stdNouns.length,
			adjectives: stdAdjectives.length,
			verbs: stdVerbs.length
		},
		test:{
			word_count:testWords.length,
			nouns: testNouns.length,
			adjectives: testAdjectives.length,
			verbs: testVerbs.length
		},
		verdict:{
			testStatus: status,
			testScore: (marks),
			testNotes: note
		}
	}

	var jsonData = JSON.stringify(result,null,2);
	fs.writeFileSync("../JSON/output.json",jsonData);
}
