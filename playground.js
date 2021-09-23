var sentence = "This is one sentence. This is a sentence with a list of items:cherries, oranges, apples, bananas.";
var msgchk_start = sentence.indexOf("z");
var msgchk_end = sentence.indexOf("x");

var msgchk_list = sentence.substring(msgchk_start, msgchk_end+1);
console.log(msgchk_list);   // cherries, oranges, apples, bananas

console.log("" == msgchk_list) // true



/*
TODO 조식기능 추가
TODO 내일 급식 시간 수정
TODO 주간 급식 추가
TODO 버튼 추가
 */

