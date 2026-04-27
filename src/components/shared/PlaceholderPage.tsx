import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
      <div className="rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-100">
        <Construction size={40} className="text-blue-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="mt-1 text-sm text-gray-400 max-w-sm">
          {description ?? 'Tính năng đang được phát triển. Vui lòng quay lại sau.'}
        </p>
      </div>
    </div>
  );
}
