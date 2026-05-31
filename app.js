// const API_BASE = "http://127.0.0.1:8000/api";

// const pages = {
//   events: {
//     title: "Events",
//     endpoint: "/events/",
//     renderer: renderEvents
//   },
//   "gift-certificates": {
//     title: "Gift Certificates",
//     endpoint: "/gift-certificates/",
//     renderer: (items) => renderStorePage("Gift Certificates", items, "Add to Cart", "gift_certificate")
//   },
//   "monthly-giving": {
//     title: "Monthly Giving",
//     endpoint: "/monthly-giving/",
//     renderer: (items) => renderStorePage("Monthly Giving", items, "Add Monthly Gift", "monthly_giving")
//   },
//   "donate-now": {
//     title: "Donate Now",
//     endpoint: "/donate-now/",
//     renderer: (items) => renderStorePage("Donate Now", items, "Donate", "donation")
//   }
// };

// const state = {
//   page: "events",
//   cart: { items: [], count: 0, total: "0.00" },
//   selectedEvent: null
// };



// const app = document.querySelector("#app");
// const cartModal = document.querySelector("[data-cart-modal]");
// const loginModal = document.querySelector("[data-login-modal]");
// const eventModal = document.querySelector("[data-event-modal]");
// const infoModal = document.querySelector("[data-info-modal]");
// const mainNav = document.querySelector("#primary-nav");
// const cartItemsNode = document.querySelector("[data-cart-items]");
// const countNode = document.querySelector("[data-cart-count]");
// const totalNode = document.querySelector("[data-cart-total]");
// const ticketQuantityNode = document.querySelector("[data-ticket-quantity]");
// const infoContent = {
//   privacy: {
//     title: "Privacy Policy",
//     body: "Your contact and order information is used to manage Lookingglass Theatre purchases, gifts, donations, and owner follow-up inside the admin panel."
//   },
//   terms: {
//     title: "Terms & Conditions",
//     body: "All ticket, gift certificate, monthly giving, and donation selections are saved to the cart for review. Payment is intentionally disabled in this local build."
//   },
//   email: {
//     title: "Join Our Email List",
//     body: "Email signup is represented here as an information action. Site ownerlar email matnlarini va kampaniyalarni admin panel orqali boshqarishi mumkin."
//   }
// };

// const money = new Intl.NumberFormat("en-US", {
//   style: "currency",
//   currency: "USD"
// });

// async function apiFetch(path, options = {}) {
//   const response = await fetch(`${API_BASE}${path}`, {
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {})
//     },
//     ...options
//   });

//   if (!response.ok) {
//     throw new Error(`Request failed: ${response.status}`);
//   }

//   if (response.status === 204) {
//     return null;
//   }

//   return response.json();
// }

// function setActiveNav(page) {
//   document.querySelectorAll("[data-page]").forEach((button) => {
//     button.classList.toggle("active", button.dataset.page === page);
//   });
//   closeMobileNav();
// }

// function heading(title) {
//   const h1 = document.createElement("h1");
//   h1.className = "page-heading";
//   h1.textContent = title;
//   return h1;
// }

// function truncate(text, maxLength = 112) {
//   if (!text || text.length <= maxLength) {
//     return text || "";
//   }
//   return `${text.slice(0, maxLength).trim()}... Read more`;
// }

// function openModal(modal) {
//   if (typeof modal.showModal === "function") {
//     modal.showModal();
//     return;
//   }
//   modal.setAttribute("open", "");
// }

// function closeModal(modal) {
//   if (typeof modal.close === "function") {
//     modal.close();
//     return;
//   }
//   modal.removeAttribute("open");
// }

// function renderEvents(events) {
//   app.replaceChildren();
//   app.append(heading("Events"));

//   const grid = document.createElement("section");
//   grid.className = "event-grid";
//   grid.setAttribute("aria-label", "Current events");

//   const template = document.querySelector("#event-card-template");
//   events.forEach((event) => {
//     const fragment = template.content.cloneNode(true);
//     const card = fragment.querySelector(".event-card");
//     const art = fragment.querySelector(".event-art");
//     const button = fragment.querySelector(".book-button");
//     art.classList.add(event.visual_style || "vampire");
//     if (event.visual_style === "vampire") {
//       art.innerHTML = "<span>Untitled</span><span>Vampire Play</span>";
//     }
//     button.textContent = event.button_label || "Book Now";
//     button.addEventListener("click", () => openEventModal(event));
//     card.querySelector("h2").textContent = event.title;
//     card.querySelector(".date").textContent = event.date_range;
//     const description = card.querySelector(".description");
//     description.textContent = truncate(event.short_description);
//     description.tabIndex = 0;
//     description.setAttribute("role", "button");
//     description.addEventListener("click", () => openEventModal(event));
//     description.addEventListener("keydown", (keyboardEvent) => {
//       if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
//         keyboardEvent.preventDefault();
//         openEventModal(event);
//       }
//     });
//     grid.append(card);
//   });

//   app.append(grid);
// }

// function renderStorePage(title, items, buttonLabel, itemType) {
//   app.replaceChildren();
//   app.append(heading(title));

//   const grid = document.createElement("section");
//   grid.className = "store-grid";
//   grid.setAttribute("aria-label", title);

//   items.forEach((item) => {
//     const card = document.createElement("article");
//     card.className = "store-card";

//     const cardTitle = document.createElement("h2");
//     cardTitle.textContent = item.title || item.name;

//     const price = document.createElement("div");
//     price.className = "price";
//     price.textContent = money.format(Number(item.amount));

//     const description = document.createElement("p");
//     description.textContent = item.description;

//     const button = document.createElement("button");
//     button.className = "primary";
//     button.type = "button";
//     button.textContent = buttonLabel;
//     button.addEventListener("click", () => addStoreItemToCart(item, itemType));

//     card.append(cardTitle, price, description, button);
//     grid.append(card);
//   });

//   app.append(grid);
// }

// async function loadPage(page) {
//   state.page = page;
//   setActiveNav(page);
//   app.innerHTML = '<section class="loading-state">Loading...</section>';

//   try {
//     const config = pages[page];
//     const data = await apiFetch(config.endpoint);
//     config.renderer(data);
//     app.focus();
//   } catch (error) {
//     app.innerHTML = '<section class="error-state">Could not load this page. Please make sure the backend is running.</section>';
//   }
// }

// async function loadCart() {
//   try {
//     state.cart = await apiFetch("/cart/");
//   } catch (error) {
//     state.cart = { items: [], count: 0, total: "0.00" };
//   }
//   renderCart();
// }

// function renderCart() {
//   countNode.textContent = String(state.cart.count || 0);
//   totalNode.textContent = Number(state.cart.total || 0).toFixed(2);

//   if (!state.cart.items || state.cart.items.length === 0) {
//     cartItemsNode.textContent = "Your cart is empty.";
//     return;
//   }

//   cartItemsNode.replaceChildren(
//     ...state.cart.items.map((item) => {
//       const line = document.createElement("div");
//       line.className = "cart-line";

//       const title = document.createElement("div");
//       title.className = "cart-line-title";
//       title.textContent = item.label || item.item_name || item.event?.title;

//       const meta = document.createElement("div");
//       meta.textContent = `${item.quantity} x ${money.format(Number(item.unit_price))}`;

//       const remove = document.createElement("button");
//       remove.className = "cart-line-remove";
//       remove.type = "button";
//       remove.textContent = "Remove";
//       remove.addEventListener("click", () => removeCartItem(item.id));

//       line.append(title, meta, remove);
//       return line;
//     })
//   );
// }

// function openEventModal(event) {
//   state.selectedEvent = event;
//   ticketQuantityNode.value = "1";
//   document.querySelector("[data-event-title]").textContent = event.title;
//   document.querySelector("[data-event-date]").textContent = event.date_range;
//   document.querySelector("[data-event-description]").textContent = event.long_description || event.short_description;
//   openModal(eventModal);
// }

// async function addEventToCart(eventId, quantity = 1) {
//   state.cart = await apiFetch("/cart/", {
//     method: "POST",
//     body: JSON.stringify({ event_id: eventId, quantity })
//   });
//   renderCart();
//   openModal(cartModal);
// }

// async function addStoreItemToCart(item, itemType) {
//   state.cart = await apiFetch("/cart/", {
//     method: "POST",
//     body: JSON.stringify({
//       item_type: itemType,
//       item_name: item.title || item.name,
//       amount: item.amount,
//       quantity: 1
//     })
//   });
//   renderCart();
//   openModal(cartModal);
// }

// async function removeCartItem(itemId) {
//   await apiFetch(`/cart/${itemId}/`, { method: "DELETE" });
//   await loadCart();
// }

// function closeMobileNav() {
//   mainNav.classList.remove("open");
//   document.querySelector("[data-toggle-nav]").setAttribute("aria-expanded", "false");
// }

// function openInfoModal(infoKey) {
//   const info = infoContent[infoKey];
//   if (!info) {
//     return;
//   }
//   document.querySelector("[data-info-title]").textContent = info.title;
//   document.querySelector("[data-info-body]").textContent = info.body;
//   openModal(infoModal);
// }

// document.querySelectorAll("[data-page]").forEach((button) => {
//   button.addEventListener("click", () => {
//     if (button.dataset.page) {
//       loadPage(button.dataset.page);
//     }
//   });
// });

// document.querySelector("[data-open-cart]").addEventListener("click", async () => {
//   await loadCart();
//   openModal(cartModal);
// });

// document.querySelector("[data-open-login]").addEventListener("click", () => {
//   openModal(loginModal);
// });

// document.querySelector("[data-clear-cart]").addEventListener("click", async () => {
//   await apiFetch("/cart/clear/", { method: "DELETE" });
//   await loadCart();
// });

// document.querySelector("[data-confirm-event]").addEventListener("click", async () => {
//   if (!state.selectedEvent) {
//     return;
//   }
//   const quantity = Math.max(1, Number.parseInt(ticketQuantityNode.value, 10) || 1);
//   closeModal(eventModal);
//   await addEventToCart(state.selectedEvent.id, quantity);
// });

// document.querySelector("[data-toggle-nav]").addEventListener("click", (event) => {
//   const isOpen = mainNav.classList.toggle("open");
//   event.currentTarget.setAttribute("aria-expanded", String(isOpen));
// });

// document.querySelectorAll("[data-info]").forEach((button) => {
//   button.addEventListener("click", () => openInfoModal(button.dataset.info));
// });

// document.querySelectorAll("[data-close-modal]").forEach((button) => {
//   button.addEventListener("click", () => closeModal(button.closest(".modal")));
// });

// await loadCart();
// await loadPage("events");


const API_BASE = "https://project-backend-yuym.onrender.com/api";

const pages = {
  events: {
    title: "Events",
    endpoint: "/events/",
    renderer: renderEvents
  },
  "gift-certificates": {
    title: "Gift Certificates",
    endpoint: "/gift-certificates/",
    renderer: renderGiftCertificatesForm // Mana shu yerda eski kartochka funksiyasi almashtirildi
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
    body: "All ticket, gift certificate, monthly giving, and donation selections are saved to the cart for review. Payment is intentionally disabled in this local build."
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

  // 1. FAQUAT MONTHLY GIVING SAHIFASI UCHUN ORIGINAL TEPALIK MATNLARI
  if (itemType === "monthly_giving") {
    const introDiv = document.createElement("div");
    introDiv.className = "store-intro"; // Agar CSS-da bo'lsa yoki o'ziga xos padding berish uchun
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

    // Tavsif matni
    const description = document.createElement("p");
    description.textContent = item.description || "Support Lookingglass with a recurring gift!";

    // Kontentlarni tartiblash uchun konteyner (Tugmalar va narxlar pastda tekis turishi uchun)
    const actionContainer = document.createElement("div");
    actionContainer.className = "store-card-actions"; 
    actionContainer.style.marginTop = "auto"; // Elementlarni pastga suradi

    // 2. SHARTLI TEKSHIRUV: MONTHLY GIVING YOKI STANDART SAHIFA
    if (itemType === "monthly_giving") {
      // Membership Period: 1 month yozuvi
      const periodDiv = document.createElement("div");
      periodDiv.style.fontSize = "13px";
      periodDiv.style.fontWeight = "bold";
      periodDiv.style.marginBottom = "4px";
      periodDiv.style.color = "#000";
      periodDiv.textContent = "Membership Period: 1 month";

      // Narx yozuvi (Price: $XX.XX)
      const priceDiv = document.createElement("div");
      priceDiv.style.fontSize = "13px";
      priceDiv.style.fontWeight = "bold";
      priceDiv.style.marginBottom = "15px";
      priceDiv.style.color = "#000";
      priceDiv.textContent = `Price: ${money.format(Number(item.amount))}`;

      // Automatically Renew? Checkbox qismi
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
      // Standart holat (Masalan: Donate Now sahifasi bo'lsa, eski narx dizayni o'zgarmasdan qoladi)
      const price = document.createElement("div");
      price.className = "price";
      price.textContent = money.format(Number(item.amount));
      actionContainer.append(price);
    }

    // Savatga qo'shish tugmasi (Loyihaning asl klassidan foydalanadi)
    const button = document.createElement("button");
    button.className = "primary";
    button.type = "button";
    button.textContent = buttonLabel;
    button.addEventListener("click", () => addStoreItemToCart(item, itemType));

    actionContainer.append(button);
    
    // Elementlarni kartochkaga tartib bilan qo'shish
    card.append(cardTitle, description, actionContainer);
    grid.append(card);
  });

  app.append(grid);
}

// 🎯 SOVG'A VAUCHERI UCHUN ORIGINAL FORMANI XAVFSIZ GENERATSIYA QILISH
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

  // Dinamik radio button va email input boshqaruvi
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

  // Forma yuborilganda ishlash tizimi
  voucherForm.addEventListener('submit', async function(e) {
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

    // Asl saytdagi kabi qizil validatsiya xatolari
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

        // 1. Yangi modelimiz bo'yicha bazaga buyurtmani yozadi
        await apiFetch('/gift-certificates/', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        // 2. Mavjud savatcha tizimiga (Cart) moslab umumiy hisobga qo'shadi
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

async function loadPage(page) {
  state.page = page;
  setActiveNav(page);
  app.innerHTML = '<section class="loading-state">Loading...</section>';

  try {
    const config = pages[page];
    const data = await apiFetch(config.endpoint);
    config.renderer(data);
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

await loadCart();
await loadPage("events");