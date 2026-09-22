(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  var langToggle = document.querySelector(".lang-switcher-toggle");
  var langMenu = document.getElementById("lang-switcher-menu");
  if (langToggle && langMenu) {
    langToggle.addEventListener("click", function () {
      var isOpen = langMenu.style.display === "block";
      langMenu.style.display = isOpen ? "none" : "block";
      langToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }
})();
