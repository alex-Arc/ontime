import useClients from '../../common/hooks-query/useClients';

export default function ClientList() {
  const { data } = useClients();

  if (data) {
    return (
      <ol style={{ color: 'white' }}>
        {data.map((v, index) => (
          <li key={index}>
            <span>{v.name}</span>
            <span style={{ position: 'absolute', left: '250px' }}>{v.url}</span>
            <span style={{ position: 'absolute', left: '350px' }}>{v.parameters}</span>
          </li>
        ))}
      </ol>
    );
  } else {
    return <div>no client</div>;
  }
}
