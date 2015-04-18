// cache $results to avoid memory overages
var $results = $('.results');
// 
// all functionality resides in essayChecker
function essayChecker() {
  // clear results after any change
  $results.empty();

  // variable for the submitted essay
  var $alltext = $("#main_text").val().trim().replace(/(\r\n|\n|\r)/gm," ");

  function wordCount() {
    return $alltext.replace(/[^\w\s]|_/g, "")
                   .replace(/\s+/g, " ")
                   .split(" ")
                   .filter(function(value) {return value !== ""})
                   .length;
  }
  
  var $words = wordCount();
  if ($words > 0) {
    $results.append('<h3>Word count: ' + $words + '</h3>');
    $results.append('<p>Make sure this meets the minimum number of words assigned for this essay.</p>');
  }

  function checkChar(char) {
    return $alltext.split("")
                   .filter(function(value) {return value === char})
                   .length;
  }

  var $semis = checkChar(";");
  if ($semis > 0) {
    $results.append('<h3>Semicolons: ' + $semis + '</h3>');
    $results.append('<p>Semicolons are difficult to use correctly. Make sure each semicolon is used properly and not just a substitute for ", and".</p>');
  }

  function checkTerms(term) {
    return $alltext.replace(/[^\w\s]|_/g, "")
                   .replace(/\s+/g, " ")
                   .split(" ")
                   .filter(function(value) {return value === term})
                   .length;
  }

  var $essay = checkTerms("essay") + checkTerms("Essay")
  if ($essay > 0) {
    $results.append('<h3>Uses of the word “essay”: ' + $essay + '</h3>');
    $results.append('<p>Please do not use the word “essay” when writing an essay, not even in the title.</p>');
  }

  var $I = checkTerms("I");
  var $me = checkTerms("me");
  var $we = checkTerms("we") + checkTerms("We");
  var $you = checkTerms("you") + checkTerms("You");
  var $pov = $I + $me +$we + $you; 
  if ($pov > 0) {
    $results.append('<h3>Uses of “I”: ' + $I + ', “me”: ' + $me + ', “we”: ' + $we + ', “you”: ' + $you + '</h3>');
    $results.append('<p>Please do write in 1st or 2nd person. Use 3rd person instead.</p>');
  }

  $results.append('<h2>Good luck!</h2>');
}

// watch for input and display
$('textarea').on("input", essayChecker);


