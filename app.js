const API_BASE = "https://project-backend-yuyn.onrender.com/api";

// 🎯 STRIPE INSTANSTINI YARATISH
const stripe = Stripe('pk_test_51TdQ7ZByzG8FU1HUGpp30AvDGx0C0m8CQnduTksoIRRFjNLqIDVNAn1tuGa9hslfvCFsdek7ON3paH5UGJIaPz6G00unulEy1M');
let stripeElements = null;

const pages = {
  events: {
    title: "Events",
    endpoint: "/events/",
    renderer: renderEvents
  },
  "gift-certificates": {
    title: "Gift Certificates",
    endpoint: "/gift-certificates/",
    renderer: renderGiftCertificatesForm
  },
  "monthly-giving": {
    title: "Monthly Giving",
    endpoint: "/monthly-giving/",
    renderer: (items) => renderStorePage("Monthly Giving", items, "Add Monthly Gift", "monthly_giving")
  },
  "donate-now": {
    title: "Donate Now",
    endpoint: "/donate-now/",
    renderer: (items) => renderStorePage("Donate Now", items, "Donate", "donation")
  },
  // 🎯 YANGI TO'LOV SAHIFASI YO'LAGI
  "stripe-checkout": {
    title: "Checkout",
    endpoint: null,
    renderer: renderStripeCheckoutPage
  }
};

const state = {
  page: "events",
  cart: { items: [], count: 0, total: "0.00" },
  selectedEvent: null
};

const app = document.querySelector("#app");
const cartModal = document.querySelector("[data-cart-modal]");
const loginModal = document.querySelector("[data-login-modal]");
const eventModal = document.querySelector("[data-event-modal]");
const infoModal = document.querySelector("[data-info-modal]");
const mainNav = document.querySelector("#primary-nav");
const cartItemsNode = document.querySelector("[data-cart-items]");
const countNode = document.querySelector("[data-cart-count]");
const totalNode = document.querySelector("[data-cart-total]");
const ticketQuantityNode = document.querySelector("[data-ticket-quantity]");

const infoContent = {
  privacy: {
    title: "Privacy Policy",
    body: "Your contact and order information is used to manage Lookingglass Theatre purchases, gifts, donations, and owner follow-up inside the admin panel."
  },
  terms: {
    title: "Terms & Conditions",
    body: "All ticket, gift certificate, monthly giving, and donation selections are saved to the cart for review. Payment is active through this Stripe local module."
  },
  email: {
    title: "Join Our Email List",
    body: "Email signup is represented here as an information action. Site ownerlar email matnlarini va kampaniyalarni admin panel orqali boshqarishi mumkin."
  }
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function setActiveNav(page) {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  closeMobileNav();
}

function heading(title) {
  const h1 = document.createElement("h1");
  h1.className = "page-heading";
  h1.textContent = title;
  return h1;
}

function truncate(text, maxLength = 112) {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return `${text.slice(0, maxLength).trim()}... Read more`;
}

function openModal(modal) {
  if (typeof modal.showModal === "function") {
    modal.showModal();
    return;
  }
  modal.setAttribute("open", "");
}

function closeModal(modal) {
  if (typeof modal.close === "function") {
    modal.close();
    return;
  }
  modal.removeAttribute("open");
}

function renderEvents(events) {
  app.replaceChildren();
  app.append(heading("Events"));

  const grid = document.createElement("section");
  grid.className = "event-grid";
  grid.setAttribute("aria-label", "Current events");

  const template = document.querySelector("#event-card-template");
  events.forEach((event) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".event-card");
    const art = fragment.querySelector(".event-art");
    const button = fragment.querySelector(".book-button");
    art.classList.add(event.visual_style || "vampire");
    if (event.visual_style === "vampire") {
      art.innerHTML = "<span>Untitled</span><span>Vampire Play</span>";
    }
    button.textContent = event.button_label || "Book Now";
    button.addEventListener("click", () => openEventModal(event));
    card.querySelector("h2").textContent = event.title;
    card.querySelector(".date").textContent = event.date_range;
    const description = card.querySelector(".description");
    description.textContent = truncate(event.short_description);
    description.tabIndex = 0;
    description.setAttribute("role", "button");
    description.addEventListener("click", () => openEventModal(event));
    grid.append(card);
  });

  app.append(grid);
}

function renderStorePage(title, items, buttonLabel, itemType) {
  app.replaceChildren();
  app.append(heading(title));

  if (itemType === "monthly_giving") {
    const introDiv = document.createElement("div");
    introDiv.className = "store-intro";
    introDiv.style.marginBottom = "20px";
    introDiv.innerHTML = `
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; color: #000;">Join the Lookingglass journey by making a bigger impact through recurring gifts!</h2>
      <p style="font-size: 16px; line-height: 1.4; color: #333; margin-bottom: 20px;">
        The 'Automatically Renew?' check box sets up an indefinite recurring gift in the amount selected, and unclicking that check box will process a one-time gift. You may adjust your recurring gift at any time, or set up a recurring donation for another amount by getting in touch at 773-477-9257 or development@lookingglasstheatre.org.
      </p>
    `;
    app.append(introDiv);
  }

  const grid = document.createElement("section");
  grid.className = "store-grid";
  grid.setAttribute("aria-label", title);

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "store-card";

    const cardTitle = document.createElement("h2");
    cardTitle.textContent = item.title || item.name;

    const description = document.createElement("p");
    description.textContent = item.description || "Support Lookingglass with a recurring gift!";

    const actionContainer = document.createElement("div");
    actionContainer.className = "store-card-actions";
    actionContainer.style.marginTop = "auto";

    if (itemType === "monthly_giving") {
      const periodDiv = document.createElement("div");
      periodDiv.style.fontSize = "13px";
      periodDiv.style.fontWeight = "bold";
      periodDiv.style.marginBottom = "4px";
      periodDiv.style.color = "#000";
      periodDiv.textContent = "Membership Period: 1 month";

      const priceDiv = document.createElement("div");
      priceDiv.style.fontSize = "13px";
      priceDiv.style.fontWeight = "bold";
      priceDiv.style.marginBottom = "15px";
      priceDiv.style.color = "#000";
      priceDiv.textContent = `Price: ${money.format(Number(item.amount))}`;

      const renewLabel = document.createElement("label");
      renewLabel.style.display = "flex";
      renewLabel.style.alignItems = "center";
      renewLabel.style.gap = "8px";
      renewLabel.style.fontSize = "13px";
      renewLabel.style.fontWeight = "bold";
      renewLabel.style.marginBottom = "15px";
      renewLabel.style.cursor = "pointer";
      renewLabel.style.color = "#000";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.style.cursor = "pointer";

      renewLabel.append(checkbox, document.createTextNode("Automatically Renew?"));

      actionContainer.append(periodDiv, priceDiv, renewLabel);
    } else {
      const price = document.createElement("div");
      price.className = "price";
      price.textContent = money.format(Number(item.amount));
      actionContainer.append(price);
    }

    const button = document.createElement("button");
    button.className = "primary";
    button.type = "button";
    button.textContent = buttonLabel;
    button.addEventListener("click", () => addStoreItemToCart(item, itemType));

    actionContainer.append(button);
    card.append(cardTitle, description, actionContainer);
    grid.append(card);
  });

  app.append(grid);
}

function renderGiftCertificatesForm() {
  app.replaceChildren();
  app.append(heading("Gift Certificates"));

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; text-align: left;";

  wrapper.innerHTML = `
    <h3 style="background-color: #f0f0f0; padding: 12px; font-weight: normal; margin-bottom: 20px;">Sign-in or create an account to redeem a gift</h3>
    
    <div id="error-message" style="color: red; font-weight: bold; margin-bottom: 15px; display: none;">
        The following problem(s) occurred:<br><span id="error-details" style="font-size: 14px; font-weight: normal; color: red;"></span>
    </div>

    <form id="voucher-form" style="display: flex; flex-direction: column; gap: 18px;">
        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Value: $ *</label>
            <input type="number" id="v-amount" style="padding: 6px; width: 150px; border: 1px solid #ccc;">
            <span style="font-size: 13px; color: #555; margin-left: 5px;">(required)</span>
        </div>

        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Date to send:</label>
            <input type="date" id="v-date" value="2026-05-31" style="padding: 6px; border: 1px solid #ccc;">
            <div style="font-size: 12px; color: #666; margin-top: 3px;">Gift vouchers do not expire</div>
        </div>

        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">To: *</label>
            <input type="text" id="v-to" style="padding: 6px; width: 300px; border: 1px solid #ccc;">
            <span style="font-size: 13px; color: #555; margin-left: 5px;">(required)</span>
        </div>

        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Send to:</label>
            <label><input type="radio" name="v-send-type" value="me" checked> My Email Address</label>
            <label style="margin-left: 15px;"><input type="radio" name="v-send-type" value="recipient"> Recipient's Email Address</label>
            <input type="email" id="v-recipient-email" style="padding: 6px; width: 250px; border: 1px solid #ccc; margin-left: 10px; display: none;" placeholder="Enter email address">
        </div>

        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">From: *</label>
            <input type="text" id="v-from" style="padding: 6px; width: 300px; border: 1px solid #ccc;">
            <span style="font-size: 13px; color: #555; margin-left: 5px;">(required)</span>
        </div>

        <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Message:</label>
            <textarea id="v-message" style="padding: 6px; width: 100%; height: 120px; border: 1px solid #ccc; resize: vertical;"></textarea>
        </div>

        <div style="font-size: 13px; color: #444; margin-top: 10px;">You will have the option to add another gift voucher on the 'Cart' screen.</div>

        <button type="submit" style="background-color: #ff8c00; color: white; border: none; padding: 12px 20px; font-weight: bold; cursor: pointer; width: 150px; margin-top: 10px;">ADD TO CART</button>
    </form>
  `;

  app.append(wrapper);

  const sendTypeRadios = wrapper.querySelectorAll('input[name="v-send-type"]');
  const recipientEmailInput = wrapper.querySelector('#v-recipient-email');
  const voucherForm = wrapper.querySelector('#voucher-form');

  sendTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'recipient') {
        recipientEmailInput.style.display = 'inline-block';
      } else {
        recipientEmailInput.style.display = 'none';
      }
    });
  });

  voucherForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const amount = document.getElementById('v-amount').value;
    const toName = document.getElementById('v-to').value;
    const fromName = document.getElementById('v-from').value;
    const dateToSend = document.getElementById('v-date').value;
    const sendToType = document.querySelector('input[name="v-send-type"]:checked').value;
    const recipientEmail = recipientEmailInput.value;
    const message = document.getElementById('v-message').value;

    const errorDiv = document.getElementById('error-message');
    const errorDetails = document.getElementById('error-details');

    let errors = [];
    if (!amount) errors.push("Amount required.");
    if (!toName) errors.push("Please enter who the voucher is to.");
    if (sendToType === 'recipient' && !recipientEmail) errors.push("Please enter an email address to send the voucher to.");
    if (!fromName) errors.push("Please enter who the voucher is from.");

    if (errors.length > 0) {
      errorDetails.innerHTML = errors.join('<br>');
      errorDiv.style.display = 'block';
      return;
    } else {
      errorDiv.style.display = 'none';
    }

    try {
      const orderData = {
        amount: amount,
        date_to_send: dateToSend,
        to_name: toName,
        send_to_type: sendToType,
        recipient_email: sendToType === 'recipient' ? recipientEmail : null,
        from_name: fromName,
        message: message
      };

      await apiFetch('/gift-certificates/', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      state.cart = await apiFetch("/cart/", {
        method: "POST",
        body: JSON.stringify({
          item_type: "gift_certificate",
          item_name: `Gift Voucher (To: ${toName})`,
          amount: amount,
          quantity: 1
        })
      });

      renderCart();
      openModal(cartModal);
      voucherForm.reset();
      recipientEmailInput.style.display = 'none';
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Xatolik yuz berdi. Backend ochiqligini tekshiring.");
    }
  });
}

// 🎯 DYNAMIC STRIPE TO'LOV SAHIFASINI CHIQARISH FUNKSIYASI
async function renderStripeCheckoutPage() {
  app.replaceChildren();
  app.append(heading("Stripe Secure Payment"));

  const container = document.createElement("div");
  container.style.cssText = "max-width: 450px; margin: 40px auto; padding: 25px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left;";
  container.innerHTML = `
    <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 15px; color: #222;">Secure Karta To'lovi</h2>
    <div style="font-size: 16px; margin-bottom: 20px; color: #555;">Umumiy to'lov miqdori: <strong style="color:#000;">${money.format(Number(state.cart.total))}</strong></div>
    
    <form id="stripe-payment-form">
      <div id="payment-element" style="margin-bottom: 20px;">
        <div style="text-align:center; color:#666;" class="animate-pulse">Stripe xavfsiz tizimi yuklanmoqda...</div>
      </div>
      <button id="stripe-pay-button" style="width:100%; background:#1d4ed8; color:white; font-weight:600; padding:12px; border:none; border-radius:8px; cursor:pointer;" disabled>
        Hozir To'lash
      </button>
      <div id="stripe-error-message" style="color:red; margin-top:12px; font-size:14px; text-align:center; display:none;"></div>
    </form>
  `;
  app.append(container);

  try {
    // 1. Django backendimizdan clientSecret so'raymiz
    const response = await fetch('https://project-backend-yuym.onrender.com/api/gift-certificates/create-payment-intent/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: state.cart.total })
    });

    const data = await response.json();
    if (!data.clientSecret) throw new Error("Client secret topilmadi");

    // 2. Stripe elementlarini formaga joylashtiramiz
    stripeElements = stripe.elements({ clientSecret: data.clientSecret });
    const paymentElement = stripeElements.create('payment');
    const paymentFormNode = document.getElementById('payment-element');
    paymentFormNode.innerHTML = "";
    paymentElement.mount('#payment-element');

    const payBtn = document.getElementById('stripe-pay-button');
    payBtn.disabled = false;

    // 3. To'lov tugmasi bosilganda
    document.getElementById('stripe-payment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      payBtn.disabled = true;
      payBtn.innerText = "To'lov tekshirilmoqda...";

      const { error } = await stripe.confirmPayment({
        elements: stripeElements,
        confirmParams: {
          // 🎯 Bosh sahifadagi index.html fayliga to'g'ri yo'naltiramiz:
          return_url: `${window.location.origin}/frontend/index.html`,
        },
      });

      if (error) {
        const errNode = document.getElementById('stripe-error-message');
        errNode.textContent = error.message;
        errNode.style.display = "block";
        payBtn.disabled = false;
        payBtn.innerText = "Hozir To'lash";
      }
    });

  } catch (err) {
    console.error(err);
    document.getElementById('payment-element').innerHTML = "<div style='color:red; text-align:center;'>To'lov tizimini yuklashda xatolik. Backendni tekshiring.</div>";
  }
}

async function loadPage(page) {
  state.page = page;
  setActiveNav(page);
  app.innerHTML = '<section class="loading-state">Loading...</section>';

  try {
    const config = pages[page];
    if (config.endpoint) {
      const data = await apiFetch(config.endpoint);
      config.renderer(data);
    } else {
      config.renderer(); // Endpoint bo'lmagan sahifalar uchun (Stripe Checkout kabi)
    }
    app.focus();
  } catch (error) {
    app.innerHTML = '<section class="error-state">Could not load this page. Please make sure the backend is running.</section>';
  }
}

async function loadCart() {
  try {
    state.cart = await apiFetch("/cart/");
  } catch (error) {
    state.cart = { items: [], count: 0, total: "0.00" };
  }
  renderCart();
}

function renderCart() {
  countNode.textContent = String(state.cart.count || 0);
  totalNode.textContent = Number(state.cart.total || 0).toFixed(2);

  if (!state.cart.items || state.cart.items.length === 0) {
    cartItemsNode.textContent = "Your cart is empty.";
    return;
  }

  cartItemsNode.replaceChildren(
    ...state.cart.items.map((item) => {
      const line = document.createElement("div");
      line.className = "cart-line";

      const title = document.createElement("div");
      title.className = "cart-line-title";
      title.textContent = item.label || item.item_name || item.event?.title;

      const meta = document.createElement("div");
      meta.textContent = `${item.quantity} x ${money.format(Number(item.unit_price))}`;

      const remove = document.createElement("button");
      remove.className = "cart-line-remove";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => removeCartItem(item.id));

      line.append(title, meta, remove);
      return line;
    })
  );

  // 🎯 SAVATCHA (CART) ICHIGA "PROCEED TO CHECKOUT" TUGMASINI QO'SHISH
  const checkoutBtn = document.createElement("button");
  checkoutBtn.className = "primary";
  checkoutBtn.style.cssText = "width:100%; margin-top:15px; background-color:#22c55e; color:white; font-weight:bold; padding:10px; border:none; cursor:pointer;";
  checkoutBtn.textContent = "PROCEED TO CHECKOUT";
  checkoutBtn.addEventListener("click", () => {
    closeModal(cartModal);
    loadPage("stripe-checkout");
  });
  cartItemsNode.append(checkoutBtn);
}

function openEventModal(event) {
  state.selectedEvent = event;
  ticketQuantityNode.value = "1";
  document.querySelector("[data-event-title]").textContent = event.title;
  document.querySelector("[data-event-date]").textContent = event.date_range;
  document.querySelector("[data-event-description]").textContent = event.long_description || event.short_description;
  openModal(eventModal);
}

async function addEventToCart(eventId, quantity = 1) {
  state.cart = await apiFetch("/cart/", {
    method: "POST",
    body: JSON.stringify({ event_id: eventId, quantity })
  });
  renderCart();
  openModal(cartModal);
}

async function addStoreItemToCart(item, itemType) {
  state.cart = await apiFetch("/cart/", {
    method: "POST",
    body: JSON.stringify({
      item_type: itemType,
      item_name: item.title || item.name,
      amount: item.amount,
      quantity: 1
    })
  });
  renderCart();
  openModal(cartModal);
}

async function removeCartItem(itemId) {
  await apiFetch(`/cart/${itemId}/`, { method: "DELETE" });
  await loadCart();
}

function closeMobileNav() {
  mainNav.classList.remove("open");
  document.querySelector("[data-toggle-nav]").setAttribute("aria-expanded", "false");
}

function openInfoModal(infoKey) {
  const info = infoContent[infoKey];
  if (!info) {
    return;
  }
  document.querySelector("[data-info-title]").textContent = info.title;
  document.querySelector("[data-info-body]").textContent = info.body;
  openModal(infoModal);
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.page) {
      loadPage(button.dataset.page);
    }
  });
});

document.querySelector("[data-open-cart]").addEventListener("click", async () => {
  await loadCart();
  openModal(cartModal);
});

document.querySelector("[data-open-login]").addEventListener("click", () => {
  window.location.href = "https://project-backend-yuym.onrender.com/admin/";
});

document.querySelector("[data-clear-cart]").addEventListener("click", async () => {
  await apiFetch("/cart/clear/", { method: "DELETE" });
  await loadCart();
});

document.querySelector("[data-confirm-event]").addEventListener("click", async () => {
  if (!state.selectedEvent) {
    return;
  }
  const quantity = Math.max(1, Number.parseInt(ticketQuantityNode.value, 10) || 1);
  closeModal(eventModal);
  await addEventToCart(state.selectedEvent.id, quantity);
});

document.querySelector("[data-toggle-nav]").addEventListener("click", (event) => {
  const isOpen = mainNav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("[data-info]").forEach((button) => {
  button.addEventListener("click", () => openInfoModal(button.dataset.info));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest(".modal")));
});

// Loyihani dastlabki yuklash qismi
(async function initApp() {
  await loadCart();
  await loadPage("events");
})();