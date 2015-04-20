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

  // display he Word count
  var $words = wordCount($alltext);
  if ($words > 0) {
    $results.append('<h3>Word count: ' + $words + '</h3>');
    $results.append('<p>Make sure this meets the minimum number of words assigned for this essay.</p>');
  }

  // generic character checking function
  function checkChar(char, text) {
    return text.split("")
                   .filter(function(value) {return value === char})
                   .length;
  }

  // display number of semicolons
  var $semis = checkChar(";", $alltext);
  if ($semis > 0) {
    $results.append('<h3>Semicolons: ' + $semis + '</h3>');
    $results.append('<p>Semicolons are difficult to use correctly. Make sure each semicolon is used properly and not just a substitute for ", and".</p>');
  }

  // generic word checking function
  // ignores punctuation
  function checkTerms(term, text) {
    return text.replace(/[^\w\s]|_/g, "")
                   .replace(/\s+/g, " ")
                   .split(" ")
                   .filter(function(value) {return value === term})
                   .length;
  }
  // display uses of the word essay
  var $essay = checkTerms("essay", $alltext) + checkTerms("Essay", $alltext)
  if ($essay > 0) {
    $results.append('<h3>Uses of the word “essay”: ' + $essay + '</h3>');
    $results.append('<p>Please do not use the word “essay” when writing an essay, not even in the title.</p>');
  }

  // display uses of 1st and 2nd person terms
  var $I = checkTerms("I", $alltext);
  var $me = checkTerms("me", $alltext);
  var $we = checkTerms("we", $alltext) + checkTerms("We", $alltext);
  var $you = checkTerms("you", $alltext) + checkTerms("You", $alltext);
  var $pov = $I + $me +$we + $you; 
  if ($pov > 0) {
    $results.append('<h3>Uses of “I”: ' + $I + ', “me”: ' + $me + ', “we”: ' + $we + ', “you”: ' + $you + '</h3>');
    $results.append('<p>Please do write in 1st or 2nd person. Use 3rd person instead.</p>');
  }

  // a hopeful farewell
  $results.append('<h2>Good luck!</h2>');
}

// watch for input and display
$('textarea').on("input", essayChecker);


