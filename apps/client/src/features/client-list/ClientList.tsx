import { redirectClient } from '../../common/api/ontimeApi';
import useClients from '../../common/hooks-query/useClients';

const urlList = ['/clock', '/timer'];

export default function ClientList() {
  const { data, refetch } = useClients();
  data?.sort();
  if (data) {
    return (
      <div style={{ color: 'gray' }}>
        <ol>
          {data.map((v, index) => (
            <li key={index}>
              <span style={{ width: '200px', display: 'inline-block' }}>{v.name}</span>
              <select
                style={{ width: '200px', display: 'inline-block' }}
                value={v.url}
                onChange={(event) => redirectClient(v.name, event.target.value)}
              >
                {urlList.map((url) => {
                  return (
                    <option key={url} value={url}>
                      {url}
                    </option>
                  );
                })}
              </select>
              <span style={{ width: '200px', display: 'inline-block' }}>{v.parameters}</span>
            </li>
          ))}
        </ol>
        <button onClick={() => refetch()}>refresh</button>
      </div>
    );
  } else {
    return (
      <div style={{ color: 'white' }}>
        <div>no client</div>
      </div>
    );
  }
}
