/* Doormet — общий JS: меню, форма, появление при скролле */
(function () {
  "use strict";

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".main-nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "Закрыть меню ✕" : "Меню ☰";
    });
  }

  /* ---------- Появление секций при скролле ---------- */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { observer.observe(el); });

  /* ---------- Форма заявки (Formspree, как в исходной версии) ---------- */
  var FORMSPREE = "https://formspree.io/f/xnnevwrp";
  var form = document.getElementById("lead-form");
  if (!form) return;

  var phoneInput = form.querySelector("[name=phone]");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      // маска +375 XX-XXX-XXXX
      var d = phoneInput.value.replace(/\D/g, "");
      while (d.length > 3 && d.indexOf("375") === 0) d = d.slice(3);
      d = d.slice(0, 9);
      var out = "+375";
      if (d.length > 0) out += " " + d.slice(0, 2);
      if (d.length > 2) out += "-" + d.slice(2, 5);
      if (d.length > 5) out += "-" + d.slice(5, 9);
      phoneInput.value = out;
    });
  }

  function setErrors(errors) {
    form.querySelectorAll(".error").forEach(function (el) { el.textContent = ""; });
    Object.keys(errors).forEach(function (k) {
      var slot = form.querySelector('[data-error="' + k + '"]');
      if (slot) slot.textContent = errors[k];
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var fullName = (data.get("fullName") || "").trim();
    var phone = (data.get("phone") || "").trim();
    var email = (data.get("email") || "").trim();
    var message = (data.get("message") || "").trim();
    var accept = form.querySelector("[name=acceptTerms]").checked;

    var errors = {};
    if (!fullName) errors.fullName = "Поле ФИО обязательно";
    if (!phone) errors.phone = "Поле Телефон обязательно для заполнения";
    else if (!/^\+375\s\d{2}-\d{3}-\d{4}$/.test(phone)) errors.phone = "Некорректный формат телефона";
    if (!email) errors.email = "Поле Email обязательно";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Некорректный формат email";
    if (!message) errors.message = "Поле Сообщение обязательно";
    if (!accept) errors.acceptTerms = "Необходимо согласие на обработку персональных данных";
    setErrors(errors);

    var status = document.getElementById("form-status");
    if (Object.keys(errors).length) {
      if (status) { status.textContent = "Пожалуйста, заполните все обязательные поля"; status.className = "form-status err"; }
      return;
    }

    fetch(FORMSPREE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: fullName, phone: phone, email: email, message: message })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("network");
        if (status) { status.textContent = "Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время."; status.className = "form-status ok"; }
        form.reset();
      })
      .catch(function () {
        if (status) { status.textContent = "Не удалось отправить заявку. Позвоните нам: +375 29 895 0047"; status.className = "form-status err"; }
      });
  });
})();
