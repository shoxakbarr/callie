(function () {
  "use strict";

  function makeStatus(form, className) {
    var status = form.querySelector(".site-form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "site-form-status " + (className || "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.style.marginTop = "12px";
      status.style.fontSize = "14px";
      form.appendChild(status);
    }
    return status;
  }

  function setStatus(form, message, isError) {
    var status = makeStatus(form, isError ? "is-error" : "is-info");
    status.textContent = message;
    status.style.color = isError ? "#b42318" : "#26734d";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Keep the mobile navigation controls accessible and predictable.
    document.querySelectorAll(".has-dropdown > a").forEach(function (link) {
      link.setAttribute("aria-haspopup", "true");
      link.addEventListener("click", function () {
        var parent = link.parentElement;
        window.setTimeout(function () {
          link.setAttribute("aria-expanded", parent.classList.contains("active") ? "true" : "false");
        }, 0);
      });
    });

    // Search forms provide a useful local page search; no external service is required.
    document.querySelectorAll("form").forEach(function (form) {
      var searchInput = form.querySelector('input[name="search"]');
      if (searchInput) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var query = searchInput.value.trim().toLowerCase();
          if (!query) {
            setStatus(form, "Введите слово для поиска.", true);
            searchInput.focus();
            return;
          }
          var text = document.body.innerText.toLowerCase();
          var count = text.split(query).length - 1;
          setStatus(form, count
            ? 'На этой странице найдено совпадений: ' + count + '. Для поиска по всем статьям нужен отдельный индекс или сервер.'
            : "На этой странице совпадений не найдено. Попробуйте другое слово.", false);
        });
      }

      var emailInput = form.querySelector('input[name="newsletter"], input[placeholder*="Email" i]');
      var isNewsletter = !!form.querySelector('input[name="newsletter"]') ||
        (!!emailInput && /subscribe/i.test(form.innerText || ""));
      var isContact = !!form.querySelector('textarea[name="message"]') &&
        !form.classList.contains("post-reply");

      if (isNewsletter) {
        if (emailInput) {
          emailInput.type = "email";
          emailInput.required = true;
          emailInput.setAttribute("autocomplete", "email");
        }
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          if (!form.reportValidity()) return;
          setStatus(form, "Email проверен, но подписка пока не отправлена: подключите сервис рассылки или серверный обработчик.", false);
        });
      } else if (isContact) {
        var contactEmail = form.querySelector('input[name="email"]');
        var subject = form.querySelector('input[name="subject"]');
        var message = form.querySelector('textarea[name="message"]');
        [contactEmail, subject, message].forEach(function (field) {
          if (field) field.required = true;
        });
        if (contactEmail) contactEmail.type = "email";
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          if (!form.reportValidity()) return;
          setStatus(form, "Форма заполнена корректно, но сообщение не отправлено. Чтобы получать сообщения, подключите backend или сервис обработки форм.", false);
        });
      } else if (form.classList.contains("post-reply")) {
        form.querySelectorAll('input[name="name"], input[name="email"], textarea[name="message"]').forEach(function (field) {
          field.required = true;
        });
        var replyEmail = form.querySelector('input[name="email"]');
        if (replyEmail) replyEmail.type = "email";
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          if (!form.reportValidity()) return;
          setStatus(form, "Комментарий заполнен, но не опубликован: для публикации комментариев нужен сервер и база данных.", false);
        });
      }
    });
  });
})();