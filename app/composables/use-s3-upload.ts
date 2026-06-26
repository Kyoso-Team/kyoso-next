export const useS3Upload = () => {
  const route = useRoute("tournaments-slug");

  const uploading = ref(false);

  const uploadFile = async (file: File, assetType: "banner" | "logo") => {
    uploading.value = true;

    try {
      const { url, key } = await $fetch("/api/upload-url", {
        method: "POST",
        body: {
          slug: route.params.slug,
          filename: file.name,
          contentType: file.type,
          assetType,
        },
      });

      await $fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      }).then(async () => {
        await $fetch("/api/image", {
          method: "POST",
          body: {
            slug: route.params.slug,
            filename: file.name,
            key,
            assetType,
          },
        });
      });

      return { key };
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploadFile,
    uploading,
  };
};
