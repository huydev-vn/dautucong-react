import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { giaiNganApi } from '../api/giai-ngan.api';
import type { GiaiNganListParams } from '../types/giai-ngan.types';

export function useGiaiNganList(params?: GiaiNganListParams) {
  return useQuery({
    queryKey: queryKeys.giaiNgan.list(params),
    queryFn: () => giaiNganApi.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime: GC_TIME.LIST,
  });
}

export function useGiaiNganDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.giaiNgan.detail(id),
    queryFn: () => giaiNganApi.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
    gcTime: GC_TIME.DETAIL,
  });
}
