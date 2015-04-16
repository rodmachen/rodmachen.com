$('textarea').on("input", function() {
  var $results = $('.results') 
  $results.empty();
  var $alltext = $("#main_text").val();

  var makeWordList = function (text) {
    return text.split(" ");
  }
  var makeCharList = function (text) {
    return text.split("");
  }
  var words = function (func, text) {
    return func(text).length;
  };
  var $words = words(makeWordList, $alltext);
  if ($words > 1) {
    $results.append('<p><strong>Number of words: </strong>' + $words + '</p>');
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
    $results.append('<p><strong>Number of semicolons: </strong>' + $semi + '</p>');
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
  var $essay = essay($alltext);
  if ($essay > 0) {
    $results.append('<p><strong>Occurances of the word "essay": </strong>' + $essay + '</p>');
    $results.append('<p>Please do not use the word "essay" when writing an essay, not even in the title.</p>');
  }

});

  var sentLength = function (text) {
    var list = text.split("");
    var filtered = list.filter(function(value) {
          return value === "."
    });
    return ($words)/(filtered.length);
  };
  // var $sentences = sentLength($alltext);
  // $results.append('<p><strong>Average length of sentences: </strong>' + $sentences + '</p>');
