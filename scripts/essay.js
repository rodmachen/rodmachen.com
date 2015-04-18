// cache $results to avoid memory overages
var $results = $('.results');
// 
// all functionality resides in essayChecker
function essayChecker() {
  // clear results after any change
  $results.empty();

  // variable for the submitted essay
  var $alltext = $("#main_text").val().trim().replace(/(\r\n|\n|\r)/gm," ");
  console.log($alltext.split(" "))
  var makeWordList = function (text) {
    return text.split(" ");
  }
  var makeCharList = function (text) {
    return text.split("");
  }
  var words = function (func, text) {
    return func(text).filter(function(value) {return value !== ""})
                     .length;
  };
  var $words = words(makeWordList, $alltext);
  if ($words > 0) {
    $results.append('<h3>Number of words: ' + $words + '</h3>');
    $results.append('<p>Make sure this meets the minimum number of words assigned for this essay.</p>');
  }

  var semi = function (text) {
    var filtered = makeCharList(text).filter(function(value) {
      return value === ";"
    });
    return filtered.length;
  };

  var $semi = semi($alltext);
  if ($semi > 0) {
    $results.append('<h3>Number of semicolons: ' + $semi + '</h3>');
    $results.append('<p>Semicolons are difficult to use correctly. Make sure each semicolon is properly used and not just a substitute for ", and".</p>');
  }

  var essay = function (text) {
    var list = text.split(" ");
    var filtered = list.filter(function(value) {
      if (value.slice(0, 5) === "essay" || 
          value.slice(0, 5) === "Essay") {
      return value;
      }
    });
    return filtered.length;
  };
  // var $essay = essay($alltext);
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

function wordSearch(fullText, elements) {
  
}


