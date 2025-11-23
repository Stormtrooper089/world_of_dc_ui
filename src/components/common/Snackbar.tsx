import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

// --- SNACKBAR COMPONENT ---
const Snackbar = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto hide after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
      type === 'success' 
        ? 'bg-white border-green-200 text-green-800' 
        : 'bg-white border-red-200 text-red-800'
    }`}>
      <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
        {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export default Snackbar;