const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

window.addEventListener("load", () => {
  setTimeout(() => {
    $("#loader").classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }, 900);
});
document.body.classList.add("no-scroll");

const progress = $("#scrollProgress");
const toTop = $("#toTop");
const header = $("#header");
const nav = $("#nav");
const navToggle = $("#navToggle");

navToggle.addEventListener("click", () => nav.classList.toggle("open"));
$$(".nav a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function onScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const value = total > 0 ? (window.scrollY / total) * 100 : 0;
  progress.style.width = `${value}%`;
  toTop.classList.toggle("visible", window.scrollY > 700);
  header.classList.toggle("compact", window.scrollY > 60);
  updateActiveNav();
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function updateActiveNav() {
  const ids = ["inicio", "carrera", "perfiles", "oferta", "plan", "empresa", "galeria"];
  let current = ids[0];
  ids.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top < 160) current = id;
  });
  $$(".nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
$$(".reveal").forEach(el => revealObserver.observe(el));

$$(".feature-card, .neo-card, .profile-card, .university-card, .labor-card, .wall-card, .lab-card, .operation-card, .company-card").forEach(card => {
  card.classList.add("tilt-card");
  card.addEventListener("pointermove", event => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - .5) * 8;
    const rotateX = ((.5 - y / rect.height)) * 8;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 1 });
$$("[data-count]").forEach(el => counterObserver.observe(el));

function animateCount(el) {
  const target = Number(el.dataset.count);
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased).toLocaleString("es-MX");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const cursor = $("#cursor");
window.addEventListener("pointermove", event => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});
$$("a, button, .gallery img, details").forEach(el => {
  el.addEventListener("pointerenter", () => cursor.classList.add("active"));
  el.addEventListener("pointerleave", () => cursor.classList.remove("active"));
});

window.addEventListener("scroll", () => {
  $$(".parallax").forEach(el => {
    el.style.transform = `translateY(${window.scrollY * 0.12}px) scale(1.08)`;
  });
  $$(".float-card").forEach((el, index) => {
    el.style.translate = `0 ${window.scrollY * (0.012 + index * 0.004)}px`;
  });
}, { passive: true });

const slider = $("#photoSlider");
const photos = $$("img", slider);
let photoIndex = 0;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  photos.forEach((img, i) => img.classList.toggle("active", i === photoIndex));
}
$("#prevPhoto").addEventListener("click", () => showPhoto(photoIndex - 1));
$("#nextPhoto").addEventListener("click", () => showPhoto(photoIndex + 1));
setInterval(() => showPhoto(photoIndex + 1), 4200);

const lightbox = $("#lightbox");
const lightboxImg = $("img", lightbox);
const closeLightbox = $("button", lightbox);
$$(".gallery img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("open");
  });
});
closeLightbox.addEventListener("click", () => lightbox.classList.remove("open"));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) lightbox.classList.remove("open");
});

const canvas = $("#particles");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeParticles() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 14)) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: (Math.random() * 2 + 1) * devicePixelRatio,
    vx: (Math.random() - .5) * .35 * devicePixelRatio,
    vy: (Math.random() - .5) * .35 * devicePixelRatio
  }));
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.fillStyle = "rgba(15, 76, 129, .32)";
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const distance = Math.hypot(p.x - q.x, p.y - q.y);
      if (distance < 120 * devicePixelRatio) {
        ctx.strokeStyle = `rgba(212,160,23,${1 - distance / (120 * devicePixelRatio)})`;
        ctx.lineWidth = .35 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(drawParticles);
}
window.addEventListener("resize", resizeParticles);
resizeParticles();
drawParticles();

function drawBarChart(canvasId, labels, values, color = "#0F4C81") {
  const c = document.getElementById(canvasId);
  const context = c.getContext("2d");
  const w = c.width;
  const h = c.height;
  context.clearRect(0, 0, w, h);
  const max = Math.max(...values) * 1.12;
  const pad = 42;
  const gap = 18;
  const barW = (w - pad * 2 - gap * (values.length - 1)) / values.length;
  context.font = "600 13px Inter";
  values.forEach((value, i) => {
    const x = pad + i * (barW + gap);
    const barH = (h - 95) * (value / max);
    const y = h - 52 - barH;
    const grad = context.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "#D4A017");
    context.fillStyle = grad;
    roundRect(context, x, y, barW, barH, 12);
    context.fill();
    context.fillStyle = "#0B2545";
    context.textAlign = "center";
    context.fillText(value.toLocaleString("es-MX"), x + barW / 2, y - 10);
    context.fillStyle = "#5F6B73";
    wrapText(context, labels[i], x + barW / 2, h - 34, barW + 18, 14);
  });
}

function drawDonutChart(canvasId, items) {
  const c = document.getElementById(canvasId);
  const context = c.getContext("2d");
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let start = -Math.PI / 2;
  context.clearRect(0, 0, c.width, c.height);
  items.forEach(item => {
    const angle = (item.value / total) * Math.PI * 2;
    context.beginPath();
    context.moveTo(120, 120);
    context.arc(120, 120, 92, start, start + angle);
    context.fillStyle = item.color;
    context.fill();
    start += angle;
  });
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(120, 120, 54, 0, Math.PI * 2);
  context.fill();
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#0B2545";
  context.font = "800 20px Montserrat";
  context.textAlign = "center";
  context.fillText("2020", 120, 127);
  context.font = "600 13px Inter";
  items.forEach((item, i) => {
    context.fillStyle = item.color;
    context.fillRect(245, 70 + i * 36, 16, 16);
    context.fillStyle = "#5F6B73";
    context.textAlign = "left";
    context.fillText(`${item.label}: ${item.value}%`, 270, 83 + i * 36);
  });
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  words.forEach((word, index) => {
    const test = `${line}${word} `;
    if (context.measureText(test).width > maxWidth && index > 0) {
      context.fillText(line, x, lineY);
      line = `${word} `;
      lineY += lineHeight;
    } else {
      line = test;
    }
  });
  context.fillText(line, x, lineY);
}

const chartObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    drawBarChart("populationChart", ["Mujeres", "Hombres"], [51.5, 48.5], "#0F4C81");
    drawDonutChart("genderChart", [
      { label: "Mujeres", value: 51.5, color: "#0F4C81" },
      { label: "Hombres", value: 48.5, color: "#D4A017" }
    ]);
    drawBarChart("ageChart", ["0 a 4 años", "5 a 9 años", "10 a 14 años"], [33714, 32043, 31701], "#0B2545");
    drawBarChart("educationChart", ["Secundaria", "Primaria", "Preparatoria"], [59400, 56800, 54400], "#0F4C81");
    chartObserver.disconnect();
  });
}, { threshold: .2 });
["populationChart", "genderChart", "ageChart", "educationChart"].forEach(id => {
  const el = document.getElementById(id);
  if (el) chartObserver.observe(el);
});
