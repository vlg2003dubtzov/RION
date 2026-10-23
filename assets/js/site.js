// РИОН: меню на телефоне и окно оплаты по СБП.
(() => {
  "use strict";

  // ---------- меню ----------
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ---------- оплата ----------
  const dataEl = document.getElementById("pay-data");
  const dlg = document.getElementById("pay-dialog");
  if (!dataEl || !dlg) return;
  const cfg = JSON.parse(dataEl.textContent);
  const body = dlg.querySelector(".pay__body");

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Код заказа: префикс товара и 4 знака без похожих букв и цифр (нет 0/O, 1/I/L).
  const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  function orderCode(prefix) {
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return prefix + "-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  }

  async function copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    const old = btn.textContent;
    btn.textContent = "Скопировано";
    setTimeout(() => (btn.textContent = old), 1600);
  }

  function contactLinks(message) {
    const links = [];
    if (cfg.telegram) {
      links.push(`<a class="btn btn--primary btn--small" href="https://t.me/${encodeURIComponent(cfg.telegram)}" target="_blank" rel="noopener">Написать в Telegram</a>`);
    }
    if (cfg.email) {
      const q = "subject=" + encodeURIComponent("Оплата заказа на платформе РИОН") + "&body=" + encodeURIComponent(message);
      links.push(`<a class="btn btn--ghost btn--small" href="mailto:${esc(cfg.email)}?${q}">Написать на почту</a>`);
    }
    return links.join("");
  }

  function renderNotReady(p) {
    const msg = `Здравствуйте! Сообщите, пожалуйста, когда можно будет купить «${p.name}».`;
    const links = contactLinks(msg);
    return `
<p class="eyebrow">Полная версия</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
<p>Продажа скоро откроется: мы подключаем оплату.${links ? " Напишите нам — сообщим, когда можно будет купить." : ""}</p>
${links ? `<div class="pay__actions">${links}</div>` : ""}`;
  }

  function renderReady(p, code) {
    const msg = `Здравствуйте! Оплатил(а) «${p.name}» — ${p.priceText}. Код заказа: ${code}.`;
    const req = [
      cfg.phone && !/\[/.test(cfg.phone) ? `<dt>Телефон</dt><dd>${esc(cfg.phone)}</dd>` : "",
      `<dt>Банк</dt><dd>${esc(cfg.bank)}</dd>`,
      `<dt>Получатель</dt><dd>${esc(cfg.recipient)}</dd>`,
    ].join("");
    return `
<p class="eyebrow">Оплата по СБП</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
<ol class="pay__steps">
<li><b>Переведите ${esc(p.priceText)}</b> ${cfg.qr ? "по QR-коду или по номеру телефона" : "по номеру телефона"} через Систему быстрых платежей.
${cfg.qr ? `<img class="pay__qr" src="${esc(cfg.qr)}" alt="QR-код для оплаты по СБП" width="200" height="200">` : ""}
<dl class="pay__req">${req}</dl>
<p class="pay__hint">${cfg.qr ? "Сумму введите вручную — она одна для QR-кода и перевода по номеру." : "Сумму введите вручную."}</p></li>
<li><b>В комментарии к переводу укажите код заказа</b><br>
<span class="pay__code">${esc(code)}</span><button type="button" class="btn btn--ghost btn--small" data-copy="${esc(code)}">Скопировать код</button></li>
<li><b>Напишите нам об оплате.</b> Ссылку на скачивание и чек из «Мой налог» пришлём в течение ${esc(cfg.hours)} часов.
<div class="pay__actions">${contactLinks(msg)}<button type="button" class="btn btn--ghost btn--small" data-copy="${esc(msg)}">Скопировать сообщение</button></div></li>
</ol>
<p class="pay__small">Оплачивая, вы принимаете условия <a href="${esc(cfg.offer)}">публичной оферты</a>.</p>`;
  }

  function open(id) {
    const p = cfg.products[id];
    if (!p) return;
    body.innerHTML = cfg.ready ? renderReady(p, orderCode(id)) : renderNotReady(p);
    body.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b.dataset.copy, b)));
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }

  document.querySelectorAll("[data-buy]").forEach((btn) => btn.addEventListener("click", () => open(btn.dataset.buy)));
  // Клик по затемнению вокруг окна закрывает его.
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
})();
