const DATABASE_NAME = "zentrix-ai-image-storage";
const DATABASE_VERSION = 1;
const STORE_NAME = "generated-images";

interface StoredImage {
  id: string;
  blob: Blob;
  mediaType: string;
  createdAt: string;
}

function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Image storage is not supported by this browser."));
      return;
    }

    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error || new Error("Unable to open image storage."));
    };
  });
}

function imageToBlob(
  image: string,
  mediaType: string
): Blob {
  if (image.startsWith("data:")) {
    const response = fetch(image);

    return new Blob([], { type: mediaType });
  }

  const binary = atob(image);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mediaType });
}

/**
 * Save a generated image and return its storage ID.
 */
export async function saveGeneratedImage(
  image: string,
  mediaType = "image/png"
): Promise<string> {
  const blob = image.startsWith("data:")
    ? await fetch(image).then((response) => response.blob())
    : imageToBlob(image, mediaType);

  const database = await openImageDatabase();

  const id = crypto.randomUUID();

  const record: StoredImage = {
    id,
    blob,
    mediaType: blob.type || mediaType,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).put(record);

    transaction.oncomplete = () => {
      database.close();
      resolve(id);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Unable to save image."));
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Image storage was interrupted."));
    };
  });
}

/**
 * Retrieve a previously saved image.
 */
export async function getGeneratedImage(
  imageId: string
): Promise<Blob | null> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const request = transaction
      .objectStore(STORE_NAME)
      .get(imageId);

    request.onsuccess = () => {
      const result = request.result as StoredImage | undefined;
      resolve(result?.blob ?? null);
    };

    request.onerror = () => {
      reject(request.error || new Error("Unable to retrieve image."));
    };

    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

/**
 * Delete one generated image.
 */
export async function deleteGeneratedImage(
  imageId: string
): Promise<void> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).delete(imageId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Unable to delete image."));
    };
  });
}

/**
 * Create a temporary display URL for a stored image.
 * Remember to call URL.revokeObjectURL(url) when no longer needed.
 */
export async function getGeneratedImageUrl(
  imageId: string
): Promise<string | null> {
  const blob = await getGeneratedImage(imageId);

  if (!blob) return null;

  return URL.createObjectURL(blob);
    }
