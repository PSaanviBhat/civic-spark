import { useMutation } from '@tanstack/react-query';
import { mediaEndpoints, PresignUploadRequest } from '@/api/endpoints/media';

export const usePresignUpload = () => {
  return useMutation({
    mutationFn: (data: PresignUploadRequest) => mediaEndpoints.presignUpload(data),
  });
};

export const useUploadToS3 = () => {
  return useMutation({
    mutationFn: ({ presignUrl, file }: { presignUrl: string; file: File }) =>
      mediaEndpoints.uploadToS3(presignUrl, file),
  });
};
