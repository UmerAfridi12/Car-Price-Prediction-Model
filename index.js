$(document).ready(function () {
    $(".newClass").click(function () {
      $.ajax({
        url: "hhtps://loaclhost:5000",
        type: "POST",
        success: function (results) {
          alert(results);
        },
      });
    });
  });