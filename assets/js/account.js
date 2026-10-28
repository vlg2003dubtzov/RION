// РИОН: страница личного кабинета — вход и регистрация, мои игры с файлами, заказы,
// запись на занятия и клуб, прогресс в играх, профиль. Разметку собирает tools/build.js,
// сервер — assets/js/rion-api.js (window.RION).
(() => {
  "use strict";

  const root = document.getElementById("account");
  if (!root) return;
  const R = window.RION;
  const $ = (sel) => root.querySelector(sel);
  const notice = $("#acc-notice");
  const loading = $("#acc-loading");
  const authBox = $("#acc-auth");
  const cab = $("#acc-cab");
  const params = new URLSearchParams(location.search);

  if (!R) {
    loading.textContent = "На этой версии сайта кабинет не работает.";
    return;
  }

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rub = (n) => `${Number(n).toLocaleString("ru-RU")} ₽`;
  const date = (s) => {
    if (!s) return "";
    const d = new Date(String(s).replace(" ", "T"));
    return isNaN(d) ? "" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };
  const field = (form, name) => form.elements.namedItem(name);
  const val = (form, name) => String(field(form, name).value || "").trim();
  const box = (name) => root.querySelector(`[data-list="${name}"]`);
  const empty = (html) => `<p class="empty">${html}</p>`;

  function say(text, kind = "info") {
    notice.className = `notice notice--${kind}`;
    notice.textContent = text || "";
    notice.hidden = !text;
  }

  function formError(form, text) {
    const p = form.querySelector("[data-error]");
    p.textContent = text || "";
    p.hidden = !text;
  }

  // Кнопка формы не нажимается дважды, ошибка сервера — под формой.
  async function busy(form, fn) {
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    formError(form, "");
    try {
      await fn();
    } catch (e) {
      formError(form, (e && e.message) || "Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- вход и регистрация ----------

  const tabs = { login: $("#tab-login"), register: $("#tab-register") };
  const forms = { login: $("#form-login"), register: $("#form-register") };

  function showTab(name, focus) {
    for (const k of Object.keys(tabs)) {
      const on = k === name;
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      forms[k].hidden = !on;
    }
    if (focus) forms[name].querySelector("input").focus();
  }
  tabs.login.addEventListener("click", () => showTab("login", true));
  tabs.register.addEventListener("click", () => showTab("register", true));
  $(".tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = tabs.login.getAttribute("aria-selected") === "true" ? "register" : "login";
    showTab(next);
    tabs[next].focus();
  });

  forms.login.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = forms.login;
    const email = val(f, "email");
    const password = field(f, "password").value;
    if (!email || !password) return formError(f, "Введите почту и пароль.");
    busy(f, async () => {
      await R.login(email, password);
      afterLogin(false);
    });
  });

  forms.register.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = forms.register;
    const name = val(f, "name");
    const email = val(f, "email");
    const password = field(f, "password").value;
    if (!name || !email || !password) return formError(f, "Заполните имя, почту и пароль.");
    if (password.length < 8) return formError(f, "Пароль — не короче 8 знаков.");
    if (!field(f, "consent").checked) {
      return formError(f, "Чтобы завести кабинет, нужно согласие на обработку персональных данных.");
    }
    busy(f, async () => {
      await R.register({ name, email, password, consent: true });
      afterLogin(true);
    });
  });

  $("[data-forgot]").addEventListener("click", async () => {
    const f = forms.login;
    const email = val(f, "email");
    if (!email) return formError(f, "Впишите почту — пришлём на неё ссылку для нового пароля.");
    formError(f, "");
    try {
      await R.requestReset(email);
      say("Если кабинет с такой почтой есть, на неё придёт письмо со ссылкой для нового пароля.", "ok");
    } catch (err) {
      formError(f, err.message);
    }
  });

  // После входа возвращаем туда, откуда пришли (например, к покупке игры), — только в пределах сайта.
  function afterLogin(isNew) {
    const next = params.get("next");
    if (next) {
      try {
        const u = new URL(next, location.href);
        if (u.origin === location.origin) {
          location.href = u.href;
          return;
        }
      } catch {}
    }
    say(isNew ? "Кабинет заведён. Добро пожаловать!" : "", "ok");
    showCabinet();
  }

  function showAuth() {
    loading.hidden = true;
    cab.hidden = true;
    authBox.hidden = false;
    if (params.get("mode") === "register") showTab("register");
    if (params.get("book")) say("Войдите или заведите кабинет — и запись на занятия займёт минуту.");
    else if (params.get("next")) say("Войдите или заведите кабинет — и мы вернём вас к покупке.");
  }

  // ---------- кабинет ----------

  async function guard(name, fn) {
    try {
      await fn();
    } catch (e) {
      box(name).innerHTML = empty(esc((e && e.message) || "Не удалось загрузить."));
    }
  }

  async function showCabinet() {
    const u = R.user();
    loading.hidden = true;
    authBox.hidden = true;
    cab.hidden = false;
    $("[data-user-name]").textContent = u.name || "ученик";
    $("[data-user-email]").textContent = u.email || "";
    field($("#form-profile"), "name").value = u.name || "";

    const kind = params.get("book");
    if (kind === "lesson" || kind === "club") {
      const radio = $(`#form-booking input[name="kind"][value="${kind}"]`);
      if (radio) radio.checked = true;
      document.getElementById("booking").scrollIntoView({ block: "start" });
    }

    await Promise.all([
      guard("games", loadGames),
      guard("orders", loadOrders),
      guard("bookings", loadBookings),
      guard("progress", loadProgress),
    ]);
  }

  async function loadGames() {
    const el = box("games");
    el.innerHTML = empty("Загружаем…");
    const purchases = await R.list("purchases", { expand: "product", sort: "-created" });
    if (!purchases.length) {
      el.innerHTML = empty(`Здесь появятся купленные полные версии с файлами для скачивания. Начните с <a href="${esc(R.config.root)}games/">мини-игр</a>.`);
      return;
    }
    const downloads = await R.list("downloads", { sort: "sort,title" });
    el.innerHTML = purchases
      .map((p) => {
        const prod = (p.expand && p.expand.product) || {};
        const game = R.config.games[prod.game];
        const files = downloads.filter((d) => d.product === p.product && d.file);
        return `<article class="owned">
<div class="owned__head"><h3>${esc(prod.name || "Покупка")}</h3>${game ? `<a href="${esc(game.href)}">Страница игры</a>` : ""}</div>
<p class="muted small">Куплено ${esc(date(p.created))}</p>
${
  files.length
    ? `<ul class="files">${files
        .map(
          (f) =>
            `<li><button type="button" class="btn btn--primary btn--small" data-file="${esc(f.id)}">Скачать: ${esc(f.title)}</button>${f.note ? `<span class="muted small">${esc(f.note)}</span>` : ""}</li>`
        )
        .join("")}</ul>`
    : `<p class="muted small">Файлы для скачивания скоро появятся здесь.</p>`
}
</article>`;
      })
      .join("");
    el.querySelectorAll("[data-file]").forEach((b) =>
      b.addEventListener("click", async () => {
        const f = downloads.find((d) => d.id === b.dataset.file);
        b.disabled = true;
        try {
          location.href = await R.fileUrl(f);
        } catch (e) {
          say(e.message, "error");
        } finally {
          b.disabled = false;
        }
      })
    );
  }

  const ORDER_STATUS = { pending: ["Ждёт оплаты", "wait"], paid: ["Оплачен", "ok"], cancelled: ["Отменён", "off"] };
  const METHOD = { robokassa: "онлайн, Робокасса", sbp: "перевод по QR" };

  async function loadOrders() {
    const el = box("orders");
    const orders = await R.list("orders", { expand: "product", sort: "-created" });
    if (!orders.length) {
      el.innerHTML = empty("Заказов пока нет.");
      return;
    }
    const pay = window.RION_PAY;
    el.innerHTML = `<ul class="rows">${orders
      .map((o) => {
        const [label, tone] = ORDER_STATUS[o.status] || [o.status, "off"];
        const prod = (o.expand && o.expand.product) || {};
        let action = "";
        if (o.status === "pending" && o.method === "robokassa") {
          action = `<button type="button" class="btn btn--primary btn--small" data-pay="${esc(prod.code)}">Оплатить</button>`;
        } else if (o.status === "pending" && o.method === "sbp") {
          action =
            `<p class="muted small">Ждём перевод с кодом <b>${esc(o.code)}</b> в комментарии — как увидим его, откроем игру.</p>` +
            (pay ? `<button type="button" class="btn btn--ghost btn--small" data-transfer="${esc(prod.code)}" data-code="${esc(o.code)}">Реквизиты для перевода</button>` : "");
        }
        return `<li class="row">
<div><b>${esc(prod.name || "Заказ")}</b><span class="muted small">${esc(o.code)} · ${esc(date(o.created))} · ${esc(METHOD[o.method] || "")}</span></div>
<div class="row__end"><span class="row__sum">${rub(o.amount)}</span><span class="status status--${tone}">${label}</span></div>
${action ? `<div class="row__action">${action}</div>` : ""}
</li>`;
      })
      .join("")}</ul>`;

    el.querySelectorAll("[data-pay]").forEach((b) =>
      b.addEventListener("click", async () => {
        b.disabled = true;
        try {
          const o = await R.order(b.dataset.pay, "robokassa");
          if (o.payUrl) location.href = o.payUrl;
        } catch (e) {
          say(e.message, "error");
          b.disabled = false;
        }
      })
    );
    el.querySelectorAll("[data-transfer]").forEach((b) =>
      b.addEventListener("click", () => pay.showTransfer(b.dataset.transfer, b.dataset.code))
    );
  }

  const BOOKING_STATUS = {
    new: ["Новая", "wait"],
    confirmed: ["Подтверждена", "ok"],
    done: ["Прошла", "off"],
    cancelled: ["Отменена", "off"],
  };
  const KIND = { lesson: "Занятия с преподавателем", club: "Разговорный клуб" };

  async function loadBookings() {
    const el = box("bookings");
    const items = await R.list("bookings", { sort: "-created" });
    const contact = field($("#form-booking"), "contact");
    if (items.length && !contact.value) contact.value = items[0].contact || "";
    if (!items.length) {
      el.innerHTML = empty("Заявок пока нет.");
      return;
    }
    el.innerHTML = `<ul class="rows">${items
      .map((b) => {
        const [label, tone] = BOOKING_STATUS[b.status] || ["Новая", "wait"];
        const details = [b.language, b.preferred, date(b.created)].filter(Boolean).map(esc).join(" · ");
        return `<li class="row"><div><b>${esc(KIND[b.kind] || b.kind)}</b><span class="muted small">${details}</span></div>
<div class="row__end"><span class="status status--${tone}">${label}</span></div></li>`;
      })
      .join("")}</ul>`;
  }

  $("#form-booking").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const kind = (f.querySelector('input[name="kind"]:checked') || {}).value || "lesson";
    const data = {
      user: R.user().id,
      kind,
      language: val(f, "language"),
      preferred: val(f, "preferred"),
      contact: val(f, "contact"),
      comment: val(f, "comment"),
    };
    if (!data.contact) return formError(f, "Оставьте Telegram или телефон — так мы договоримся о времени.");
    busy(f, async () => {
      await R.create("bookings", data);
      field(f, "preferred").value = "";
      field(f, "comment").value = "";
      say(`Заявка отправлена: ${KIND[kind].toLowerCase()}. Мы напишем вам, чтобы договориться о времени.`, "ok");
      notice.scrollIntoView({ block: "nearest" });
      await guard("bookings", loadBookings);
    });
  });

  async function loadProgress() {
    const el = box("progress");
    const items = await R.list("progress", { sort: "-updated" });
    if (!items.length) {
      el.innerHTML = empty("Сюда игры сохраняют рекорды и пройденные уровни, если играть, войдя в кабинет. Подключаем игры по очереди.");
      return;
    }
    el.innerHTML = `<ul class="rows">${items
      .map((p) => {
        const game = R.config.games[p.game];
        const title = game ? `<a href="${esc(game.href)}">${esc(game.title)}</a>` : esc(p.game);
        return `<li class="row"><div><b>${title}</b><span class="muted small">Обновлено ${esc(date(p.updated))}</span></div>
<div class="row__end">${typeof p.best === "number" && p.best ? `<span class="row__sum">Рекорд: ${esc(p.best)}</span>` : ""}</div></li>`;
      })
      .join("")}</ul>`;
  }

  $("#form-profile").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = val(f, "name");
    if (!name) return formError(f, "Впишите имя.");
    busy(f, async () => {
      const u = await R.updateProfile({ name });
      $("[data-user-name]").textContent = u.name;
      say("Профиль сохранён.", "ok");
    });
  });

  $("[data-logout]").addEventListener("click", () => {
    R.logout();
    say("Вы вышли из кабинета.");
  });

  // Вход закончился (вышли или токен устарел) — снова форма входа.
  R.onChange((user) => {
    if (!user) showAuth();
  });

  (async () => {
    if (R.user()) {
      try {
        await R.refresh();
      } catch (e) {
        loading.textContent = e.message;
        return;
      }
    }
    if (R.user()) showCabinet();
    else showAuth();
  })();
})();
