var $body = $('body');
var $results = $('.results') 

$('textarea').on("input", function() {
  $results.empty();
  var $alltext = $("#main_text").val();
  var words = function (text) {
    return text.split(" ").length;
  };
  var $words = words($alltext);
  $results.append('<p>How many words?</p>');
  $results.append($words);
});
