import useClients from '../../common/hooks-query/useClients';

export default function ClientList() {
  const { data } = useClients();
  console.log(data);
  return <div>Client</div>;
}
