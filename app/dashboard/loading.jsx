import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner label="Loading Dashboard Intelligence..." fullScreen />
    </div>
  );
}
