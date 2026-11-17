/* Symbole aparatury chemicznej — zestaw wg załączonej karty (7 grup). */
const CATEGORIES = [
  { id: 'I', name: 'I. Magazynowanie gazów, cieczy i ciał stałych' },
  { id: 'II', name: 'II. Transport gazów, cieczy i ciał stałych' },
  { id: 'III', name: 'III. Rozdrabnianie i segregowanie ciał stałych' },
  { id: 'IV', name: 'IV. Oddzielanie od gazów/cieczy · wymiana ciepła' },
  { id: 'V', name: 'V. Oddzielanie cieczy i ciał stałych' },
  { id: 'VI', name: 'VI. Mieszanie' },
  { id: 'VII', name: 'VII. Absorpcja, rektyfikacja, ekstrakcja, suszenie' }
];

// Groty strzałek jako ścieżki (zgodne z Path2D).
const A = {
  R: (x, y, s = 5) => `M${x - s} ${y - s} L${x} ${y} L${x - s} ${y + s}`,
  L: (x, y, s = 5) => `M${x + s} ${y - s} L${x} ${y} L${x + s} ${y + s}`,
  U: (x, y, s = 5) => `M${x - s} ${y + s} L${x} ${y} L${x + s} ${y + s}`,
  D: (x, y, s = 5) => `M${x - s} ${y - s} L${x} ${y} L${x + s} ${y - s}`
};

const SYMBOLS = [
  // I — magazynowanie
  { id: 'I-1a', cat: 'I', num: '1a', name: 'Zbiornik otwarty, pionowy', p: ['M40 18 V72 H80 V18'] },
  { id: 'I-1b', cat: 'I', num: '1b', name: 'Zbiornik otwarty, poziomy', p: ['M20 38 V68 H100 V38'] },
  { id: 'I-2a', cat: 'I', num: '2a', name: 'Zbiornik zamknięty, pionowy', p: ['M45 18 H75 V72 H45 Z'] },
  { id: 'I-2b', cat: 'I', num: '2b', name: 'Zbiornik zamknięty, poziomy', p: ['M20 38 H100 V68 H20 Z'] },
  { id: 'I-3a', cat: 'I', num: '3a', name: 'Zbiornik ciśnieniowy, pionowy', p: ['M52 18 H68 Q75 18 75 25 V65 Q75 72 68 72 H52 Q45 72 45 65 V25 Q45 18 52 18 Z'] },
  { id: 'I-3b', cat: 'I', num: '3b', name: 'Zbiornik ciśnieniowy, poziomy', p: ['M30 38 H90 Q97 38 97 45 V61 Q97 68 90 68 H30 Q23 68 23 61 V45 Q23 38 30 38 Z'] },
  { id: 'I-4', cat: 'I', num: '4', name: 'Zbiornik kulisty', p: ['M60 20 A24 24 0 1 1 59.9 20 Z', 'M47 58 V78', 'M73 58 V78'] },
  { id: 'I-5', cat: 'I', num: '5', name: 'Beczka', p: ['M42 22 H78 V70 H42 Z', 'M42 34 H78', 'M42 58 H78'] },
  { id: 'I-6', cat: 'I', num: '6', name: 'Butla stalowa', p: ['M52 76 V28 Q52 16 60 16 Q68 16 68 28 V76', 'M48 76 H72'] },
  { id: 'I-7', cat: 'I', num: '7', name: 'Zbiornik gazu', p: ['M28 64 Q28 26 60 26 Q92 26 92 64', 'M24 64 H96', 'M14 50 L24 50', A.R(24, 50), 'M96 50 L106 50', A.R(106, 50)] },
  { id: 'I-8', cat: 'I', num: '8', name: 'Zasobnik jednowysypowy', p: ['M30 20 L60 72 L90 20'] },
  { id: 'I-9', cat: 'I', num: '9', name: 'Zasobnik wielowysypowy', p: ['M18 20 V42 L30 72 L42 42 V20', 'M42 20 V42 L54 72 L66 42 V20', 'M66 20 V42 L78 72 L90 42 V20'] },

  // II — transport
  { id: 'II-1', cat: 'II', num: '1', name: 'Pompa (symbol ogólny)', p: ['M40 48 A12 12 0 1 1 64 48 A12 12 0 1 1 40 48', 'M52 20 L52 36', A.D(52, 36), 'M22 48 H40', A.R(40, 48)], dots: [[52, 48, 2.5]] },
  { id: 'II-2', cat: 'II', num: '2', name: 'Wentylator', p: ['M36 48 A12 12 0 1 1 60 48 A12 12 0 1 1 36 48', 'M60 48 H90', 'M90 40 H104 V56 H90 Z'] },
  { id: 'II-3', cat: 'II', num: '3', name: 'Dmuchawa', p: ['M38 48 A14 14 0 1 1 66 48 A14 14 0 1 1 38 48', 'M52 41 A7 7 0 1 1 51.9 41 Z', 'M18 48 H38', A.R(38, 48), 'M66 48 H102', A.R(102, 48)] },
  { id: 'II-4', cat: 'II', num: '4', name: 'Sprężarka tłokowa', p: ['M28 62 A22 22 0 0 1 72 62', 'M24 62 H84', 'M84 52 H106 V70 H84 Z', 'M100 40 L100 52', A.D(100, 52)] },
  { id: 'II-5', cat: 'II', num: '5', name: 'Sprężarka wirnikowa', p: ['M38 30 L78 40 V68 L38 78 Z', 'M52 26 V82', 'M66 30 V78', 'M52 20 L52 30', A.D(52, 30), 'M66 78 L66 84', A.D(66, 84)] },
  { id: 'II-6', cat: 'II', num: '6', name: 'Strumienica (smoczek)', p: ['M30 38 L70 48 V58 L30 66 Z', 'M70 53 H106', A.R(106, 53), 'M14 30 L30 38', 'M50 22 L50 44', A.D(50, 44)] },
  { id: 'II-7', cat: 'II', num: '7', name: 'Przetłoczka', p: ['M44 30 Q44 20 54 20 Q64 20 64 30 V66 Q64 76 54 76 Q44 76 44 66 Z', 'M54 12 L54 20', A.D(54, 20), 'M54 76 L54 84', A.D(54, 84), 'M32 48 H44', A.R(44, 48), 'M64 48 H76', A.R(76, 48)] },
  { id: 'II-8', cat: 'II', num: '8', name: 'Przenośnik taśmowy', p: ['M30 50 H94', 'M30 60 H94', 'M30 50 A5 5 0 1 0 30 60 A5 5 0 1 0 30 50', 'M94 50 A5 5 0 1 0 94 60 A5 5 0 1 0 94 50', 'M48 42 H72', A.R(72, 42)] },

  // III — rozdrabnianie
  { id: 'III-1', cat: 'III', num: '1', name: 'Młyn (symbol ogólny)', p: ['M32 18 L52 36', 'M72 18 L52 36', 'M42 54 A14 14 0 1 1 70 54 A14 14 0 1 1 42 54', 'M56 68 L56 82', A.D(56, 82)] },
  { id: 'III-2', cat: 'III', num: '2', name: 'Kruszarka walcowa', p: ['M34 28 L40 60 L60 78 L80 60 L86 28', 'M48 45 A11 11 0 1 1 70 45 A11 11 0 1 1 48 45', 'M60 12 L60 28', A.D(60, 28)] },
  { id: 'III-3', cat: 'III', num: '3', name: 'Młyn kulowy', p: ['M36 48 A20 20 0 1 1 76 48 A20 20 0 1 1 36 48', 'M42 52 L48 46', 'M48 60 L54 46', 'M54 66 L60 46', 'M62 66 L67 46', 'M68 60 L72 48', 'M56 20 L56 28', A.D(56, 28), 'M56 68 L56 82', A.D(56, 82)] },
  { id: 'III-4', cat: 'III', num: '4', name: 'Gniotownik obiegowy', p: ['M38 30 V66 H78 V30', 'M58 30 V66', 'M26 18 L44 34', A.D(44, 34), 'M90 18 L72 34', A.D(72, 34), 'M58 66 L58 82', A.D(58, 82)] },
  { id: 'III-5', cat: 'III', num: '5', name: 'Sito potrzemne (wibracyjne)', p: ['M30 30 L86 44 L82 54 L26 40 Z', 'M34 22 L46 25', 'M52 18 L64 21', 'M24 14 L24 28', A.D(24, 28)] },
  { id: 'III-6', cat: 'III', num: '6', name: 'Wialnia', p: ['M46 24 H74 V70 H46 Z', 'M60 12 L60 24', A.D(60, 24), 'M74 38 H88', A.R(88, 38), 'M48 60 L56 52 L64 60 L72 52', 'M60 70 L60 82', A.D(60, 82)] },

  // IV — separacja gazów + wymiana ciepła
  { id: 'IV-1', cat: 'IV', num: '1', name: 'Cyklon', p: ['M46 24 H74 V50 L60 76 L46 50 Z', 'M60 10 L60 24', A.D(60, 24), 'M26 34 H46', A.R(46, 34), 'M52 36 H68 V46 H56'] },
  { id: 'IV-2', cat: 'IV', num: '2', name: 'Separator (symbol ogólny)', p: ['M44 30 Q44 18 60 18 Q76 18 76 30 V52 L60 76 L44 52 Z', 'M60 8 L60 18', A.D(60, 18), 'M28 36 H44', A.R(44, 36)] },
  { id: 'IV-3', cat: 'IV', num: '3', name: 'Filtr gazowy (symbol ogólny)', p: ['M32 30 H88 V60 H32 Z', 'M60 30 V60', 'M18 45 H32', A.R(32, 45), 'M60 60 L60 76', A.D(60, 76)] },
  { id: 'IV-4', cat: 'IV', num: '4', name: 'Elektrofiltr', p: ['M46 26 H74 V52 L60 76 L46 52 Z', 'M60 30 L53 46 H62 L56 60', 'M24 36 H46', A.R(46, 36)] },
  { id: 'IV-5', cat: 'IV', num: '5', name: 'Wymiennik ciepła (symbol ogólny)', p: ['M36 26 H84 V62 H36 Z', 'M40 44 H46 L50 36 L56 52 L62 36 L68 52 L72 44 H82', 'M40 16 L40 26', 'M80 16 L80 26', 'M40 62 L40 72', 'M80 62 L80 72', 'M24 44 H36', A.R(36, 44), 'M84 44 H96', A.R(96, 44)] },
  { id: 'IV-6', cat: 'IV', num: '6', name: 'Wymiennik ciepła płaszczowo-rurowy', p: ['M34 26 H86 V62 H34 Z', 'M44 30 V58', 'M52 30 V58', 'M60 30 V58', 'M68 30 V58', 'M76 30 V58', 'M34 16 L34 26', 'M86 62 L86 72', 'M20 44 H34', A.R(34, 44), 'M86 44 H100', A.R(100, 44)] },
  { id: 'IV-7', cat: 'IV', num: '7', name: 'Wężownica', p: ['M34 26 H86 V62 H34 Z', 'M42 32 H50 V56 H58 V32 H66 V56 H74 V32 H80', 'M34 16 L34 26', 'M86 62 L86 72', 'M20 44 H34', A.R(34, 44), 'M86 44 H100', A.R(100, 44)] },
  { id: 'IV-8', cat: 'IV', num: '8', name: 'Wyparka', p: ['M46 22 Q46 16 60 16 Q74 16 74 22 V52 L60 76 L46 52 Z', 'M52 28 V60', 'M60 28 V60', 'M68 28 V60', 'M60 8 L60 16', A.D(60, 16)] },

  // V — separacja cieczy
  { id: 'V-1', cat: 'V', num: '1', name: 'Osadnik (odstojnik)', p: ['M24 34 L30 62 H90 L96 34', 'M14 26 L24 34', A.D(24, 34), 'M96 34 H108', A.R(108, 34), 'M60 62 L60 78', A.D(60, 78)] },
  { id: 'V-2', cat: 'V', num: '2', name: 'Klasyfikator', p: ['M28 58 L92 32 L94 42 L30 68 Z', 'M40 56 L44 63', 'M52 51 L56 58', 'M64 46 L68 53', 'M76 41 L80 48', 'M88 36 L92 43'] },
  { id: 'V-3', cat: 'V', num: '3', name: 'Prasa filtracyjna', p: ['M26 36 H94 V58 H26 Z', 'M34 36 V58', 'M42 36 V58', 'M50 36 V58', 'M58 36 V58', 'M66 36 V58', 'M74 36 V58', 'M82 36 V58', 'M90 36 V58', 'M14 47 H26', A.R(26, 47), 'M60 58 L60 74', A.D(60, 74)] },
  { id: 'V-4', cat: 'V', num: '4', name: 'Filtr próżniowy', p: ['M38 40 A22 22 0 0 1 82 40 V60 H38 Z', 'M46 44 V60', 'M54 44 V60', 'M62 44 V60', 'M70 44 V60', 'M78 44 V60', 'M60 12 L60 30', A.D(60, 30), 'M82 50 H98', A.R(98, 50)] },
  { id: 'V-5', cat: 'V', num: '5', name: 'Wirówka filtracyjna', p: ['M42 26 H78 V66 H42 Z', 'M48 30 V62', 'M56 30 V62', 'M64 30 V62', 'M72 30 V62', 'M48 18 L48 26', 'M72 18 L72 26', 'M60 66 L60 80', A.D(60, 80)] },
  { id: 'V-6', cat: 'V', num: '6', name: 'Wirówka osadzająca', p: ['M42 26 H78 V66 H42 Z', 'M42 48 H78', 'M48 30 V62', 'M56 30 V62', 'M64 30 V62', 'M72 30 V62', 'M48 18 L48 26', 'M72 18 L72 26', 'M60 66 L60 80', A.D(60, 80)] },
  { id: 'V-7', cat: 'V', num: '7', name: 'Rozdzielacz cieczy', p: ['M46 24 H74 V46 L60 72 L46 46 Z', 'M47 50 H73', 'M52 56 H68', 'M60 8 L60 24', A.D(60, 24), 'M32 36 H46', A.R(46, 36), 'M74 36 H88', A.R(88, 36), 'M60 72 L60 82', A.D(60, 82)] },

  // VI — mieszanie
  { id: 'VI-1', cat: 'VI', num: '1', name: 'Mieszalnik (symbol ogólny)', p: ['M40 46 A16 16 0 1 1 72 46 A16 16 0 1 1 40 46', 'M48 18 L48 30', A.D(48, 30), 'M64 18 L64 30', A.D(64, 30), 'M56 62 L56 82', A.D(56, 82)] },
  { id: 'VI-2', cat: 'VI', num: '2', name: 'Mieszalnik z mieszadłem poziomym', p: ['M30 28 H90 V64 H30 Z', 'M22 46 H98', 'M44 38 V54', 'M60 38 V54', 'M76 38 V54', 'M98 38 L98 46', A.D(98, 46)] },
  { id: 'VI-3', cat: 'VI', num: '3', name: 'Mieszalnik bębnowy', p: ['M34 56 L76 24 L86 38 L44 70 Z', 'M34 56 A6 6 0 0 0 44 70', 'M76 24 A6 6 0 0 1 86 38', 'M80 16 A12 12 0 0 1 90 34', A.R(90, 34)] },
  { id: 'VI-4', cat: 'VI', num: '4', name: 'Mieszalnik z mieszadłem pionowym', p: ['M42 26 H78 V68 H42 Z', 'M60 14 V60', 'M50 52 L70 60', 'M70 52 L50 60', 'M52 12 A10 10 0 0 1 68 12', A.R(68, 12)] },
  { id: 'VI-5', cat: 'VI', num: '5', name: 'Mieszalnik z bełkotką', p: ['M36 30 V66 H84 V30', 'M44 66 V72', 'M54 66 V72', 'M64 66 V72', 'M74 66 V72', 'M48 16 L48 30', A.D(48, 30), 'M72 16 L72 30', A.D(72, 30)] },

  // VII — absorpcja, rektyfikacja, suszenie
  { id: 'VII-1', cat: 'VII', num: '1', name: 'Kolumna bezciśnieniowa z wypełnieniem', p: ['M40 20 H80 V68 H40 Z', 'M42 30 H78', 'M42 40 H78', 'M42 50 H78', 'M48 22 L58 68', 'M62 22 L72 68', 'M60 8 L60 20', A.D(60, 20), 'M40 44 H26', A.L(26, 44), 'M80 44 H94', A.R(94, 44), 'M60 68 L60 80', A.D(60, 80)] },
  { id: 'VII-2', cat: 'VII', num: '2', name: 'Kolumna bezciśnieniowa bez wypełnienia', p: ['M40 20 H80 V68 H40 Z', 'M60 26 V58', A.D(60, 58), 'M60 8 L60 20', A.D(60, 20), 'M40 44 H26', A.L(26, 44), 'M80 44 H94', A.R(94, 44), 'M60 68 L60 80', A.D(60, 80)] },
  { id: 'VII-3', cat: 'VII', num: '3', name: 'Kolumna ciśnieniowa z wypełnieniem', p: ['M46 22 Q46 16 60 16 Q74 16 74 22 V68 H46 Z', 'M48 30 H72', 'M48 40 H72', 'M48 50 H72', 'M50 24 L60 68', 'M66 24 L74 62', 'M60 6 L60 16', A.D(60, 16), 'M46 44 H32', A.L(32, 44), 'M74 44 H88', A.R(88, 44), 'M60 68 L60 80', A.D(60, 80)] },
  { id: 'VII-4', cat: 'VII', num: '4', name: 'Kolumna ciśnieniowa bez wypełnienia', p: ['M46 22 Q46 16 60 16 Q74 16 74 22 V68 H46 Z', 'M60 26 V58', A.D(60, 58), 'M60 6 L60 16', A.D(60, 16), 'M46 44 H32', A.L(32, 44), 'M74 44 H88', A.R(88, 44), 'M60 68 L60 80', A.D(60, 80)] },
  { id: 'VII-5', cat: 'VII', num: '5', name: 'Suszarka (symbol ogólny)', p: ['M24 36 H96 V58 H24 Z', 'M28 47 Q36 40 44 47 T60 47 T76 47 T92 47', 'M14 47 H24', A.R(24, 47), 'M96 47 H108', A.R(108, 47)] },
  { id: 'VII-6', cat: 'VII', num: '6', name: 'Suszarka bębnowa', p: ['M30 60 L74 24 L88 40 L44 76 Z', 'M40 52 L48 62', 'M56 40 L64 50', 'M72 28 L80 38', 'M18 26 L30 60', 'M88 40 L102 66', A.R(102, 66)] }
];
