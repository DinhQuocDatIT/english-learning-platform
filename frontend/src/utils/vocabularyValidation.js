

export const validateWord = (value) => {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "Từ vựng không được để trống.";
  }

  if (trimmedValue.length > 100) {
    return "Từ vựng không được vượt quá 100 ký tự.";
  }

  return "";
};

export const validatePronunciation = (value) => {
  const pronunciation = value || "";

  if (pronunciation.length > 100) {
    return "Phát âm không được vượt quá 100 ký tự.";
  }

  return "";
};

export const validatePartOfSpeech = (value) => {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "Từ loại không được để trống.";
  }

  if (trimmedValue.length > 50) {
    return "Từ loại không được vượt quá 50 ký tự.";
  }

  return "";
};

export const validateMeaning = (value) => {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "Nghĩa của từ không được để trống.";
  }

  if (trimmedValue.length > 1000) {
    return "Nghĩa của từ không được vượt quá 1000 ký tự.";
  }

  return "";
};

export const validateExample = (value) => {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "Ví dụ không được để trống.";
  }

  if (trimmedValue.length > 1000) {
    return "Ví dụ không được vượt quá 1000 ký tự.";
  }

  return "";
};

export const validateMeaningItem = (item) => {
  return {
    partOfSpeech: validatePartOfSpeech(item?.partOfSpeech),

    meaning: validateMeaning(item?.meaning),

    example: validateExample(item?.example),
  };
};

export const validateVocabularyForm = (formData) => {
  const errors = {
    word: validateWord(formData?.word),

    pronunciation: validatePronunciation(formData?.pronunciation),

    meanings: [],
  };

  // @NotEmpty
  if (!formData?.meanings || formData.meanings.length === 0) {
    return errors;
  }

  errors.meanings = formData.meanings.map(validateMeaningItem);

  return errors;
};

export const hasVocabularyErrors = (errors) => {
  // Word
  if (errors?.word) {
    return true;
  }

  // Pronunciation
  if (errors?.pronunciation) {
    return true;
  }

  // @NotEmpty meanings
  if (!errors?.meanings || errors.meanings.length === 0) {
    return true;
  }

  // Meaning errors
  return errors.meanings.some(
    (item) => item?.partOfSpeech || item?.meaning || item?.example,
  );
};

export const emptyVocabularyErrors = {
  word: "",
  pronunciation: "",
  meanings: [],
};
