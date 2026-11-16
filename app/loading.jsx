import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <LoadingSpinner label="Loading Platform..." fullScreen />
    </div>
  );
}
