import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_KEY = 'dtkt_tour_done_v1';

export function useTour() {
  const startTour = useCallback((force = false) => {
    if (!force && localStorage.getItem(TOUR_KEY)) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Tiếp theo →',
      prevBtnText: '← Quay lại',
      doneBtnText: 'Hoàn thành ✓',
      progressText: 'Bước {{current}} / {{total}}',
      popoverClass: 'dtkt-tour-popover',
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_KEY, '1');
        driverObj.destroy();
      },
      steps: [
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: '📌 Thanh điều hướng',
            description:
              'Menu chính để truy cập tất cả chức năng: danh mục, dự án, báo cáo, thanh tra... Có thể thu gọn để tạo thêm không gian làm việc bằng nút ở đáy menu.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="header-notification"]',
          popover: {
            title: '🔔 Thông báo & Tài khoản',
            description:
              'Xem cảnh báo tiến độ, hạn thanh toán. Thông tin tài khoản đăng nhập và phân quyền hiển thị ở góc phải header.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '[data-tour="kpi-cards"]',
          popover: {
            title: '📊 Chỉ số tổng hợp (KPI)',
            description:
              'Tổng quan nhanh: tổng vốn kế hoạch, đã giải ngân, số dự án đang thực hiện, tỷ lệ hoàn thành. Dữ liệu cập nhật theo thời gian thực.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="dashboard-tabs"]',
          popover: {
            title: '🗂 Góc nhìn phân tích',
            description:
              'Chuyển giữa 4 tab: Tổng quan (biểu đồ chính) · Tài chính (so sánh giải ngân) · Dự án (trạng thái) · Cảnh báo (rủi ro & chậm tiến độ).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="header-guide"]',
          popover: {
            title: '🎓 Xem lại hướng dẫn bất kỳ lúc nào',
            description:
              'Nhấn nút này để chạy lại tour hướng dẫn khi cần. Bạn đã sẵn sàng sử dụng hệ thống!',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_KEY);
  }, []);

  return { startTour, resetTour };
}