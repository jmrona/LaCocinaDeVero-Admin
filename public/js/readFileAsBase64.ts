export const readFileAsBase64 = (file: File, resize = false) =>
  new Promise((resolve, reject) => {
  if (!resize) {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  } else {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = e => {
      img.onload = () => {
        const imageQuality = 0.8;
        const maxWidth = 500;
        const maxHeight = 500;
        
        let {width, height} = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = width * scale;
          height = height * scale;
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", imageQuality);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e?.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }
});