/**
 * icon-registry.ts
 *
 * Map từ tên icon (string trả về từ backend HETHONG_CHUCNANG.ICON)
 * sang Lucide React component.
 *
 * Import tĩnh — không dùng dynamic string concat để tree-shaker hoạt động đúng.
 * Icon không có trong map → trả về DEFAULT_ICON (Folder).
 */
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookPlus,
  Building2,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  DollarSign,
  FilePlus,
  FileSearch,
  FileText,
  Folder,
  FolderKanban,
  FolderOpen,
  GitBranch,
  History,
  IterationCw,
  KeyRound,
  Landmark,
  LayoutDashboard,
  ListTree,
  Mail,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Send,
  Settings,
  Shield,
  Target,
  Trash2,
  Users,
  UsersRound,
  Eye,
  ScanEye,
  CheckSquare2
} from 'lucide-react';

/** Statically analyzable registry — tên icon (PascalCase) → Lucide component */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  // ── Icons có trong backend HETHONG_CHUCNANG ──────────────────
  BarChart3,
  BookPlus,
  Building2,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  DollarSign,
  FilePlus,
  FileSearch,
  FileText,
  Folder,
  FolderKanban,
  FolderOpen,
  GitBranch,
  History,
  IterationCw,
  Landmark,
  LayoutDashboard,
  ListTree,
  Mail,
  MessageSquare,
  Package,
  Send,
  Settings,
  Target,
  CheckSquare2,

  // ── Icons có trong backend HETHONG_TACVU ─────────────────────
  Eye,
  Plus,
  Edit: Pencil,      // backend gửi "Edit", Lucide dùng Pencil
  Trash2,

  // ── Fallback cho icon Phosphor/React Icons không có trong Lucide ──
  UserList: Users,         // backend dùng icon ngoài Lucide
  UserLock: KeyRound,
  UserGroup: UsersRound,
  ScanEye,
  Shield,
};

const DEFAULT_ICON: LucideIcon = Folder;

/**
 * Lấy Lucide component từ tên icon string.
 * Trả về DEFAULT_ICON nếu tên null, undefined, hoặc không có trong registry.
 */
export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return DEFAULT_ICON;
  return ICON_REGISTRY[name] ?? DEFAULT_ICON;
}
