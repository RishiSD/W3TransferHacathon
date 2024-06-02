import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { switchChain, verifyMessage } from 'wagmi/actions';
import { config } from '../wagmi';
import { decryptContent, saveFile } from '../utils/phala';
import { moonbaseAlpha } from 'wagmi/chains';

const Download = () => {
  const [searchParams] = useSearchParams();
  const nftId = searchParams.get('nftId');
  if (!nftId)
    return (
      <h2 className="text-xl font-serif font-bold text-gray-900 text-center mb-6 pt-6">
        Invalid Url
      </h2>
    );
  const account = useAccount();
  const { connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    const switchNetwork = async () => {
      if (account.status === 'connected') {
        await switchChain(config, { chainId: moonbaseAlpha.id });
      }
      return;
    };
    switchNetwork();
  }, [account.status]);

  const download = async () => {
    const timestamp = new Date().getTime() - 60 * 1000;
    const message = `APILLON_REQUEST_MSG: ${timestamp}`;
    const signature = await signMessageAsync({ message });
    const decryptValue = await decryptContent(+nftId, timestamp, signature.replace('0x', ''));
    saveFile(decryptValue);
  };

  return (
    <div className="flex flex-row justify-center items-center">
      <article className="w-96 overflow-hidden rounded-lg shadow transition hover:shadow-lg">
        <div className="bg-white shadow p-4 sm:p-6">
          {account.status === 'connected' ? (
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 text-center  pt-6">
                Connected as
              </h2>
              <p className="text-xs font-serif font-bold text-gray-900 text-center mb-6">
                {account.address}
              </p>
              <button
                type="button"
                className="w-full py-2 px-4 bg-indigo-400 text-white rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
              <p className="text-sm mt-8 font-serif font-bold text-gray-900 text-center">
                Click below to download
              </p>
              <button
                type="button"
                className="w-full mt-4 py-2 px-4 bg-sky-600 text-white rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => download()}
              >
                Download
              </button>
            </>
          ) : (
            <>
              {' '}
              <h2 className="text-xl font-serif font-bold text-gray-900 text-center mb-6 pt-6">
                Connect wallet to download file.
              </h2>
              <button
                onClick={() => connect({ connector: injected() })}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="button"
              >
                Connect
              </button>
            </>
          )}

          <div>{status}</div>
          <div>{error?.message}</div>
        </div>
      </article>
    </div>
  );
};

export default Download;
