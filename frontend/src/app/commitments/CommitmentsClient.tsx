import dynamic from 'next/dynamic';

const CommitmentsClient = dynamic(() => import('./CommitmentsClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  ),
});

export default function CommitmentsPage() {
  return <CommitmentsClient />;
}
