const DEFAULT_TITLE = "Conversacion AI";
const MAX_TITLE_LENGTH = 72;

const normalizeWord = (word) =>
  word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const cleanTitleInput = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/^[^\p{L}\p{N}]+/gu, "")
    .replace(/[^\p{L}\p{N}]+$/gu, "")
    .trim();
};

const limitTitle = (value, maxLength = MAX_TITLE_LENGTH) => {
  if (value.length <= maxLength) return value;
  const slice = value.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return slice.slice(0, lastSpace);
  }
  return value.slice(0, maxLength);
};

export const buildConversationTitle = (message, fallback = DEFAULT_TITLE) => {
  const cleaned = cleanTitleInput(message);
  if (!cleaned) return fallback;

  const words = cleaned.split(/\s+/);
  const normalized = words.map(normalizeWord);
  let title = cleaned;

  const applyPrefix = (prefix, fromIndex) => {
    const remainder = words.slice(fromIndex).join(" ").trim();
    if (!remainder) return cleaned;
    return `${prefix}${remainder}`;
  };

  if (normalized[0] === "como") {
    title = applyPrefix("Guia para ", 1);
  } else if (normalized[0] === "ayudame" && normalized[1] === "a") {
    title = applyPrefix("Guia para ", 2);
  } else if (["necesito", "quiero", "podria", "podrias"].includes(normalized[0])) {
    title = applyPrefix("Guia para ", 1);
  } else if (["que", "cual"].includes(normalized[0])) {
    title = applyPrefix("Resumen de ", 1);
  } else if (["dame", "da", "genera", "generar", "crea", "crear"].includes(normalized[0])) {
    title = applyPrefix("", 1);
  }

  title = title.replace(/\s+/g, " ").trim();
  if (!title) return fallback;

  title = title.charAt(0).toUpperCase() + title.slice(1);

  return limitTitle(title, MAX_TITLE_LENGTH);
};
