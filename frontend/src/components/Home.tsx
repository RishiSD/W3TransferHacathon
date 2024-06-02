import { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { useDropzone } from 'react-dropzone';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PopUp } from './popup';

interface FormInputs {
  receiverEmail: string;
  message: string;
  address: string;
}

function Home() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [file, setFile] = useState<File | null>(null);
  const [cookies, setCookie] = useCookies(['jwt-token', 'email']);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  let oAuthWindow: Window | null = null;

  const getAuthToken = async (): Promise<string> => {
    const response = await fetch('https://w3transferhacathon.onrender.com/session-token', {
      method: 'GET',
    });
    const { data } = await response.json();
    return data.sessionToken;
  };

  const openOAuthPopup = async () => {
    const sessionToken = await getAuthToken();
    oAuthWindow = window.open(
      `https://oauth.apillon.io/?embedded=1&token=${sessionToken}`,
      'Apillon OAuth Form',
      `height=900,width=450,resizable=no`
    );
  };

  const verifyUserLogin = async (oAuthToken: string) => {
    const response = await fetch('https://w3transferhacathon.onrender.com/verify-login', {
      method: 'POST',
      body: JSON.stringify({ token: oAuthToken }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const { data, token } = await response.json();
    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + 15);
    setCookie('jwt-token', token, { path: '/', expires: expiresDate });
    setCookie('email', data.email, { path: '/', expires: expiresDate });
  };

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (!event.origin?.includes('apillon.io')) return;
      if (!event.data.verified) {
        throw new Error('Invalid verification');
      }
      oAuthWindow?.close();
      await verifyUserLogin(event.data.authToken);
    };

    window.addEventListener('message', handleOAuthMessage, false);

    return () => {
      window.removeEventListener('message', handleOAuthMessage, false);
    };
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onSubmit: SubmitHandler<FormInputs> = data => {
    if (!file) {
      alert('Please upload a file');
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const reqBody = {
        fileData: {
          name: file?.name,
          contentType: file?.type,
          content: reader.result,
        },
        ...data,
        senderEmail: cookies.email,
      };

      fetch('https://w3transferhacathon.onrender.com/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: cookies['jwt-token'],
        },
        body: JSON.stringify(reqBody),
      })
        .then(response => response.json())
        .then(result => {
          setPopupOpen(true);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    };

    return;
  };

  return (
    <CookiesProvider>
      <div className="flex flex-row justify-center items-center">
        <article className="w-96 overflow-hidden rounded-lg shadow transition hover:shadow-lg">
          <div className="bg-white shadow p-4 sm:p-6">
            <a href="#">
              <h3 className="mt-0.5 pb-2 text-lg text-gray-900">Upload file</h3>
            </a>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <div
                  {...getRootProps({
                    className:
                      'border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer',
                  })}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <p className="text-sm  text-gray-500">{file.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Drag 'n' drop a file here, or click to select a file
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="receiverEmail"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    type="email"
                    id="receiverEmail"
                    placeholder="Email to"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register('receiverEmail', { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    Email to
                  </span>
                </label>
                {errors.receiverEmail && (
                  <span className="text-red-500 text-sm">This field is required</span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="message"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    id="message"
                    placeholder="Message"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register('message', { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    Message
                  </span>
                </label>
                {errors.message && (
                  <span className="text-red-500 text-sm">This field is required</span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="address"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    id="address"
                    placeholder="Ethereum Address"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register('address', { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    Ethereum Address
                  </span>
                </label>
                {errors.message && (
                  <span className="text-red-500 text-sm">This field is required</span>
                )}
              </div>
              {cookies.email && (
                <p className="text-xs font-serif font-bold text-gray-900 text-center mb-6">
                  Logged in as {cookies.email}
                </p>
              )}

              <button
                type="submit"
                disabled={cookies.email === undefined}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send
              </button>
              <button
                type="button"
                onClick={openOAuthPopup}
                disabled={cookies.email !== undefined}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login with Apillion
              </button>
            </form>
          </div>
        </article>
      </div>
      <PopUp
        open={popupOpen}
        popupText="Your file transfer is being processed"
        buttonText="Ok"
        onClose={() => {
          reset();
          setFile(null);
          setPopupOpen(false);
        }}
      />
    </CookiesProvider>
  );
}

export default Home;
