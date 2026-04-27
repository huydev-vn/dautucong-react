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
              'Đây là menu chính của hệ thống. Nhấn vào các mục để truy cập các chức năng quản lý dự án, danh mục, báo cáo...',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="sidebar-collapse"]',
          popover: {
            title: '⇔ Thu gọn / Mở rộng',
            description:
              'Nhấn nút này để thu gọn sidebar, tạo thêm không gian làm việc. Nhấn lại để mở rộng.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '[data-tour="sidebar-trigger"]',
          popover: {
            title: '⬡ Nút toggle nhanh',
            description:
              'Ngoài nút ở đáy, bạn có thể dùng nút tròn này ở đường biên để thu gọn/mở rộng nhanh hơn.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '[data-tour="header-title"]',
          popover: {
            title: '🏛 Hệ thống Quản lý Đầu tư Công',
            description:
              'Hệ thống thuộc Sở Tài Chính Bắc Ninh, phục vụ theo dõi và quản lý các dự án đầu tư công trên địa bàn tỉnh.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="header-notification"]',
          popover: {
            title: '🔔 Thông báo',
            description:
              'Xem các cảnh báo và thông báo về tiến độ, hạn thanh toán, và các sự kiện quan trọng của dự án.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '[data-tour="header-user"]',
          popover: {
            title: '👤 Thông tin người dùng',
            description:
              'Hiển thị tài khoản đang đăng nhập. Quyền truy cập được kiểm soát theo vai trò (phân quyền).',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '[data-tour="kpi-cards"]',
          popover: {
            title: '📊 Chỉ số tổng hợp',
            description:
              'Các thẻ KPI hiển thị tổng quan nhanh: tổng vốn kế hoạch, đã giải ngân, số dự án, tỷ lệ hoàn thành...',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="dashboard-tabs"]',
          popover: {
            title: '🗂 Các tab phân tích',
            description:
              'Chuyển giữa 4 góc nhìn: Tổng quan, Tài chính, Dự án, và Cảnh báo rủi ro.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="header-guide"]',
          popover: {
            title: '🎓 Xem lại hướng dẫn',
            description:
              'Bạn có thể xem lại hướng dẫn bất kỳ lúc nào bằng cách nhấn nút "Hướng dẫn" này.',
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