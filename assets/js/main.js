(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var langToggle = document.querySelector(".lang-switcher-toggle");
  var langMenu = document.getElementById("lang-switcher-menu");
  if (langToggle && langMenu) {
    langToggle.addEventListener("click", function () {
      var isOpen = langMenu.style.display === "block";
      langMenu.style.display = isOpen ? "none" : "block";
      langToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // Desktop-only "More" overflow menu: nav items that don't fit the
  // available header width move into a dropdown instead of wrapping.
  // Mobile (<=860px) always shows the full list in the hamburger panel —
  // see the matching breakpoint in theme.css — so this is skipped there.
  var list = document.getElementById("site-nav-list");
  var moreWrap = document.querySelector(".site-nav-more");
  var moreToggle = document.getElementById("site-nav-more-toggle");
  var moreMenu = document.getElementById("site-nav-more-menu");
  if (list && moreWrap && moreToggle && moreMenu) {
    var mq = window.matchMedia("(min-width: 861px)");
    var GAP = 20; // matches the ul's gap in theme.css

    var moveAllBack = function () {
      while (moreMenu.firstChild) list.appendChild(moreMenu.firstChild);
      moreToggle.hidden = true;
      moreMenu.hidden = true;
      moreToggle.setAttribute("aria-expanded", "false");
    };

    var recalc = function () {
      if (!mq.matches) {
        moveAllBack();
        return;
      }
      moveAllBack();
      var container = list.parentElement;
      var items = Array.prototype.slice.call(list.children);
      var totalWidth = items.reduce(function (sum, li) {
        return sum + li.offsetWidth + GAP;
      }, 0);
      if (totalWidth <= container.clientWidth) return; // everything fits

      moreToggle.hidden = false;
      var available = container.clientWidth - moreToggle.offsetWidth - GAP;
      var used = 0;
      var overflowing = [];
      items.forEach(function (li) {
        var w = li.offsetWidth + GAP;
        if (used + w > available) {
          overflowing.push(li);
        } else {
          used += w;
        }
      });
      if (!overflowing.length) {
        moreToggle.hidden = true;
        return;
      }
      overflowing.forEach(function (li) {
        moreMenu.appendChild(li);
      });
    };

    moreToggle.addEventListener("click", function () {
      var isOpen = !moreMenu.hidden;
      moreMenu.hidden = isOpen;
      moreToggle.setAttribute("aria-expanded", String(!isOpen));
    });
    document.addEventListener("click", function (event) {
      if (!moreWrap.contains(event.target)) {
        moreMenu.hidden = true;
        moreToggle.setAttribute("aria-expanded", "false");
      }
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 100);
    });
    if (document.readyState === "complete") {
      recalc();
    } else {
      window.addEventListener("load", recalc);
    }
  }
})();
