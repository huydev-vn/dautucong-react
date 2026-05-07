import { useState, useMemo, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ListPageShell } from "@/components/shared/ListPageShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { HighlightText } from "@/components/shared/HighlightText";
import { AddButton } from "@/components/shared/AddButton";
import { RowActionButton } from "@/components/shared/RowActionButton";
import { cn } from "@/lib/utils";
import { CHUC_NANG_IDS, MA_TAC_VU } from "@/utils/constants";
import type { MaTacVu } from "@/utils/constants";
import { usePermission } from "@/features/auth/hooks/usePermission";
import {
  useChucNangList,
  useSaveChucNang,
  useDeleteChucNang,
} from "../hooks/useChucNang";
import { ChucNangForm } from "../components/ChucNangForm";
import type { ChucNang, ChucNangFormValues } from "../types/chuc-nang.types";

// ── Tree types ─────────────────────────────────────────────────
interface TreeNode {
  parent: ChucNang;
  children: ChucNang[];
}

// ── Build tree — module level (rerender-no-inline-components) ──
// Hoist helper ra ngoài render — rule 7.10 (hoist RegExp/pure function)
function matchesSearch(item: ChucNang, q: string): boolean {
  return item.Ma.toLowerCase().includes(q) || item.Ten.toLowerCase().includes(q);
}

/**
 * Xây cây chức năng + lọc client-side.
 * - Nếu cha khớp: giữ cha + toàn bộ con.
 * - Nếu cha không khớp nhưng có con khớp: vẫn giữ cha làm ngữ cảnh + chỉ hiển thị con khớp.
 * - Không khớp gì cả: loại nhóm.
 */
function buildTree(items: ChucNang[], search: string): TreeNode[] {
  const q = search.trim().toLowerCase();
  const idSet = new Set(items.map((c) => c.Id));
  const childrenMap = new Map<number, ChucNang[]>();

  for (const c of items) {
    if (c.IdCha && idSet.has(c.IdCha)) {
      if (!childrenMap.has(c.IdCha)) childrenMap.set(c.IdCha, []);
      childrenMap.get(c.IdCha)!.push(c);
    }
  }

  const roots = items
    .filter((c) => !c.IdCha || !idSet.has(c.IdCha))
    .toSorted((a, b) => (a.SapXep ?? 99) - (b.SapXep ?? 99));

  return roots.flatMap((root) => {
    const allChildren = (childrenMap.get(root.Id) ?? []).toSorted(
      (a, b) => (a.SapXep ?? 99) - (b.SapXep ?? 99),
    );

    if (!q) return [{ parent: root, children: allChildren }];

    const parentMatches = matchesSearch(root, q);
    const matchedChildren = allChildren.filter((c) => matchesSearch(c, q));

    if (!parentMatches && matchedChildren.length === 0) return [];

    return [{
      parent: root,
      // Cha khớp → hiển thị tất cả con; cha không khớp → chỉ hiển thị con khớp
      children: parentMatches ? allChildren : matchedChildren,
    }];
  });
}

const GROUP_BADGE: Record<string, { label: string; cls: string }> = {
  GROUP: { label: "Nhóm", cls: "bg-blue-100 text-blue-700" },
  MODULE: { label: "Module", cls: "bg-violet-100 text-violet-700" },
};

// ── Action buttons — module level ──────────────────────────────
interface RowActionsProps {
  item: ChucNang;
  coQuyen: (maTacVu: MaTacVu) => boolean;
  onView: (item: ChucNang) => void;
  onEdit: (item: ChucNang) => void;
  onDelete: (item: ChucNang) => void;
}


function RowActions({ item, coQuyen, onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {coQuyen(MA_TAC_VU.XEM) && (
        <RowActionButton variant="view" icon={Eye} title="Xem chi tiết" onClick={() => onView(item)} />
      )}
      {coQuyen(MA_TAC_VU.SUA) && (
        <RowActionButton variant="edit" icon={Pencil} title="Sửa" onClick={() => onEdit(item)} />
      )}
      {coQuyen(MA_TAC_VU.XOA) && (
        <RowActionButton variant="delete" icon={Trash2} title="Xóa" onClick={() => onDelete(item)} />
      )}
    </div>
  );
}

// ── Parent row — module level ───────────────────────────────────
interface ParentRowProps {
  node: TreeNode;
  expanded: boolean;
  highlight: string;
  coQuyen: (maTacVu: MaTacVu) => boolean;
  onToggle: (id: number) => void;
  onView: (item: ChucNang) => void;
  onEdit: (item: ChucNang) => void;
  onDelete: (item: ChucNang) => void;
}

function ParentRow({
  node,
  expanded,
  highlight,
  coQuyen,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: ParentRowProps) {
  const { parent, children } = node;
  const badge = parent.GhiChu ? GROUP_BADGE[parent.GhiChu] : null;
  const hasChildren = children.length > 0;

  return (
    <tr className="border-b border-[#1a3c6e]/10 bg-[#eef3fa] hover:bg-[#e5edf8] transition-colors">
      <td className="w-10 px-3 py-2.5 text-center">
        <button
          onClick={() => hasChildren && onToggle(parent.Id)}
          className={cn(
            "flex size-6 items-center justify-center rounded text-[#1a3c6e]/60 hover:bg-[#1a3c6e]/12 transition-colors",
            !hasChildren && "invisible",
          )}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </td>
      <td className="w-40 px-3 py-2.5">
        <HighlightText
          text={parent.Ma}
          highlight={highlight}
          className="font-mono text-[12px] text-[#1a3c6e]/80"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <HighlightText
            text={parent.Ten}
            highlight={highlight}
            className="font-semibold text-[13px] text-[#1a3c6e]"
          />
          {badge && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                badge.cls,
              )}
            >
              {badge.label}
            </span>
          )}
          {hasChildren && (
            <span className="rounded-full bg-[#1a3c6e]/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#1a3c6e]/60">
              {children.length}
            </span>
          )}
        </div>
      </td>
      <td className="w-52 px-3 py-2.5">
        {parent.Url ? (
          <span className="font-mono text-[11px] text-gray-500">
            {parent.Url}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="w-28 px-3 py-2.5">
        {parent.Icon ? (
          <span className="font-mono text-[11px] text-gray-500">
            {parent.Icon}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="w-32 px-3 py-2.5">
        <RowActions
          item={parent}
          coQuyen={coQuyen}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

// ── Child row — module level ────────────────────────────────────
interface ChildRowProps {
  item: ChucNang;
  index: number;
  isLast: boolean;
  highlight: string;
  coQuyen: (maTacVu: MaTacVu) => boolean;
  onView: (item: ChucNang) => void;
  onEdit: (item: ChucNang) => void;
  onDelete: (item: ChucNang) => void;
}

function ChildRow({
  item,
  index,
  isLast,
  highlight,
  coQuyen,
  onView,
  onEdit,
  onDelete,
}: ChildRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[#1a3c6e]/[0.025]",
        isLast ? "border-b-2 border-[#1a3c6e]/8" : "border-b border-gray-50",
      )}
    >
      <td className="w-10 px-3 py-1.5 text-center">
        <span className="text-[11px] text-gray-400">{index + 1}</span>
      </td>
      <td className="w-40 px-3 py-1.5 pl-9">
        <HighlightText
          text={item.Ma}
          highlight={highlight}
          className="font-mono text-[11.5px] text-[#1a3c6e]/70"
        />
      </td>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5 pl-3">
          <span className="select-none text-[12px] leading-none text-gray-300">
            └
          </span>
          <HighlightText
            text={item.Ten}
            highlight={highlight}
            className="text-[12.5px] text-gray-800"
          />
        </div>
      </td>
      <td className="w-52 px-3 py-1.5">
        {item.Url ? (
          <span className="font-mono text-[11px] text-gray-400">
            {item.Url}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="w-28 px-3 py-1.5">
        {item.Icon ? (
          <span className="font-mono text-[11px] text-gray-400">
            {item.Icon}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="w-32 px-3 py-1.5">
        <RowActions
          item={item}
          coQuyen={coQuyen}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

// ── Loading skeleton — module level ────────────────────────────
function TreeSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
      <table className="w-full">
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr
              key={i}
              className={cn(
                "border-b",
                i % 3 === 0
                  ? "bg-[#eef3fa] border-[#1a3c6e]/10"
                  : "border-gray-50",
              )}
            >
              <td className="w-10 px-3 py-2.5" />
              {Array.from({ length: 5 }).map((_, j) => (
                <td key={j} className="px-3 py-2.5">
                  <div
                    className="h-4 animate-pulse rounded-md bg-gray-100"
                    style={{ width: `${30 + (((i + j) * 17) % 55)}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export function ChucNangListPage() {
  const { coQuyen } = usePermission(CHUC_NANG_IDS.CHUC_NANG);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChucNang | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChucNang | null>(null);

  // Luôn fetch toàn bộ, lọc client-side để giữ ngữ cảnh cha-con
  const { data, isLoading } = useChucNangList({
    pageNumber: 1,
    pageSize: 500,
  });

  const saveMutation = useSaveChucNang();
  const deleteMutation = useDeleteChucNang();

  const items = useMemo(() => data?.Items ?? [], [data?.Items]);
  const total = data?.Total ?? 0;

  // Build tree — memoized, lọc client-side kèm ngữ cảnh cha
  const tree = useMemo(() => buildTree(items, search), [items, search]);

  // Auto-expand: derived state, không dùng useEffect (rerender-derived-state-no-effect)
  // expandedIds rỗng = chưa toggle thủ công → hiển thị tất cả mở
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const allParentIds = useMemo(
    () => new Set(tree.map((n) => n.parent.Id)),
    [tree],
  );
  const effectiveExpanded = useMemo<Set<number>>(
    () => {
      // Khi đang tìm kiếm: luôn mở rộng tất cả để thấy kết quả
      if (search) return allParentIds;
      return expandedIds.size === 0 && allParentIds.size > 0
        ? allParentIds
        : expandedIds;
    },
    [search, expandedIds, allParentIds],
  );

  const handleToggle = useCallback(
    (id: number) => {
      setExpandedIds((prev) => {
        const base = prev.size === 0 ? allParentIds : prev;
        const next = new Set(base);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [allParentIds],
  );

  const handleView = useCallback((item: ChucNang) => {
    // TODO: mở drawer xem chi tiết (read-only)
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: ChucNang) => {
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((item: ChucNang) => {
    setDeleteTarget(item);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditItem(null);
    setFormOpen(true);
  }, []);

  function handleFormSubmit(values: ChucNangFormValues) {
    saveMutation.mutate(values, {
      onSuccess: () => setFormOpen(false),
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.Id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <>
      <ListPageShell
        title="Quản lý chức năng"
        description="Cấu hình danh sách chức năng và phân cấp menu hệ thống"
        badge={total || undefined}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Tìm theo mã, tên...",
          debounceMs: 400,
        }}
        actions={
          coQuyen('THEM') ? <AddButton label="Thêm mới" onClick={handleOpenAdd} /> : undefined
        }
      >
        {isLoading ? (
          <TreeSkeleton />
        ) : tree.length === 0 ? (
          <EmptyState
            title="Không có dữ liệu phù hợp"
            description="Thử thay đổi từ khóa tìm kiếm hoặc thêm chức năng mới."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_0_rgba(26,60,110,0.06)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="w-10 px-3 py-2.5" />
                  <th className="w-40 px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e]">
                    Mã
                  </th>
                  <th className="px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e]">
                    Tên chức năng
                  </th>
                  <th className="w-52 px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e]">
                    URL
                  </th>
                  <th className="w-28 px-3 py-2.5 text-[13px] font-semibold text-[#1a3c6e]">
                    Icon
                  </th>
                  <th className="w-32 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {tree.flatMap((node) => [
                  <ParentRow
                    key={`p-${node.parent.Id}`}
                    node={node}
                    expanded={effectiveExpanded.has(node.parent.Id)}
                    highlight={search}
                    coQuyen={coQuyen}
                    onToggle={handleToggle}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />,
                  ...(effectiveExpanded.has(node.parent.Id)
                    ? node.children.map((child, idx) => (
                        <ChildRow
                          key={child.Id}
                          item={child}
                          index={idx}
                          isLast={idx === node.children.length - 1}
                          highlight={search}
                          coQuyen={coQuyen}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    : []),
                ])}
              </tbody>
            </table>
          </div>
        )}
      </ListPageShell>

      <ChucNangForm
        open={formOpen}
        editItem={editItem}
        parentOptions={items}
        loading={saveMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chức năng"
        description={`Bạn có chắc muốn xóa chức năng "${deleteTarget?.Ten}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
