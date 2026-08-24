const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || "";

  return `${baseUrl.replace(/\/api\/?$/, "")}${imagePath}`;
};

export default getImageUrl;
