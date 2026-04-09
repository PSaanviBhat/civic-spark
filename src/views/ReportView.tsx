import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronLeft, ImagePlus, MapPin, Send, Upload, X } from 'lucide-react';

import { useCreateIssue } from '@/hooks/api/useIssues';
import { usePresignUpload, useUploadToS3 } from '@/hooks/api/useMedia';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, IssueCategory } from '@/types/civic';
import { cn } from '@/lib/utils';

interface ReportViewProps {
  onBack?: () => void;
}

const fallbackLocation = {
  lat: 12.9716,
  lng: 77.5946,
  address: 'Bengaluru, Karnataka',
};

export function ReportView({ onBack }: ReportViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(fallbackLocation);
  const [statusMessage, setStatusMessage] = useState('');

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const createIssue = useCreateIssue();
  const presignUpload = usePresignUpload();
  const uploadToS3 = useUploadToS3();

  const canSubmit = Boolean(selectedCategory && title.trim() && description.trim().length > 10);
  const totalXp = photo ? 30 : 20;
  const isUploading = presignUpload.isPending || uploadToS3.isPending || createIssue.isPending;

  const locationLabel = useMemo(
    () => `${location.address} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
    [location],
  );

  const handleCaptureLocation = () => {
    setStatusMessage('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current device location',
        });
        setStatusMessage('Location captured from your device.');
      },
      () => {
        setLocation(fallbackLocation);
        setStatusMessage('Location permission denied. Using Bengaluru fallback coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStep(3);
    setStatusMessage('Photo selected. It will be uploaded to S3 when you submit.');
    event.target.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !canSubmit) return;

    try {
      setStatusMessage('Preparing upload and verification...');

      let mediaKeys: string[] | undefined;
      if (photo) {
        const presigned = await presignUpload.mutateAsync({
          filename: photo.name,
          mime_type: photo.type || 'image/jpeg',
        });

        await uploadToS3.mutateAsync({
          presignUrl: presigned.upload_url,
          file: photo,
        });

        mediaKeys = [presigned.file_key];
      }

      await createIssue.mutateAsync({
        title,
        description,
        category: selectedCategory,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        media_keys: mediaKeys,
      });

      setStatusMessage('Issue submitted. Your uploaded image is now queued for cloud verification.');
      setTitle('');
      setDescription('');
      setSelectedCategory(null);
      setPhoto(null);
      setPhotoPreview('');
      setStep(1);
      onBack?.();
    } catch (error: any) {
      setStatusMessage(error.message ?? 'Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="iconSm" className="mt-0.5 shrink-0" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight">Report Issue</h1>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground sm:max-w-sm">
                    Photo upload, geolocation, and cloud verification
                  </p>
                </div>
                <Badge variant="xp" className="w-fit text-xs">+20 XP</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 px-4 pb-3">
          {[1, 2, 3].map((currentStep) => (
            <div
              key={currentStep}
              className={cn('flex-1 h-1 rounded-full transition-all duration-300', currentStep <= step ? 'gradient-hero' : 'bg-muted')}
            />
          ))}
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold mb-3">What type of issue is this?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setStep(2);
                }}
                className={cn(
                  'flex min-h-[108px] flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200',
                  selectedCategory === category.id ? 'border-primary bg-primary/5 shadow-card' : 'border-border hover:border-primary/50',
                )}
              >
                <span className="mb-2 text-3xl">{category.icon}</span>
                <span className="text-xs font-medium leading-snug">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-3">Attach evidence</h2>
              {!photo ? (
                <Card className="border-2 border-dashed border-primary/30 bg-primary/5 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-primary">Add Photo Evidence</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Use your camera on mobile or choose an existing image.
                    </p>
                    <div className="mt-5 grid w-full max-w-sm gap-3 sm:grid-cols-2">
                      <Button variant="hero" className="w-full" onClick={() => cameraInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => galleryInputRef.current?.click()}>
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Choose Photo
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Badge variant="outline" className="text-xs">AWS S3</Badge>
                      <Badge variant="outline" className="text-xs">AI Verification</Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                      <img src={photoPreview} alt="Issue preview" className="w-full h-full object-cover" />
                    </div>
                    <Button
                      variant="destructive"
                      size="iconSm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Badge variant="resolved" className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] text-xs">
                      Uploaded on submit (+10 XP)
                    </Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" className="w-full justify-center" onClick={() => cameraInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      Retake Photo
                    </Button>
                    <Button variant="outline" className="w-full justify-center" onClick={() => galleryInputRef.current?.click()}>
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Replace Image
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold mb-3">Issue title</h2>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Short summary"
                  className="w-full h-12 px-4 rounded-2xl bg-muted border-2 border-border focus:border-primary focus:outline-none text-sm transition-colors"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-3">Describe the issue</h2>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the issue clearly so the backend can classify and verify it."
                  className="w-full h-32 p-4 rounded-2xl bg-muted border-2 border-border focus:border-primary focus:outline-none resize-none text-sm transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1.5 text-right">{description.length}/500 characters</p>
              </div>
            </div>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-sm font-semibold mb-3">Location</h2>
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Active location</p>
                    <p className="text-xs leading-relaxed text-muted-foreground break-words">{locationLabel}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleCaptureLocation}>
                    <Upload className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="border-2 border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">XP You'll Earn</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Report issue</span>
                <Badge variant="xp" className="text-xs">+20 XP</Badge>
              </div>
              {photo && (
                <div className="flex items-center justify-between text-sm">
                  <span>Photo evidence</span>
                  <Badge variant="xp" className="text-xs">+10 XP</Badge>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent">{totalXp} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {statusMessage && (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">{statusMessage}</div>
        )}

        <Button variant="hero" size="xl" className="w-full" disabled={!canSubmit || isUploading} onClick={handleSubmit}>
          <Send className="w-5 h-5 mr-2" />
          {isUploading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
}
