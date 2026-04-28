import axios from 'axios';

/**
 * Phân loại lỗi từ Axios response thành thông báo tiếng Việt thân thiện.
 *
 * Thứ tự ưu tiên:
 * 1. Không phải AxiosError → ném lại (lỗi logic, không nuốt)
 * 2. Không có response (network down, CORS, timeout) → thông báo kết nối
 * 3. Có response → phân loại theo HTTP status code
 *
 * @example
 * ```ts
 * try {
 *   await someApi.call();
 * } catch (err) {
 *   toast.error(parseApiError(err));
 * }
 * ```
 */
export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    // Lỗi JavaScript thuần (TypeError, RangeError...) — không nuốt
    return 'Đã xảy ra lỗi không xác định';
  }

  // Không có response = API chưa chạy, mất mạng, CORS, DNS...
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Kết nối quá hạn, vui lòng thử lại';
    }
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc liên hệ quản trị viên';
  }

  const status = error.response.status;

  // Ưu tiên message từ server nếu có
  const serverMsg: string | undefined =
    error.response.data?.message ||
    error.response.data?.Message ||
    error.response.data?.title ||
    (typeof error.response.data === 'string' ? error.response.data : undefined);

  switch (status) {
    case 400:
      return serverMsg ?? 'Dữ liệu gửi lên không hợp lệ';
    case 401:
      return serverMsg ?? 'Tên đăng nhập hoặc mật khẩu không đúng';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này';
    case 404:
      return serverMsg ?? 'Không tìm thấy dữ liệu yêu cầu';
    case 409:
      return serverMsg ?? 'Dữ liệu đã tồn tại, vui lòng kiểm tra lại';
    case 422:
      return serverMsg ?? 'Dữ liệu không hợp lệ';
    case 429:
      return 'Quá nhiều yêu cầu, vui lòng thử lại sau vài giây';
    case 500:
    case 502:
    case 503:
      return serverMsg ?? 'Lỗi máy chủ nội bộ, vui lòng thử lại sau';
    default:
      return serverMsg ?? `Lỗi không xác định (${status})`;
  }
}
