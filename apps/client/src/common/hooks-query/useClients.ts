import { useQuery } from '@tanstack/react-query';
import { ReactClientList } from 'ontime-types';

import { queryRefetchIntervalSlow } from '../../ontimeConfig';
import { CLIENT_LIST } from '../api/apiConstants';
import { getClientList } from '../api/ontimeApi';

export default function useClients() {
  const { data, status, isError, refetch, isFetching } = useQuery<ReactClientList>({
    queryKey: CLIENT_LIST,
    queryFn: getClientList,
    retry: 5,
    retryDelay: (attempt) => attempt * 2500,
    refetchInterval: queryRefetchIntervalSlow,
    networkMode: 'always',
  });

  return { data, status, isError, refetch, isFetching };
}
