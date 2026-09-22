/**
 * Shared sizing, care and delivery reference used by the product pages and the
 * standalone size guide. Values follow the standard international apparel
 * conversions (EU / UK / US / IT) and are superseded by final factory specs.
 */

/** Alpha size → international equivalents, plus body measurements to fit. */
export const SIZE_CONVERSIONS = [
  { size: "S", eu: "46", uk: "36", us: "36", it: "46", chestCm: "92–97", chestIn: "36–38" },
  { size: "M", eu: "48–50", uk: "38–40", us: "38–40", it: "48", chestCm: "98–104", chestIn: "38–41" },
  { size: "L", eu: "52", uk: "42", us: "42", it: "52", chestCm: "105–112", chestIn: "41–44" },
  { size: "XL", eu: "54", uk: "44", us: "44", it: "54", chestCm: "113–120", chestIn: "44–47" },
  { size: "XXL", eu: "56", uk: "46", us: "46", it: "56", chestCm: "121–128", chestIn: "48–50" },
];

/** Flat garment measurements in centimetres for the Cable Cotton knitwear block. */
export const GARMENT_MEASUREMENTS = {
  top: [
    { size: "S", chest: "55", length: "68", sleeve: "62.5", shoulder: "46" },
    { size: "M", chest: "58", length: "70", sleeve: "64", shoulder: "48" },
    { size: "L", chest: "61", length: "72", sleeve: "65.5", shoulder: "50" },
    { size: "XL", chest: "64", length: "74", sleeve: "67", shoulder: "52" },
    { size: "XXL", chest: "67", length: "76", sleeve: "68.5", shoulder: "54" },
  ],
  vest: [
    { size: "S", chest: "55", length: "64", sleeve: "—", shoulder: "38" },
    { size: "M", chest: "58", length: "66", sleeve: "—", shoulder: "40" },
    { size: "L", chest: "61", length: "68", sleeve: "—", shoulder: "42" },
    { size: "XL", chest: "64", length: "70", sleeve: "—", shoulder: "44" },
    { size: "XXL", chest: "67", length: "72", sleeve: "—", shoulder: "46" },
  ],
};

/** Accessories are cut to one size; measurements are absolute, not to-fit. */
export const ACCESSORY_MEASUREMENTS = {
  en: [
    { label: "Beanie — height", value: "24 cm (folded cuff 6 cm)" },
    { label: "Beanie — brim, unstretched", value: "50 cm · stretches to 62 cm" },
    { label: "Scarf — length", value: "180 cm" },
    { label: "Scarf — width", value: "30 cm" },
  ],
  pl: [
    { label: "Czapka — wysokość", value: "24 cm (podwinięty otok 6 cm)" },
    { label: "Czapka — obwód, nierozciągnięty", value: "50 cm · rozciąga się do 62 cm" },
    { label: "Szalik — długość", value: "180 cm" },
    { label: "Szalik — szerokość", value: "30 cm" },
  ],
};

/** Which measurement table a product should show, inferred from its slug. */
export function measurementKindFor(product) {
  const slug = `${product?.slug || ""} ${product?.category || ""}`.toLowerCase();
  if (/beanie|scarf|hat|glove|sock|accessor/.test(slug)) return "accessory";
  if (/vest/.test(slug)) return "vest";
  return "top";
}

export const CARE_INSTRUCTIONS = {
  en: [
    "Machine wash cold at 30°C on the wool or delicate cycle, or hand wash. Wash inside out with similar colours.",
    "Use a mild detergent formulated for wool and cotton knitwear. Do not bleach and do not use fabric softener.",
    "Do not tumble dry. Reshape while damp and dry flat, away from direct sunlight and heat.",
    "Cool iron on the reverse, maximum 110°C. Never iron directly over the 52°N emblem or the woven label.",
    "Professional dry cleaning is possible with petroleum solvent (P). Do not use trichloroethylene.",
    "Store folded rather than hung, so the shoulders keep their line. Remove occasional pilling with a knitwear comb — it is natural to cotton and settles after a few wears.",
  ],
  pl: [
    "Pranie w pralce w zimnej wodzie w 30°C, program do wełny lub delikatny, albo pranie ręczne. Pierz na lewej stronie z podobnymi kolorami.",
    "Używaj łagodnego detergentu do wełny i bawełnianych dzianin. Nie wybielaj i nie stosuj płynu zmiękczającego.",
    "Nie susz w suszarce bębnowej. Uformuj wilgotny sweter i susz na płasko, z dala od słońca i źródeł ciepła.",
    "Prasuj na lewej stronie w niskiej temperaturze, maksymalnie 110°C. Nigdy nie prasuj bezpośrednio po emblemacie 52°N ani po metce.",
    "Możliwe czyszczenie chemiczne rozpuszczalnikiem naftowym (P). Nie stosuj trichloroetylenu.",
    "Przechowuj złożone, nie na wieszaku, aby ramiona zachowały linię. Delikatne mechacenie usuwaj grzebieniem do dzianin — jest naturalne dla bawełny i ustępuje po kilku noszeniach.",
  ],
};

export const DELIVERY_INFO = {
  en: {
    shipping: [
      { region: "Poland", time: "1–2 working days", cost: "Free over 500 PLN · otherwise 19 PLN" },
      { region: "European Union", time: "2–5 working days", cost: "Free over 120 EUR · otherwise 25 EUR" },
      { region: "United Kingdom, Switzerland, Norway", time: "3–7 working days", cost: "35 EUR · duties payable on delivery" },
      { region: "Rest of world", time: "5–10 working days", cost: "45 EUR · duties and taxes payable on delivery" },
    ],
    notes: [
      "Orders are dispatched within 1–2 working days, Monday to Friday, from Warsaw. You receive a tracking link by email as soon as the parcel leaves us.",
      "Every order ships in recycled ROJOB packaging with a garment bag. Signature may be required for higher-value parcels.",
    ],
    returns: [
      "Returns are accepted within 30 days of delivery, and are free of charge within Poland and the European Union.",
      "As an EU consumer you additionally hold a statutory 14-day right of withdrawal from the day you receive the goods, without giving any reason.",
      "Items must be unworn, unwashed and returned with all tags and the original packaging intact.",
      "Refunds are issued to the original payment method within 14 days of us receiving the return.",
      "Size exchanges are free within Poland and the EU, subject to availability. Start a return or exchange by emailing info@rojob.eu with your order number.",
    ],
  },
  pl: {
    shipping: [
      { region: "Polska", time: "1–2 dni robocze", cost: "Gratis powyżej 500 PLN · poniżej 19 PLN" },
      { region: "Unia Europejska", time: "2–5 dni roboczych", cost: "Gratis powyżej 120 EUR · poniżej 25 EUR" },
      { region: "Wielka Brytania, Szwajcaria, Norwegia", time: "3–7 dni roboczych", cost: "35 EUR · cło płatne przy odbiorze" },
      { region: "Pozostałe kraje", time: "5–10 dni roboczych", cost: "45 EUR · cło i podatki płatne przy odbiorze" },
    ],
    notes: [
      "Zamówienia wysyłamy z Warszawy w ciągu 1–2 dni roboczych, od poniedziałku do piątku. Link do śledzenia otrzymasz e-mailem, gdy paczka od nas wyjedzie.",
      "Każde zamówienie wysyłamy w opakowaniu ROJOB z materiałów z recyklingu wraz z pokrowcem na odzież. Przy przesyłkach o wyższej wartości może być wymagany podpis.",
    ],
    returns: [
      "Zwroty przyjmujemy w ciągu 30 dni od dostawy; na terenie Polski i Unii Europejskiej są bezpłatne.",
      "Jako konsument w UE masz dodatkowo ustawowe prawo odstąpienia od umowy w ciągu 14 dni od otrzymania towaru, bez podania przyczyny.",
      "Produkty muszą być nienoszone, nieprane oraz zwrócone ze wszystkimi metkami i oryginalnym opakowaniem.",
      "Zwrot środków realizujemy na pierwotną metodę płatności w ciągu 14 dni od otrzymania przesyłki zwrotnej.",
      "Wymiana rozmiaru jest bezpłatna w Polsce i UE, w miarę dostępności. Zwrot lub wymianę zgłoś na info@rojob.eu, podając numer zamówienia.",
    ],
  },
};

export const FIT_NOTE = {
  en: "Cable Cotton knitwear is cut to a relaxed contemporary fit with a dropped shoulder. If you are between sizes, or prefer a closer line, take the smaller size. Measurements are of the garment laid flat and may vary by up to 2 cm.",
  pl: "Dzianiny Cable Cotton mają swobodny, współczesny krój z opuszczonym ramieniem. Jeśli jesteś pomiędzy rozmiarami lub wolisz bliższą sylwetce linię, wybierz mniejszy rozmiar. Wymiary podano dla produktu rozłożonego na płasko; mogą różnić się do 2 cm.",
};
