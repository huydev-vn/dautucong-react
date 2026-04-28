import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-[#1a3c6e]/6 text-[#1a3c6e]/30">
        <Construction size={40} strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <p className="text-[72px] font-extrabold leading-none tracking-tight text-[#1a3c6e]/8 select-none">
          WIP
        </p>
        <h2 className="mt-1 text-lg font-bold text-gray-800">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 max-w-sm">
          {description ?? 'Tính năng đang được phát triển. Vui lòng quay lại sau.'}
        </p>
      </div>
    </div>
  );
}
