const config = {
  operationStart: "2026-04-01T07:00:00-03:00",
  goal: 63000,
  baseExams: 18470,
  basePeople: 12280,
  examsPerHour: 42,
  peoplePerHour: 29
};

const units = [
  {
    name: "Unidade Norte",
    specialty: "Especialidade: Ultrassom e Mamografia.",
    address: "Região Norte - UBS de apoio",
    hours: "7h às 19h",
    status: "Em operação"
  },
  {
    name: "Unidade Leste",
    specialty: "Especialidade: Raio-X e Eletrocardiograma.",
    address: "Região Leste - praça de atendimento",
    hours: "7h às 19h",
    status: "Em operação"
  },
  {
    name: "Unidade Central",
    specialty: "Especialidade: Ultrassom geral.",
    address: "Centro - ponto de apoio municipal",
    hours: "8h às 20h",
    status: "Em operação"
  },
  {
    name: "Unidade Sudeste",
    specialty: "Especialidade: Mamografia e exames de imagem.",
    address: "Região Sudeste - unidade escolar de apoio",
    hours: "7h às 19h",
    status: "Em operação"
  },
  {
    name: "Unidade Oeste",
    specialty: "Especialidade: Doppler e ultrassonografia.",
    address: "Região Oeste - complexo de saúde",
    hours: "7h às 19h",
    status: "Em operação"
  },
  {
    name: "Unidade Sul",
    specialty: "Especialidade: Exames cardiológicos.",
    address: "Região Sul - UBS de referência",
    hours: "8h às 18h",
    status: "Em operação"
  }
];

const formatNumber = new Intl.NumberFormat("pt-BR");

function getLiveNumbers() {
  const start = new Date(config.operationStart);
  const now = new Date();
  const elapsedHours = Math.max(0, (now - start) / 36e5);
  const elapsedDays = Math.max(1, Math.ceil((now - start) / 864e5));
  const exams = Math.min(config.goal, Math.floor(config.baseExams + elapsedHours * config.examsPerHour));
  const people = Math.floor(config.basePeople + elapsedHours * config.peoplePerHour);

  return { exams, people, elapsedDays };
}

function animateCounter(element, target) {
  const duration = 900;
  const start = performance.now();
  const initial = Number(element.dataset.value || 0);
  const change = target - initial;

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(initial + change * eased);
    element.textContent = formatNumber.format(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.dataset.value = target;
    }
  }

  requestAnimationFrame(tick);
}

function updateZerometer() {
  const { exams, people, elapsedDays } = getLiveNumbers();
  const counters = {
    exames: exams,
    pessoas: people,
    dias: elapsedDays
  };

  Object.entries(counters).forEach(([key, value]) => {
    const element = document.querySelector(`[data-counter="${key}"]`);
    if (element) animateCounter(element, value);
  });

  const percent = Math.min(100, (exams / config.goal) * 100);
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressLabel").textContent = `${percent.toFixed(1).replace(".", ",")}% da meta cumprida`;
  document.getElementById("progressSub").textContent = `${formatNumber.format(exams)} de ${formatNumber.format(config.goal)} exames previstos`;
}

function setUnit(index) {
  const unit = units[index];
  if (!unit) return;

  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.classList.toggle("active", Number(pin.dataset.unit) === index);
  });

  document.getElementById("unitStatus").textContent = unit.status;
  document.getElementById("unitName").textContent = unit.name;
  document.getElementById("unitSpecialty").textContent = unit.specialty;
  document.getElementById("unitAddress").textContent = unit.address;
  document.getElementById("unitHours").textContent = unit.hours;
}

function setupMap() {
  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.addEventListener("click", () => setUnit(Number(pin.dataset.unit)));
  });
}

function setupVideos() {
  const modal = document.getElementById("videoModal");
  const modalText = document.getElementById("modalText");
  const close = document.querySelector(".modal-close");

  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      modalText.textContent = card.dataset.video;
      modal.hidden = false;
      close.focus();
    });
  });

  close.addEventListener("click", () => {
    modal.hidden = true;
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.hidden = true;
  });
}

function setupAppointment() {
  const form = document.querySelector(".appointment-form");
  const message = document.getElementById("formMessage");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = new FormData(form).get("cpf").trim();

    if (!value) {
      message.textContent = "Digite um CPF ou protocolo para iniciar a consulta.";
      return;
    }

    message.textContent = "Consulta recebida. Integração com a regulação municipal pronta para conexão.";
  });
}

updateZerometer();
setupMap();
setupVideos();
setupAppointment();
setInterval(updateZerometer, 30000);
