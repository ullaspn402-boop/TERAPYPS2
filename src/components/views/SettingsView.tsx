import React from 'react';
import { Settings, Globe, Mic, Shield, Volume2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';

export const SettingsView: React.FC = () => {
  const { interfaceLanguage, setInterfaceLanguage } = useApp();

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Platform Settings & Clinical Preferences</h2>
        <p className="text-xs text-slate-500">
          Independent configuration of interface language, acoustic calibration, and supervision thresholds.
        </p>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-[#006A61]" />
          <h3 className="font-bold text-slate-900 text-sm">Interface Language Preferences</h3>
        </div>
        <p className="text-xs text-slate-600">
          Note: Interface language is completely independent of individual patient therapy languages (e.g. Telugu, Kannada, Hindi).
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setInterfaceLanguage(l.code)}
              className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                interfaceLanguage === l.code
                  ? 'bg-[#E0F2F1] border-[#006A61] font-bold text-[#006A61]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <span className="block">{l.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{l.nativeName}</span>
              </div>
              {interfaceLanguage === l.code && <Check className="w-4 h-4 text-[#006A61]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Microphone & Acoustic Telemetry Calibration */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Mic className="w-5 h-5 text-[#006A61]" />
          <h3 className="font-bold text-slate-900 text-sm">Microphone & Acoustic Sensitivity</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Formant F3 Sensitivity</span>
              <span className="text-slate-500">Tune sensitivity for rhotic sound /r/ dip threshold</span>
            </div>
            <span className="font-mono text-[#006A61] font-bold">Configured Threshold (1800 Hz)</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 block">Ambient Noise Cancellation</span>
              <span className="text-slate-500">Dynamic spectral subtraction in clinic environments</span>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Enabled (Active)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
