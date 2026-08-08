export const formatDateTime = (date) => {
  if (!date) {
    return "--";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "--";
  }

  const datePart = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(value)
    .replaceAll("/", "-");

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(value);

  return `${datePart} ${timePart}`;
};
