export const formatDuration = (days) => {
  const duration = Number(days);

  if (!duration || duration <= 0) {
    return "0 ngày";
  }

  if (duration % 365 === 0) {
    const years = duration / 365;
    return `${years} năm`;
  }

  if (duration % 30 === 0) {
    const months = duration / 30;
    return `${months} tháng`;
  }

  return `${duration} ngày`;
};
