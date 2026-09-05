(function () {
  "use strict";

  function initializePreview() {
    var banner = document.createElement("div");
    banner.className = "clone-preview-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = "Arbejdsudgave<span>Statisk klon – produktionssiden ændres ikke</span>";
    document.body.appendChild(banner);

    Array.prototype.forEach.call(document.forms, function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        window.alert("Denne formular er slået fra i arbejdsudgaven.");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePreview);
  } else {
    initializePreview();
  }
})();
