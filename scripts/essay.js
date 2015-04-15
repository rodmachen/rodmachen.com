var $body = $('body');
var $results = $('.results') 

$('textarea').on("input", function() {
  var $alltext = $("#main_text").val();
  var words = function (text) {
    return text.split(" ").length;
  };
  var $words = words($alltext);
  $results.append($words);
});
