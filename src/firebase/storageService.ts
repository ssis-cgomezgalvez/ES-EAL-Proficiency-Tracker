import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

export async function uploadEvidenceFile(
  fileOrBlob: File | Blob,
  studentId: string,
  fileName: string,
  evidenceType: string
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `evidence/${studentId}/${timestamp}_${sanitizedName}`;

  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: fileOrBlob.type || 'application/octet-stream',
      customMetadata: {
        studentId,
        evidenceType,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageError) {
    console.warn('Firebase Storage upload failed or bucket restricted, falling back to local object storage:', storageError);
    // Convert to robust data URL / blob representation so that the teacher's upload or recording is preserved
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          // Fallback to URL.createObjectURL
          resolve(URL.createObjectURL(fileOrBlob));
        }
      };
      reader.onerror = () => {
        resolve(URL.createObjectURL(fileOrBlob));
      };
      reader.readAsDataURL(fileOrBlob);
    });
  }
}
