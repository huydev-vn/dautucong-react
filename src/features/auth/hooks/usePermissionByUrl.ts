import { useMemo } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { usePermission, type UsePermissionResult } from './usePermission';
import type { MenuItem } from '../types/auth.types';

/** Flatten menu tree thành mảng phẳng — module level, pure */
function flattenMenu(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flattenMenu(item.Children ?? [])]);
}

/**
 * Kiểm tra quyền tác vụ dựa trên **URL** của chức năng thay vì hardcode ID.
 *
 * ID chức năng được tra từ `menu` đã có trong auth store (trả về lúc login),
 * nên luôn đồng bộ với DB — không cần cập nhật `CHUC_NANG_IDS` thủ công.
 *
 * @param url - URL chức năng, khớp với `MenuItem.Url` (sau normalize, có dấu '/' đầu)
 *
 * @example
 * // Thay vì:
 * const { coQuyen } = usePermission(CHUC_NANG_IDS.DM_DIABAN); // ❌ hardcode, dễ lỗi
 *
 * // Dùng:
 * const { coQuyen } = usePermissionByUrl('/qldm/dmdiaban'); // ✅ dynamic
 */
export function usePermissionByUrl(url: string): UsePermissionResult {
  const menu = useAuthStore((s) => s.menu);

  const chucNangId = useMemo(() => {
    const flat = flattenMenu(menu);
    return flat.find((item) => item.Url === url)?.Id ?? 0;
  }, [menu, url]);

  return usePermission(chucNangId);
}
