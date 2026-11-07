(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("menu-open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-locked", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("menu-open"));
    });
    nav.querySelectorAll(".nav__panel a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  var form = document.getElementById("partnerForm");
  if (!form) return;

  var status = document.getElementById("formStatus");
  var submitBtn = form.querySelector("[type='submit']");
  var submitText = submitBtn ? submitBtn.textContent : "Send enquiry";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (status) {
      status.textContent = "";
      status.className = "form__status";
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("Server error");
      form.reset();
      if (status) {
        status.textContent = "Enquiry sent. We'll be in touch.";
        status.classList.add("ok");
      }
    }).catch(function () {
      if (status) {
        status.textContent = "Something went wrong. Please email admin@bittrbyte.com directly.";
        status.classList.add("err");
      }
    }).then(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitText;
      }
    });
  });
})();
