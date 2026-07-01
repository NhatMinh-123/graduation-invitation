const config = window.INVITATION_CONFIG || {};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function showToast(message) {
  const toast = $(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateEventDetails() {
  const date = $("[data-event-date]");
  const location = $("[data-event-location]");
  const mapLink = $("[data-map-link]");
  const calendarButton = $("[data-calendar]");

  date.textContent = config.dateDisplay || "Thời gian sẽ được cập nhật";
  location.textContent = config.locationDisplay || "Địa điểm sẽ được cập nhật";

  const mapUrl =
    config.mapUrl ||
    (config.locationAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.locationAddress)}`
      : "");

  if (mapUrl) {
    mapLink.href = mapUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.classList.remove("is-disabled");
    mapLink.removeAttribute("aria-disabled");
  } else {
    mapLink.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("Địa điểm sẽ sớm được cập nhật.");
    });
  }

  if (config.startTime) {
    calendarButton.disabled = false;
  }
}

function handlePortraits() {
  $$(".portrait-wrap img").forEach((image) => {
    const markMissing = () => image.classList.add("is-missing");
    image.addEventListener("error", markMissing);
    if (image.complete && image.naturalWidth === 0) markMissing();
  });
}

function normalizeAccessCode(value) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
}

async function hashAccessCode(value) {
  const bytes = new TextEncoder().encode(normalizeAccessCode(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function initGraduateAccess() {
  const accessByGraduate = {
    minh: {
      name: "Dương Nhật Minh",
      codes: [
        "7bda4d1520c4eb6a2dac7c9d8c899a1604dcdffc3f1bb29bdcf5ee7eaee9fc03",
        "ee8edc8b5587dea0ff69cd460f7fd6909e187bb885840a351a434c86d68ed4e8",
        "14b9007263281acc889a3d3937356119762ad13562c379f2567ea651fb491f87",
      ],
    },
    anh: {
      name: "Đỗ Nhất Anh",
      codes: [
        "ef45d840d82cb096053650d9817cf8f809eced445d35491bdf34ceced4c4c053",
        "ee8edc8b5587dea0ff69cd460f7fd6909e187bb885840a351a434c86d68ed4e8",
        "14b9007263281acc889a3d3937356119762ad13562c379f2567ea651fb491f87",
      ],
    },
    nguyen: {
      name: "Nguyễn Chí Nguyên",
      codes: [
        "090051cd9967d421a12d80049d0bfb2556399e43de205fb7607d62b4b4e23791",
        "ee8edc8b5587dea0ff69cd460f7fd6909e187bb885840a351a434c86d68ed4e8",
        "14b9007263281acc889a3d3937356119762ad13562c379f2567ea651fb491f87",
      ],
    },
    nam: {
      name: "Nguyễn Hữu Nam",
      codes: [
        "88e3956943102b9c340a869f4cf37e6cd54a013897ec8c6555482da05a140ae0",
        "ee8edc8b5587dea0ff69cd460f7fd6909e187bb885840a351a434c86d68ed4e8",
        "14b9007263281acc889a3d3937356119762ad13562c379f2567ea651fb491f87",
      ],
    },
    hoangminh: {
      name: "Hoàng Nhật Minh",
      codes: [
        "7bda4d1520c4eb6a2dac7c9d8c899a1604dcdffc3f1bb29bdcf5ee7eaee9fc03",
        "ee8edc8b5587dea0ff69cd460f7fd6909e187bb885840a351a434c86d68ed4e8",
        "fadf4f5f6b75c2bf189ecf2cf74fd556968564315c94559bf92269699d14925e",
        "14b9007263281acc889a3d3937356119762ad13562c379f2567ea651fb491f87",
      ],
    },
  };

  const cards = $$(".graduate-card[data-graduate]");
  const modal = $("#access-modal");
  const gate = $(".access-gate", modal);
  const thankYou = $(".thank-you-view", modal);
  const form = $("#access-form", modal);
  const input = $('input[name="accessCode"]', form);
  const error = $(".access-error", form);
  let selectedGraduate = null;
  let selectedGraduateKey = null;

  const renderThankYou = (graduateKey) => {
    const container = $("[data-thank-you-copy]", modal);
    const messageBlocks = window.THANK_YOU_MESSAGES?.[graduateKey] || [];
    container.replaceChildren();

    messageBlocks.forEach((block) => {
      const section = document.createElement("section");

      if (block.heading) {
        const heading = document.createElement("h3");
        heading.textContent = block.heading;
        section.appendChild(heading);
      }

      block.paragraphs.forEach((paragraph) => {
        const text = document.createElement("p");
        text.textContent = paragraph;
        section.appendChild(text);
      });

      container.appendChild(section);
    });
  };

  const close = () => {
    modal.close();
    document.body.classList.remove("modal-open");
  };

  const open = (graduateKey) => {
    selectedGraduateKey = graduateKey;
    selectedGraduate = accessByGraduate[graduateKey];
    if (!selectedGraduate) return;

    form.reset();
    error.hidden = true;
    gate.hidden = false;
    thankYou.hidden = true;
    $("[data-access-name]", modal).textContent = selectedGraduate.name;
    $("[data-thank-you-name]", modal).textContent = selectedGraduate.name;
    modal.showModal();
    document.body.classList.add("modal-open");
    window.setTimeout(() => input.focus(), 80);
  };

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");

    const openCard = () => open(card.dataset.graduate);
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCard();
    });
  });

  input.addEventListener("input", () => {
    input.value = normalizeAccessCode(input.value);
    error.hidden = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submittedCode = await hashAccessCode(input.value);
    const isValid = selectedGraduate?.codes.includes(submittedCode);

    if (!isValid) {
      error.hidden = false;
      input.select();
      input.focus();
      modal.classList.remove("access-denied");
      void modal.offsetWidth;
      modal.classList.add("access-denied");
      return;
    }

    gate.hidden = true;
    renderThankYou(selectedGraduateKey);
    thankYou.hidden = false;
    modal.scrollTop = 0;
  });

  $$('[data-close-access]', modal).forEach((button) => button.addEventListener("click", close));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
}

function initRevealAnimations() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 4) * 80, 240)}ms`;
    observer.observe(item);
  });
}

function initProgressBar() {
  const bar = $(".page-progress span");
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function toCalendarDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadCalendar() {
  if (!config.startTime) return;
  const start = toCalendarDate(config.startTime);
  const end = config.endTime
    ? toCalendarDate(config.endTime)
    : toCalendarDate(new Date(new Date(config.startTime).getTime() + 2 * 60 * 60 * 1000));
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Graduation Invitation//VI",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${config.eventTitle || "Lễ tốt nghiệp"}`,
    `LOCATION:${(config.locationAddress || config.locationDisplay || "").replace(/,/g, "\\,")}`,
    "DESCRIPTION:Trân trọng kính mời bạn đến chung vui cùng Minh, Nhất Anh, Chí Nguyên, Nguyễn Hữu Nam và Hoàng Nhật Minh.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "le-tot-nghiep-nhom-sinh-vien-2026.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function initRsvp() {
  const modal = $("#rsvp-modal");
  const form = $("#rsvp-form");
  const success = $(".rsvp-success", modal);
  let responseText = "";

  const open = () => {
    form.hidden = false;
    success.hidden = true;
    modal.showModal();
    document.body.classList.add("modal-open");
  };

  const close = () => {
    modal.close();
    document.body.classList.remove("modal-open");
  };

  $$('[data-open-rsvp]').forEach((button) => button.addEventListener("click", open));
  $("[data-close-rsvp]").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener("close", () => document.body.classList.remove("modal-open"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const guestName = data.get("guestName");
    const attendance = data.get("attendance");
    const message = data.get("message");
    responseText = [
      `Xin chào Minh, Nhất Anh, Chí Nguyên, Nguyễn Hữu Nam và Hoàng Nhật Minh! Mình là ${guestName}.`,
      `Phản hồi: ${attendance}.`,
      message ? `Lời nhắn: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(responseText);
    } catch {
      // Web Share vẫn hoạt động nếu trình duyệt không cấp quyền clipboard.
    }

    form.hidden = true;
    success.hidden = false;
  });

  $("[data-share-response]").addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Phản hồi thiệp mời tốt nghiệp", text: responseText });
      } catch (error) {
        if (error.name !== "AbortError") showToast("Không thể mở ứng dụng chia sẻ.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(responseText);
        showToast("Đã sao chép phản hồi!");
      } catch {
        showToast("Hãy sao chép và gửi phản hồi qua ứng dụng nhắn tin nhé.");
      }
    }
  });
}

function initShare() {
  $("[data-share]").addEventListener("click", async () => {
    const shareData = {
      title: "Thiệp mời Lễ tốt nghiệp",
      text: "Trân trọng mời bạn đến chung vui trong Lễ tốt nghiệp của Minh, Nhất Anh, Chí Nguyên, Nguyễn Hữu Nam và Hoàng Nhật Minh!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") showToast("Không thể mở ứng dụng chia sẻ.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép đường dẫn thiệp mời!");
    } catch {
      showToast("Hãy sao chép đường dẫn trên thanh địa chỉ nhé.");
    }
  });
}

updateEventDetails();
handlePortraits();
initGraduateAccess();
initRevealAnimations();
initProgressBar();
initRsvp();
initShare();
$("[data-calendar]").addEventListener("click", downloadCalendar);
