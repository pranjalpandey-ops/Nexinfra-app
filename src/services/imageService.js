export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=110d1e208aa951799d01622e955004b1",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Image upload failed.");
    }

    return data.data.url;
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw error;
  }
}