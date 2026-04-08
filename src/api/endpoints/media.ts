import { apiClient } from '../client';

export interface PresignUploadRequest {
  filename: string;
  mime_type: string;
}

export interface PresignUploadResponse {
  upload_url: string;
  file_key: string;
}

export const mediaEndpoints = {
  presignUpload: async (data: PresignUploadRequest): Promise<PresignUploadResponse> => {
    return apiClient.post('/v1/media/presign-upload', data);
  },

  // Upload file directly to S3 using presigned URL
  uploadToS3: async (presignUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  },
};
