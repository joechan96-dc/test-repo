import React, { useState } from 'react';
import { X, Save, HelpCircle } from 'lucide-react';
import { getScriptUrl, setScriptUrl } from '../services/sheetService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState(getScriptUrl());
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setScriptUrl(url);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Sync Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Google Apps Script Web App URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500">
              Paste the URL from your deployed Google Apps Script here to enable live sync.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div 
                className="flex items-center gap-2 text-blue-700 font-semibold cursor-pointer mb-2"
                onClick={() => setShowHelp(!showHelp)}
            >
                <HelpCircle size={18} />
                <span>How to get this URL?</span>
            </div>
            
            {showHelp && (
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 ml-1">
                    <li>Open your Google Sheet.</li>
                    <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Paste the code provided in the source (services/sheetService.ts).</li>
                    <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                    <li>Select type: <strong>Web App</strong>.</li>
                    <li>Set <strong>Who has access</strong> to: <strong>Anyone</strong>.</li>
                    <li>Deploy and copy the resulting URL.</li>
                </ol>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <Save size={18} />
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
