import { useMemo, useCallback } from 'react';
import { useAuthStore } from '../stores/auth.store';
import type { TacVuItem } from '../types/auth.types';

export interface UsePermissionResult {
  /** Danh sách tác vụ được phân quyền cho chức năng này */
  tacVuList: TacVuItem[];
  /** Kiểm tra user có tác vụ `maTacVu` ("XEM", "THEM", "SUA", "XOA", ...) không */
  coQuyen: (maTacVu: string) => boolean;
}

/**
 * Hook kiểm tra quyền tác vụ của user cho một chức năng cụ thể.
 *
 * @param chucNangId - ID chức năng (HETHONG_CHUCNANG.ID) từ backend menu
 *
 * @example
 * const { coQuyen } = usePermission(9);  // chức năng "Quản lý người dùng"
 * return coQuyen('THEM') ? <AddButton /> : null;
 */
export function usePermission(chucNangId: number): UsePermissionResult {
  const dsTacVu = useAuthStore((s) => s.dsTacVu);

  // dsTacVu key là string (vì JSON object key luôn là string)
  const tacVuList = useMemo(
    () => dsTacVu[String(chucNangId)] ?? [],
    [dsTacVu, chucNangId],
  );

  // Dùng Set để O(1) lookup thay vì .some() O(n) mỗi lần gọi
  const maSet = useMemo(() => new Set(tacVuList.map((t) => t.Ma)), [tacVuList]);

  const coQuyen = useCallback(
    (maTacVu: string) => maSet.has(maTacVu),
    [maSet],
  );

  return { tacVuList, coQuyen };
}
