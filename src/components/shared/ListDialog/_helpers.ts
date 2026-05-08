import type { ExpandedState } from '@tanstack/react-table';
import type { DefaultExpanded } from './types';

// ── Normalized tree node ───────────────────────────────────────────────────────
// Regardless of the source shape (flat/nested), all tree data is normalized to
// use a predictable `__children` field so TanStack's getSubRows works uniformly.
export type TreeNode<T> = T & { __children: TreeNode<T>[] };

// ── Build tree from flat array ────────────────────────────────────────────────
/**
 * Converts a flat list where each item has a parent-ID reference into a nested
 * tree. Items with no valid parent become root nodes.
 */
export function buildFlatTree<T>(
  items: T[],
  idKey: keyof T,
  parentKey: keyof T,
): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>();
  for (const item of items) {
    map.set(String(item[idKey]), { ...item, __children: [] });
  }
  const roots: TreeNode<T>[] = [];
  for (const item of items) {
    const node = map.get(String(item[idKey]))!;
    const parentId = item[parentKey];
    if (parentId != null && parentId !== '' && map.has(String(parentId))) {
      map.get(String(parentId))!.__children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// ── Normalize nested array → TreeNode ─────────────────────────────────────────
/**
 * Recursively maps a nested array (where children live under `childrenKey`)
 * into the unified `__children` shape.
 */
export function normalizeNested<T>(
  items: T[],
  childrenKey: keyof T,
): TreeNode<T>[] {
  return items.map((item) => {
    const kids = (item[childrenKey] as unknown as T[] | undefined) ?? [];
    return { ...item, __children: normalizeNested(kids, childrenKey) };
  });
}

// ── Flat list with no tree structure ──────────────────────────────────────────
/** Wraps each item as a leaf node (no children). Used when `tree` prop is omitted. */
export function normalizeFlatNoTree<T>(items: T[]): TreeNode<T>[] {
  return items.map((item) => ({ ...item, __children: [] }));
}

// ── Compute initial expanded state ────────────────────────────────────────────
/**
 * Returns the TanStack `ExpandedState` for the first render.
 * Row keys in TanStack are determined by `getRowId`, so we use the actual `idKey`
 * values (not array indices) as keys.
 */
export function computeInitialExpanded<T>(
  roots: TreeNode<T>[],
  mode: DefaultExpanded,
  idKey: keyof T,
): ExpandedState {
  if (mode === 'all') return true;
  if (mode === 'none') return {};
  // 'first-level': expand only root nodes that have at least one child
  return roots.reduce<Record<string, boolean>>((acc, root) => {
    if (root.__children.length > 0) {
      acc[String(root[idKey])] = true;
    }
    return acc;
  }, {});
}

// ── Collect all leaf IDs in a subtree ─────────────────────────────────────────
/**
 * Recursively walks a node and returns the IDs of all leaf nodes
 * (nodes with no children). Used for tree-aware checkbox selection.
 */
export function collectLeafIds<T>(node: TreeNode<T>, idKey: keyof T): string[] {
  if (!node.__children.length) return [String(node[idKey])];
  return node.__children.flatMap((child) => collectLeafIds(child, idKey));
}
