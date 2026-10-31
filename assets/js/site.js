// РИОН: меню на телефоне и окно покупки.
// Без кабинетов — перевод по СБП с кодом заказа и сообщение нам. С кабинетами (есть window.RION):
// вход → выбор оплаты (Робокасса онлайн или перевод по QR) → игра появляется в кабинете.
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
  const api = window.RION || null;

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
<p class="eyebrow">Доступ</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
<p>Продажа скоро откроется: мы подключаем оплату.${links ? " Напишите нам — сообщим, когда можно будет купить." : ""}</p>
${links ? `<div class="pay__actions">${links}</div>` : ""}`;
  }

  // Перевод по СБП. opts.account — заказ уже в кабинете, игра откроется там после проверки;
  // opts.note — предупреждение над шагами.
  function renderReady(p, code, opts = {}) {
    const msg = `Здравствуйте! Оплатил(а) «${p.name}» — ${p.priceText}. Код заказа: ${code}.`;
    const req = [
      cfg.phone && !/\[/.test(cfg.phone) ? `<dt>Телефон</dt><dd>${esc(cfg.phone)}</dd>` : "",
      `<dt>Банк</dt><dd>${esc(cfg.bank)}</dd>`,
      `<dt>Получатель</dt><dd>${esc(cfg.recipient)}</dd>`,
    ].join("");
    const last = opts.account
      ? `<li><b>Готово.</b> Мы проверим перевод по коду и откроем игру в <a href="${esc(api.config.account)}">кабинете</a> — в течение ${esc(cfg.hours)} часов. Хотите быстрее — напишите нам.
<div class="pay__actions">${contactLinks(msg)}</div></li>`
      : `<li><b>Напишите нам об оплате.</b> Ссылки на игры и чек из «Мой налог» пришлём в течение ${esc(cfg.hours)} часов.
<div class="pay__actions">${contactLinks(msg)}<button type="button" class="btn btn--ghost btn--small" data-copy="${esc(msg)}">Скопировать сообщение</button></div></li>`;
    return `
<p class="eyebrow">Оплата по СБП</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
${opts.note ? `<p class="notice notice--error">${esc(opts.note)}</p>` : ""}
<ol class="pay__steps">
<li><b>Переведите ${esc(p.priceText)}</b> ${cfg.qr ? "по QR-коду или по номеру телефона" : "по номеру телефона"} через Систему быстрых платежей.
${cfg.qr ? `<img class="pay__qr" src="${esc(cfg.qr)}" alt="QR-код для оплаты по СБП" width="200" height="200">` : ""}
<dl class="pay__req">${req}</dl>
<p class="pay__hint">${cfg.qr ? "Сумму введите вручную — она одна для QR-кода и перевода по номеру." : "Сумму введите вручную."}</p></li>
<li><b>В комментарии к переводу укажите код заказа</b><br>
<span class="pay__code">${esc(code)}</span><button type="button" class="btn btn--ghost btn--small" data-copy="${esc(code)}">Скопировать код</button></li>
${last}
</ol>
<p class="pay__small">Оплачивая, вы принимаете условия <a href="${esc(cfg.offer)}">публичной оферты</a>.</p>`;
  }

  // ---------- покупка в кабинет ----------

  function renderLogin(id, p) {
    const next = encodeURIComponent(location.pathname + "?buy=" + id);
    const acc = api.config.account;
    return `
<p class="eyebrow">Доступ</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
<p>Войдите в личный кабинет — после оплаты игры и файлы для скачивания появятся в нём.</p>
<div class="pay__actions">
<a class="btn btn--primary btn--small" href="${esc(acc)}?next=${next}">Войти</a>
<a class="btn btn--ghost btn--small" href="${esc(acc)}?mode=register&amp;next=${next}">Завести кабинет</a>
</div>
<p class="pay__alt"><button type="button" class="linklike" data-noaccount>Купить без кабинета — переводом по QR</button></p>`;
  }

  function renderWait(p) {
    return `<p class="eyebrow">Доступ</p><h2 id="pay-title">${esc(p.name)}</h2><p class="pay__price">${esc(p.priceText)}</p><p class="muted">Готовим оплату…</p>`;
  }

  function renderChoose(p, server) {
    return `
<p class="eyebrow">Покупка в кабинет</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p class="pay__price">${esc(p.priceText)}</p>
<div class="pay__methods">
${server.robokassa ? `<button type="button" class="pay-method" data-method="robokassa"><b>Картой или по СБП онлайн</b><span>Через Робокассу. Игра откроется в кабинете сразу после оплаты, чек придёт на почту.</span></button>` : ""}
<button type="button" class="pay-method" data-method="sbp"><b>Переводом по QR-коду</b><span>СБП на счёт продавца. Игра появится в кабинете, когда мы проверим перевод, — в течение ${esc(cfg.hours)} часов.</span></button>
</div>
<p class="form__error" data-error hidden></p>
<p class="pay__small">Оплачивая, вы принимаете условия <a href="${esc(cfg.offer)}">публичной оферты</a>.</p>`;
  }

  function renderOwned(p) {
    return `
<p class="eyebrow">Уже куплено</p>
<h2 id="pay-title">${esc(p.name)}</h2>
<p>Этот доступ уже есть в вашем кабинете — файлы и ссылки там же.</p>
<div class="pay__actions"><a class="btn btn--primary btn--small" href="${esc(api.config.account)}">Открыть кабинет</a></div>`;
  }

  function show(html) {
    body.innerHTML = html;
    body.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b.dataset.copy, b)));
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
  }

  async function choose(id, p, method) {
    const buttons = body.querySelectorAll("[data-method]");
    const err = body.querySelector("[data-error]");
    buttons.forEach((b) => (b.disabled = true));
    err.hidden = true;
    try {
      const o = await api.order(id, method);
      if (method === "robokassa" && o.payUrl) {
        location.href = o.payUrl;
        return;
      }
      show(renderReady(p, o.code, { account: true }));
    } catch (e) {
      if (e.status === 409) return show(renderOwned(p));
      if (e.status === 401) return openWithAccount(id, p);
      err.textContent = e.message;
      err.hidden = false;
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  async function openWithAccount(id, p) {
    if (!api.user()) {
      show(renderLogin(id, p));
      body.querySelector("[data-noaccount]").addEventListener("click", () => show(renderReady(p, orderCode(id))));
      return;
    }
    show(renderWait(p));
    let server, purchases;
    try {
      [server, purchases] = await Promise.all([api.serverConfig(), api.list("purchases", { expand: "product" })]);
    } catch (e) {
      if (e.status === 401) return openWithAccount(id, p);
      show(renderReady(p, orderCode(id), { note: "Кабинеты сейчас не отвечают. Можно оплатить переводом и написать нам — пришлём ссылку." }));
      return;
    }
    if (purchases.some((x) => x.expand && x.expand.product && x.expand.product.code === id)) return show(renderOwned(p));
    show(renderChoose(p, server));
    body.querySelectorAll("[data-method]").forEach((b) => b.addEventListener("click", () => choose(id, p, b.dataset.method)));
  }

  function open(id) {
    const p = cfg.products[id];
    if (!p) return;
    if (!cfg.ready) show(renderNotReady(p));
    else if (api) openWithAccount(id, p);
    else show(renderReady(p, orderCode(id)));
  }

  // Кабинет показывает реквизиты для неоплаченного заказа по QR.
  window.RION_PAY = {
    open,
    showTransfer(id, code) {
      const p = cfg.products[id];
      if (p) show(renderReady(p, code, { account: !!api }));
    },
  };

  document.querySelectorAll("[data-buy]").forEach((btn) => btn.addEventListener("click", () => open(btn.dataset.buy)));

  // После входа кабинет возвращает на страницу с ?buy=FG|ALL — сразу открываем покупку.
  const buy = new URLSearchParams(location.search).get("buy");
  if (buy && cfg.products[buy]) {
    history.replaceState(null, "", location.pathname + location.hash);
    open(buy);
  }
  // Клик по затемнению вокруг окна закрывает его.
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
})();
