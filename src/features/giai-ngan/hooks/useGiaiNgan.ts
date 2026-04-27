import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/utils/constants';
import { giaiNganApi } from '../api/giai-ngan.api';
import type { GiaiNganListParams } from '../types/giai-ngan.types';

export function useGiaiNganList(params?: GiaiNganListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.GIAI_NGAN, 'list', params],
    queryFn: () => giaiNganApi.getList(params),
  });
}

export function useGiaiNganDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.GIAI_NGAN, 'detail', id],
    queryFn: () => giaiNganApi.getById(id),
    enabled: !!id,
  });
}
