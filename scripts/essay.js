// cache $results to avoid memory problems
var $results = $('.results');

// all functionality resides in essayChecker
function essayChecker() {

  // clear results after any change
  // also removes initial instructions
  $results.empty();

  // variable for the submitted essay
  // trimmed of extra white space and line breaks
  var $alltext = $("#main_text").val().trim().replace(/(\r\n|\n|\r)/gm," ");

  // wordCount returns the number of words in the essay
  function wordCount(text) {
    return text.replace(/[^\w\s]|_/g, "")
               .replace(/\s+/g, " ")
               .split(" ")
               .filter(function(value) {return value !== ""})
               .length;
  }

  // display the Word count
  var $words = wordCount($alltext);
  if ($words > 0) {
    $results.append('<h3>Word count: ' + $words + '</h3>').hide().delay(500).fadeIn(500);
    $results.append('<p>Make sure this meets the minimum number of words assigned for this essay.</p>');
  }

  // generic character checking function
  function checkChar(char, text) {
    return text.split("")
               .filter(function(value) {return value === char})
               .length;
  }

  // generic word checking function
  // ignores punctuation
  function checkTerm(term, text) {
    return text.replace(/[^\w\s]|_/g, "")
                .replace(/\s+/g, " ")
                .split(" ")
                .filter(function(value) {return value === term})
                .length;
  }  

  // element checking function factory
  function checkText(type, element) {
      return function(text) {
        return type(element, text);
      }
  }

  // create semicolon counting function
  var semicolonCounter = checkText(checkChar, ";");
  // determine no. of semicolons and assign it to a variable.
  var $semis = semicolonCounter($alltext);
  // display number of semicolons
  if ($semis > 0) {
    $results.append('<h3>Semicolons: ' + $semis + '</h3>');
    $results.append('<p>Semicolons are difficult to use correctly. Make sure each semicolon is not just a substitute for ", and".</p>');
  }

  // create exclamation counting function
  var exclamationCounter = checkText(checkChar, "!");
  // determine no. of exclamations and assign it to a variable.
  var $exclamations = exclamationCounter($alltext);
  // display number of exclamations
  if ($exclamations > 0) {
    $results.append('<h3>Exclamation points: ' + $exclamations + '</h3>');
    $results.append('<p>Are you excited? Why are you using exlamation points? Try to cut this down.</p>');
  }

  // create essay counting function
  var essayCounter = checkText(checkTerm, "essay");
  // determine no. of essays and assign it to a variable.
  var $essay = essayCounter($alltext);
  // display uses of the word essay
  if ($essay > 0) {
    $results.append('<h3>Uses of the word “essay”: ' + $essay + '</h3>');
    $results.append('<p>Please do not use the word “essay” when writing an essay, not even in the title.</p>');
  }

  // create 1st and 2nd person counting functions
  var ICounter = checkText(checkTerm, "I");
  var meCounter = checkText(checkTerm, "me");
  var weCounter = checkText(checkTerm, "we");
  var youCounter = checkText(checkTerm, "you");
  // display uses of 1st and 2nd person terms
  var $I = ICounter($alltext);
  var $me = meCounter($alltext);
  var $we = weCounter($alltext);
  var $you = youCounter($alltext);
  var $pov = $I + $me +$we + $you; 
  if ($pov > 0) {
    $results.append('<h3>Uses of “I”: ' + $I + ', “me”: ' + $me + ', “we”: ' + $we + ', “you”: ' + $you + '</h3>');
    $results.append('<p>Please do write in 1st or 2nd person. Use 3rd person instead.</p>');
  }

  // a hopeful farewell
  $results.append('<h2>Good luck!</h2>');
  $results.append('<p class="resubmit">(To submit another essay, refresh this page.)</p>');
  $('.text-box').fadeOut(500);
}

// watch for input and display
$('button').click(essayChecker);
