import { usePermission } from '@/features/auth/hooks/usePermission';

interface PermissionGuardProps {
  /** ID chức năng (HETHONG_CHUCNANG.ID) cần kiểm tra */
  chucNangId: number;
  /** Mã tác vụ cần kiểm tra: "XEM" | "THEM" | "SUA" | "XOA" | "HUYDUYET" | "LICHSU" | ... */
  maTacVu: string;
  children: React.ReactNode;
  /** Nội dung fallback khi không có quyền (mặc định: không render gì) */
  fallback?: React.ReactNode;
}

/**
 * Ẩn/hiện nội dung dựa trên quyền tác vụ của user.
 *
 * @example
 * <PermissionGuard chucNangId={9} maTacVu="THEM">
 *   <AddButton onClick={handleAdd} />
 * </PermissionGuard>
 */
export function PermissionGuard({
  chucNangId,
  maTacVu,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { coQuyen } = usePermission(chucNangId);
  return coQuyen(maTacVu) ? <>{children}</> : <>{fallback}</>;
}
