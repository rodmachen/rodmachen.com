var $body = $('body');
var $results = $('.results') 
var $alltext = $("#main_text").val();

$('button').on("click", function() {
  $results.append($words);
})

function words($alltext) {
  return text.split(" ").length;
}

var $words = words();

