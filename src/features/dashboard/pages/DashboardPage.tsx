import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, LayoutDashboard, BarChart2, Building2, AlertCircle } from 'lucide-react';
import { KPI_CARDS } from '../data/dashboard.data';
import { StatCard } from '../components/StatCard';
import { GiaiNganChart } from '../components/GiaiNganChart';
import { CoCauLinhVucChart } from '../components/CoCauLinhVucChart';
import { GiaiNganDonViChart } from '../components/GiaiNganDonViChart';
import { SoSanh3NamChart } from '../components/SoSanh3NamChart';
import { TrangThaiDuAnChart } from '../components/TrangThaiDuAnChart';
import { TopDuAnTable, DuAnSanHanTable } from '../components/DuAnTables';
import { useTour } from '@/hooks/useTour';

const TABS = [
  { id: 'tong-quan',  label: 'Tổng quan',      icon: LayoutDashboard },
  { id: 'tai-chinh',  label: 'Tài chính',       icon: BarChart2 },
  { id: 'du-an',      label: 'Dự án',           icon: Building2 },
  { id: 'canh-bao',   label: 'Cảnh báo',        icon: AlertCircle },
] as const;

type TabId = typeof TABS[number]['id'];

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-4 shadow-sm', className)}>
      <h3 className="mb-3 text-[13px] font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tong-quan');
  const { startTour } = useTour();
  const now = new Date().toLocaleString('vi-VN', { dateStyle: 'long', timeStyle: 'short' });

  // Tự động chạy tour khi người dùng vào lần đầu
  useEffect(() => {
    const timer = setTimeout(() => startTour(), 800);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
            Tỉnh Bắc Ninh · Năm ngân sách 2026 · Cập nhật: {now}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-700 hover:bg-blue-100 transition-colors">
          <RefreshCw size={13} />
          Làm mới
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div data-tour="kpi-cards" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <div data-tour="dashboard-tabs" className="flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tổng quan ── */}
      {activeTab === 'tong-quan' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Giải ngân theo tháng (tỷ đồng)" className="lg:col-span-2">
              <GiaiNganChart />
            </SectionCard>
            <SectionCard title="Trạng thái dự án">
              <TrangThaiDuAnChart />
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Cơ cấu vốn theo lĩnh vực">
              <CoCauLinhVucChart />
            </SectionCard>
            <SectionCard title="Top 7 dự án lớn nhất">
              <TopDuAnTable />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Tab: Tài chính ── */}
      {activeTab === 'tai-chinh' && (
        <div className="space-y-4">
          <SectionCard title="So sánh giải ngân 3 năm (tỷ đồng)">
            <SoSanh3NamChart />
          </SectionCard>
          <SectionCard title="Tỷ lệ giải ngân theo đơn vị">
            <GiaiNganDonViChart />
          </SectionCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Cơ cấu vốn theo lĩnh vực">
              <CoCauLinhVucChart />
            </SectionCard>
            <SectionCard title="Giải ngân theo tháng">
              <GiaiNganChart />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Tab: Dự án ── */}
      {activeTab === 'du-an' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Phân loại trạng thái dự án">
              <TrangThaiDuAnChart />
            </SectionCard>
            <SectionCard title="Top 7 dự án lớn nhất" className="lg:col-span-2">
              <TopDuAnTable />
            </SectionCard>
          </div>
          <SectionCard title="Tiến độ giải ngân theo đơn vị">
            <GiaiNganDonViChart />
          </SectionCard>
        </div>
      )}

      {/* ── Tab: Cảnh báo ── */}
      {activeTab === 'canh-bao' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
            <span>
              Có <b>17 dự án</b> chậm tiến độ, trong đó <b>4 dự án</b> có nguy cơ cao không hoàn thành trong năm 2026.
            </span>
          </div>
          <SectionCard title="Dự án sắp đến hạn – đánh giá rủi ro">
            <DuAnSanHanTable />
          </SectionCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Tỷ lệ giải ngân theo đơn vị">
              <GiaiNganDonViChart />
            </SectionCard>
            <SectionCard title="Trạng thái dự án">
              <TrangThaiDuAnChart />
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

