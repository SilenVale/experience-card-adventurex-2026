interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onLogin: () => void;
}

export default function AuthPromptModal({ isOpen, onClose, message, onLogin }: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[100] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
        <div className="bg-[#110D0C] border border-[rgba(230,59,48,0.10)] rounded-xl w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <i className="ri-information-line text-2xl text-[#B8955B]" />
            </div>
          </div>
          <h3 className="font-heading font-bold text-[#EAE2DD] text-base mb-2">需要登录</h3>
          <p className="text-sm text-[#A89A95] mb-5">{message}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onLogin}
              className="w-full py-2.5 bg-[#E63B30] text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-[#c92f25] transition-colors"
            >
              登录 / 注册
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-[#A89A95]/60 hover:text-[#A89A95] cursor-pointer transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </>
  );
}