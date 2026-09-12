// src/constants/errorTypeConstants.js

/**
 * Map errorSubtype → thông tin hiển thị
 * Format: { displayName, description, example }
 */
export const ERROR_SUBTYPE_INFO = {
  // ===== TENSE =====
  PRESENT_SIMPLE: {
    displayName: "Chia động từ sai ở thì hiện tại đơn",
    description:
      "Khi nói về thói quen, sự thật. Nhớ: chủ ngữ 'he/she/it' thì động từ thêm -s/-es.",
    example: "She go to school → She goes to school",
  },
  PRESENT_CONTINUOUS: {
    displayName: "Dùng sai thì hiện tại tiếp diễn",
    description: "Khi nói việc đang xảy ra. Công thức: am/is/are + V-ing.",
    example: "She is go → She is going",
  },
  PRESENT_PERFECT: {
    displayName: "Dùng sai thì hiện tại hoàn thành",
    description:
      "Việc đã xảy ra nhưng còn liên quan hiện tại. Công thức: have/has + V3.",
    example: "I live here since 2020 → I have lived here since 2020",
  },
  PRESENT_PERFECT_CONTINUOUS: {
    displayName: "Dùng sai thì hiện tại hoàn thành tiếp diễn",
    description:
      "Nhấn mạnh việc kéo dài đến hiện tại. Công thức: have/has been + V-ing.",
    example: "I have waited for 2 hours → I have been waiting for 2 hours",
  },
  PAST_SIMPLE: {
    displayName: "Chia động từ sai ở thì quá khứ đơn",
    description: "Việc đã xảy ra và kết thúc. Nhớ học động từ bất quy tắc!",
    example: "I go yesterday → I went yesterday",
  },
  PAST_CONTINUOUS: {
    displayName: "Dùng sai thì quá khứ tiếp diễn",
    description: "Việc đang xảy ra trong quá khứ. Công thức: was/were + V-ing.",
    example: "I was watch TV → I was watching TV",
  },
  PAST_PERFECT: {
    displayName: "Dùng sai thì quá khứ hoàn thành",
    description:
      "Việc xảy ra trước 1 việc khác trong quá khứ. Công thức: had + V3.",
    example: "When I arrived, he left → he had left",
  },
  PAST_PERFECT_CONTINUOUS: {
    displayName: "Dùng sai thì quá khứ hoàn thành tiếp diễn",
    description: "Công thức: had been + V-ing.",
    example: "He had waited → He had been waiting",
  },
  FUTURE_SIMPLE: {
    displayName: "Dùng sai thì tương lai đơn",
    description: "Việc sẽ xảy ra. Công thức: will + V.",
    example: "I go tomorrow → I will go tomorrow",
  },
  FUTURE_CONTINUOUS: {
    displayName: "Dùng sai thì tương lai tiếp diễn",
    description: "Công thức: will be + V-ing.",
    example: "At 8pm I will study → I will be studying",
  },
  FUTURE_PERFECT: {
    displayName: "Dùng sai thì tương lai hoàn thành",
    description: "Công thức: will have + V3.",
    example: "By 2030, I finish → I will have finished",
  },
  FUTURE_PERFECT_CONTINUOUS: {
    displayName: "Dùng sai thì tương lai hoàn thành tiếp diễn",
    description: "Công thức: will have been + V-ing.",
    example: "By 2030, I will work → will have been working",
  },
  NEAR_FUTURE_GOING_TO: {
    displayName: "Dùng sai 'be going to'",
    description: "Kế hoạch đã định trước.",
    example: "I am going to visit my grandma (đã hẹn trước)",
  },
  MIXED_TENSE: {
    displayName: "Lẫn lộn nhiều thì trong câu",
    description: "Câu trộn nhiều thì không đúng ngữ cảnh.",
    example: "Yesterday I go to school → Yesterday I went to school",
  },

  // ===== ARTICLE =====
  A_AN: {
    displayName: "Dùng sai 'a' hoặc 'an'",
    description:
      "'a' đứng trước phụ âm, 'an' đứng trước nguyên âm (a,e,i,o,u).",
    example: "a apple → an apple",
  },
  THE: {
    displayName: "Dùng 'the' sai chỗ",
    description: "'the' dùng khi vật đã xác định.",
    example: "I like the music → I like music (nói chung)",
  },
  ZERO_ARTICLE: {
    displayName: "Thừa hoặc thiếu mạo từ",
    description: "Khi nói chung chung thì KHÔNG dùng a/an/the.",
    example: "I go to the school (nói chung) → I go to school",
  },
  A_AN_VS_THE: {
    displayName: "Nhầm giữa 'a/an' và 'the'",
    description: "'a/an' = lần đầu nhắc, chưa xác định. 'the' = đã xác định.",
    example: "I saw a cat. The cat was black",
  },

  // ===== PREPOSITION =====
  TIME_IN: {
    displayName: "Dùng sai 'in' chỉ thời gian",
    description: "'in' + tháng/năm/mùa/buổi.",
    example: "in Monday → on Monday, in 8pm → at 8pm",
  },
  TIME_ON: {
    displayName: "Dùng sai 'on' chỉ thời gian",
    description: "'on' + thứ/ngày cụ thể.",
    example: "on 2024 → in 2024, on the morning → in the morning",
  },
  TIME_AT: {
    displayName: "Dùng sai 'at' chỉ thời gian",
    description: "'at' + giờ cụ thể.",
    example: "at morning → in the morning",
  },
  PLACE_IN: {
    displayName: "Dùng sai 'in' chỉ nơi chốn",
    description: "'in' + không gian lớn/kín.",
    example: "at class → in the classroom, in the table → on the table",
  },
  PLACE_ON: {
    displayName: "Dùng sai 'on' chỉ nơi chốn",
    description: "'on' + bề mặt.",
    example: "on the room → in the room",
  },
  PLACE_AT: {
    displayName: "Dùng sai 'at' chỉ nơi chốn",
    description: "'at' + địa điểm cụ thể.",
    example: "in home → at home",
  },
  DIRECTION_TO: {
    displayName: "Dùng sai 'to' chỉ hướng",
    description: "'to' + đích đến.",
    example: "I go in school → I go to school",
  },
  MOVEMENT_INTO: {
    displayName: "Dùng sai 'into'",
    description: "'into' = đi vào trong.",
    example: "go in the room → go into the room",
  },
  AGENT_BY: {
    displayName: "Dùng sai 'by' trong câu bị động",
    description: "Câu bị động: be + V3 + by + tác nhân.",
    example: "written from Shakespeare → written by Shakespeare",
  },
  INSTRUMENT_WITH: {
    displayName: "Dùng sai 'with' chỉ công cụ",
    description: "'with' + công cụ.",
    example: "cut by a knife → cut with a knife",
  },
  PHRASAL_VERB: {
    displayName: "Dùng sai cụm động từ",
    description: "Động từ + giới từ tạo nghĩa mới.",
    example: "look after (chăm sóc) ≠ look for (tìm)",
  },
  ADJECTIVE_PREP: {
    displayName: "Dùng sai giới từ sau tính từ",
    description: "Tính từ đi kèm 1 giới từ cố định.",
    example: "interested on → interested in, good on → good at",
  },
  VERB_PREP: {
    displayName: "Dùng sai giới từ sau động từ",
    description: "Động từ đi kèm 1 giới từ cố định.",
    example: "depend in → depend on, belong with → belong to",
  },

  // ===== CONJUNCTION =====
  COORDINATING: {
    displayName: "Dùng sai liên từ kết hợp",
    description: "and, but, or, so — nối 2 câu ngang hàng.",
    example: "I like tea and coffee",
  },
  SUBORDINATING: {
    displayName: "Dùng sai liên từ phụ thuộc",
    description: "because, although, when, if — nối mệnh đề phụ.",
    example: "Because it rains, I stay home",
  },
  CORRELATIVE: {
    displayName: "Dùng sai liên từ tương quan",
    description: "both...and, either...or, neither...nor.",
    example: "Both my mom and my dad are teachers",
  },
  CONNECTING_ADVERB: {
    displayName: "Dùng sai trạng từ nối",
    description: "however, therefore, moreover — nối 2 câu.",
    example: "I was tired. However, I kept working",
  },
  WRONG_CONJUNCTION: {
    displayName: "Dùng sai hoặc thừa liên từ",
    description: "Lỗi phổ biến: 'Because...so...' — chỉ dùng 1 trong 2.",
    example: "Because it rains, so I stay home → bỏ 'so'",
  },

  // ===== STRUCTURE =====
  WORD_ORDER: {
    displayName: "Sắp xếp từ sai thứ tự",
    description: "Tiếng Anh: Chủ ngữ + Động từ + Tân ngữ.",
    example: "I very like it → I like it very much",
  },
  SUBJECT_VERB_AGREEMENT: {
    displayName: "Chia động từ sai với chủ ngữ",
    description: "Chủ ngữ 'he/she/it' → động từ thêm -s/-es.",
    example: "She go → She goes, He play → He plays",
  },
  MISSING_SUBJECT: {
    displayName: "Thiếu chủ ngữ",
    description: "Tiếng Anh luôn phải có chủ ngữ.",
    example: "Is raining → It is raining",
  },
  MISSING_VERB: {
    displayName: "Thiếu động từ chính",
    description: "Câu phải có động từ chính.",
    example: "She happy → She is happy",
  },
  MISSING_OBJECT: {
    displayName: "Thiếu tân ngữ",
    description: "Một số động từ cần tân ngữ.",
    example: "I like → I like it",
  },
  DOUBLE_NEGATIVE: {
    displayName: "Dùng 2 lần phủ định",
    description: "Tiếng Anh không dùng 2 phủ định.",
    example: "I don't know nothing → I don't know anything",
  },
  DOUBLE_VERB: {
    displayName: "Dùng 2 động từ chính trong câu",
    description: "Không dùng 2 động từ chính.",
    example: "She is go to school → She goes to school",
  },
  REDUNDANCY: {
    displayName: "Lặp từ không cần thiết",
    description: "Dùng từ đồng nghĩa lặp lại gây dư thừa.",
    example: "return back → return, repeat again → repeat",
  },
  FRAGMENT: {
    displayName: "Câu chưa hoàn chỉnh",
    description: "Câu thiếu mệnh đề chính.",
    example: "Because I'm tired. → Because I'm tired, I go to bed",
  },
  RUN_ON: {
    displayName: "Câu dài không ngắt",
    description: "Nhiều câu nối bằng dấu phẩy.",
    example: "I like tea, I like coffee → I like tea and coffee",
  },

  // ===== POS =====
  NOUN_ADJECTIVE: {
    displayName: "Dùng sai loại từ (danh từ ↔ tính từ)",
    description: "Danh từ chỉ vật, tính từ chỉ đặc điểm.",
    example: "a success man → a successful man",
  },
  ADJECTIVE_ADVERB: {
    displayName: "Dùng sai loại từ (tính từ ↔ trạng từ)",
    description: "Trạng từ bổ nghĩa động từ.",
    example: "run quick → run quickly, speak slow → speak slowly",
  },
  VERB_NOUN: {
    displayName: "Dùng sai loại từ (động từ ↔ danh từ)",
    description: "VD: 'decide' (V) vs 'decision' (N).",
    example: "make a decide → make a decision",
  },
  PRONOUN: {
    displayName: "Dùng sai đại từ",
    description: "I/me/my, he/him/his, she/her/her.",
    example: "Me go to school → I go to school",
  },
  REFLEXIVE_PRONOUN: {
    displayName: "Dùng sai đại từ phản thân",
    description: "myself, yourself, himself, herself, itself.",
    example: "I hurt me → I hurt myself",
  },
  POSSESSIVE: {
    displayName: "Dùng sai dạng sở hữu",
    description: "'its' (sở hữu) vs 'it's' (it is).",
    example: "Its raining → It's raining",
  },
  DEMONSTRATIVE: {
    displayName: "Dùng sai chỉ định từ",
    description: "this/these (gần), that/those (xa).",
    example: "this books → these books",
  },
  QUANTIFIER: {
    displayName: "Dùng sai lượng từ",
    description: "'much' + không đếm được, 'many' + đếm được.",
    example: "much books → many books",
  },
  DETERMINER: {
    displayName: "Dùng sai hạn định từ",
    description: "some/any, a few/a little, each/every.",
    example: "a few money → a little money",
  },

  // ===== VERB =====
  IRREGULAR_PAST: {
    displayName: "Chia sai động từ bất quy tắc (quá khứ)",
    description: "Cần học thuộc bảng động từ bất quy tắc.",
    example: "goed → went, seed → saw, eated → ate",
  },
  IRREGULAR_PAST_PARTICIPLE: {
    displayName: "Chia sai động từ bất quy tắc (V3)",
    description: "Dùng trong thì hoàn thành và bị động.",
    example: "goed → gone, seed → seen, eated → eaten",
  },
  MODAL_VERB: {
    displayName: "Dùng sai động từ khiếm khuyết",
    description: "Sau modal KHÔNG có 'to'.",
    example: "can to go → can go, must to do → must do",
  },
  GERUND_INFINITIVE: {
    displayName: "Dùng sai V-ing hoặc to-V",
    description: "enjoy + V-ing, want + to-V.",
    example: "want going → want to go, enjoy to read → enjoy reading",
  },
  PASSIVE_VOICE: {
    displayName: "Dùng sai câu bị động",
    description: "Công thức: be + V3.",
    example: "is wrote → is written",
  },
  CAUSATIVE: {
    displayName: "Dùng sai câu sai khiến",
    description: "make/let/have + tân ngữ + V (không 'to').",
    example: "make him to go → make him go",
  },
  REPORTED_SPEECH: {
    displayName: "Dùng sai câu tường thuật",
    description: "Khi tường thuật phải lùi thì.",
    example: "He said 'I am tired' → He said he was tired",
  },
  CONDITIONAL: {
    displayName: "Dùng sai câu điều kiện",
    description: "Câu ĐK loại 2: If + QK đơn, would + V.",
    example: "If I have time, I will learn → If I had time, I would learn",
  },
  WISH_CLAUSE: {
    displayName: "Dùng sai câu ước (wish)",
    description: "wish + QK đơn (hiện tại), wish + QK hoàn thành (quá khứ).",
    example: "I wish I am rich → I wish I were rich",
  },

  // ===== NATURALNESS =====
  VIETLISH: {
    displayName: "Dịch sát nghĩa tiếng Việt",
    description: "Người Việt hay dịch word-by-word.",
    example: "I very like it → I really like it",
  },
  LITERAL_TRANSLATION: {
    displayName: "Dịch từng từ một",
    description: "Dịch từng từ thay vì dịch theo cụm nghĩa.",
    example: "Thank you many much → Thank you very much",
  },
  FORMALITY: {
    displayName: "Dùng từ sai mức trang trọng",
    description: "Dùng slang trong văn formal hoặc ngược lại.",
    example: "gonna (trong email công việc) → going to",
  },
  AWKWARD_PHRASING: {
    displayName: "Diễn đạt lủng củng",
    description: "Câu đúng ngữ pháp nhưng không tự nhiên.",
    example: "I have a question to ask you about → I have a question for you",
  },
};

/**
 * Map errorCategory → tên tiếng Việt (fallback)
 */
export const ERROR_CATEGORY_NAMES = {
  TENSE: "Lỗi về thì",
  ARTICLE: "Lỗi về mạo từ",
  PREPOSITION: "Lỗi về giới từ",
  CONJUNCTION: "Lỗi về liên từ",
  STRUCTURE: "Lỗi về cấu trúc câu",
  POS: "Lỗi về loại từ",
  VERB: "Lỗi về động từ",
  NATURALNESS: "Lỗi về độ tự nhiên",
  // Legacy
  GRAMMAR: "Lỗi ngữ pháp",
  VOCABULARY: "Lỗi từ vựng",
  WORD_ORDER: "Lỗi trật tự từ",
  WORD_CHOICE: "Dùng từ chưa phù hợp",
  SPELLING: "Lỗi chính tả",
  MISSING_WORD: "Thiếu từ",
  EXTRA_WORD: "Thừa từ",
  PUNCTUATION: "Lỗi dấu câu",
  CAPITALIZATION: "Lỗi viết hoa",
};

/**
 * Helper: Lấy tên hiển thị (ngắn)
 */
export const getDisplayName = (error) => {
  if (typeof error === "object" && error !== null) {
    const subtype = error.errorSubtype;
    const category = error.errorCategory || error.errorType;

    if (subtype && ERROR_SUBTYPE_INFO[subtype]) {
      return ERROR_SUBTYPE_INFO[subtype].displayName;
    }
    if (category && ERROR_CATEGORY_NAMES[category]) {
      return ERROR_CATEGORY_NAMES[category];
    }
    return subtype || category || "Lỗi khác";
  }
  return (
    ERROR_SUBTYPE_INFO[error]?.displayName ||
    ERROR_CATEGORY_NAMES[error] ||
    error
  );
};

/**
 * Helper: Lấy mô tả chi tiết
 */
export const getDescription = (error) => {
  if (typeof error === "object" && error !== null) {
    const subtype = error.errorSubtype;
    if (subtype && ERROR_SUBTYPE_INFO[subtype]) {
      return ERROR_SUBTYPE_INFO[subtype].description;
    }
    return "";
  }
  return ERROR_SUBTYPE_INFO[error]?.description || "";
};

/**
 * Helper: Lấy ví dụ
 */
export const getExample = (error) => {
  if (typeof error === "object" && error !== null) {
    const subtype = error.errorSubtype;
    if (subtype && ERROR_SUBTYPE_INFO[subtype]) {
      return ERROR_SUBTYPE_INFO[subtype].example;
    }
    return "";
  }
  return ERROR_SUBTYPE_INFO[error]?.example || "";
};

/**
 * Helper: Build errorKey
 */
export const buildErrorKey = (error) => {
  if (!error) return "OTHER";
  if (error.errorKey) return error.errorKey;

  const category = error.errorCategory || error.errorType;
  const subtype = error.errorSubtype;

  if (category && subtype) {
    return `${category}_${subtype}`;
  }
  return category || "OTHER";
};
