/**
 * tokenStore — lưu access token trong sessionStorage thay vì localStorage.
 *
 * Lý do dùng sessionStorage:
 * - Token bị xóa khi tab/browser đóng (không persistent như localStorage).
 * - Tồn tại qua F5 (page refresh) trong cùng tab → silent refresh vẫn hoạt động.
 * - Không chia sẻ giữa các tab (mỗi tab có session riêng).
 * - Không lưu trong Zustand persist → không thể bị đọc từ localStorage dump.
 *
 * Lưu ý: sessionStorage vẫn bị XSS đọc được như localStorage.
 * Để đạt bảo mật tối đa, cần lưu token trong memory (Zustand state thuần)
 * kết hợp với backend hỗ trợ refresh mà không cần expired access token.
 */

const TOKEN_KEY = 'at';

export const tokenStore = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => { sessionStorage.setItem(TOKEN_KEY, token); },
  clear: (): void => { sessionStorage.removeItem(TOKEN_KEY); },
};
