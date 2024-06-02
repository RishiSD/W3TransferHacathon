interface PopUpProps {
  popupText: string;
  buttonText: string;
  open: boolean;
  onClose: any;
}

export const PopUp = ({ popupText, buttonText, open, onClose }: PopUpProps) => {
  return (
    <div
      onClick={onClose}
      className={`
        fixed inset-0 flex justify-center items-center transition-colors
        ${open ? 'visible bg-black/20' : 'invisible'}
      `}
    >
      {/* modal */}
      <div
        onClick={e => e.stopPropagation()}
        className={`
          bg-white rounded-xl shadow p-6 transition-all
          ${open ? 'scale-100 opacity-100' : 'scale-125 opacity-0'}
        `}
      >
        <div className="text-center w-56">
          <p className="mt-4 text-gray-500">{popupText}</p>
          <div className="mt-6 sm:flex sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-block w-full rounded-lg bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
