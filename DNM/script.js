const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const eventStart = new Date("2026-07-05T10:00:00+07:00");
const eventEnd = new Date("2026-07-05T11:45:00+07:00");

function showToast(message) {
  const toast = $(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function initProgress() {
  const bar = $(".progress span");
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? Math.min((window.scrollY / max) * 100, 100) : 0}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initReveal() {
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
  items.forEach((item) => observer.observe(item));
}

function updateCountdown() {
  const distance = Math.max(eventStart.getTime() - Date.now(), 0);
  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance % 86_400_000) / 3_600_000);
  const minutes = Math.floor((distance % 3_600_000) / 60_000);
  const seconds = Math.floor((distance % 60_000) / 1_000);

  $("[data-days]").textContent = String(days).padStart(2, "0");
  $("[data-hours]").textContent = String(hours).padStart(2, "0");
  $("[data-minutes]").textContent = String(minutes).padStart(2, "0");
  $("[data-seconds]").textContent = String(seconds).padStart(2, "0");
}

function toCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadCalendar() {
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DNM Graduation//VI",
    "BEGIN:VEVENT",
    `DTSTART:${toCalendarDate(eventStart)}`,
    `DTEND:${toCalendarDate(eventEnd)}`,
    "SUMMARY:Lễ tốt nghiệp — Dương Nhật Minh",
    "LOCATION:Hội trường Nguyễn Văn Đạo\\, 144 Xuân Thủy\\, Cầu Giấy\\, Hà Nội",
    "DESCRIPTION:Trân trọng mời bạn đến chung vui trong ngày tốt nghiệp của Dương Nhật Minh.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "tot-nghiep-duong-nhat-minh.ics";
  link.click();
  URL.revokeObjectURL(url);
}

async function shareInvitation() {
  const data = {
    title: "The Big Grad — Dương Nhật Minh",
    text: "Trân trọng mời bạn đến chung vui trong ngày tốt nghiệp của Dương Nhật Minh!",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Đã sao chép đường dẫn");
  } catch {
    showToast("Hãy sao chép link trên trình duyệt");
  }
}

function initRsvp() {
  const modal = $("#rsvp-modal");
  const response = "Minh ơi, mình sẽ đến chung vui tại Lễ tốt nghiệp nhé!";
  const close = () => {
    modal.close();
    document.body.classList.remove("modal-open");
  };

  $("[data-rsvp]").addEventListener("click", () => {
    modal.showModal();
    document.body.classList.add("modal-open");
  });
  $("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener("close", () => document.body.classList.remove("modal-open"));

  $("[data-send-rsvp]").addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Xác nhận tham dự", text: response });
        close();
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(response);
      showToast("Đã sao chép lời xác nhận");
      close();
    } catch {
      showToast("Không thể sao chép tự động");
    }
  });
}

initProgress();
initReveal();
initRsvp();
updateCountdown();
setInterval(updateCountdown, 1000);
$("[data-calendar]").addEventListener("click", downloadCalendar);
$("[data-share]").addEventListener("click", shareInvitation);
