import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Radio,
  Server,
  Key,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { playCameraCutSound, playStingerSound } from '../utils/audioSynthesizer';

interface VendorUplinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTicker: (tickerText: string) => void;
}

interface VendorPortal {
  slug: string;
  name: string;
  shortCode: string;
  category: string;
  supportUrl: string;
  status: 'ONLINE' | 'ACTIVE' | 'SYNCED' | 'STANDBY';
  telemetry: string;
  siteCode: string;
  color: string;
  details: string;
}

const VENDOR_PORTALS: VendorPortal[] = [
  {
    slug: 'prometric',
    name: 'Prometric (CMA US)',
    shortCode: 'PRO',
    category: 'EXAM DELIVERY & SEAT TRACKER',
    supportUrl: 'https://ehelp.prometric.com/',
    status: 'ACTIVE',
    telemetry: 'CALICUT: 18 SEATS • COCHIN: 14 SEATS',
    siteCode: 'SITE ID: 8214-CC',
    color: '#38bdf8',
    details: 'CMA US live seat availability tracker, candidate admissions, and Prometric eHelp portal.',
  },
  {
    slug: 'pearson',
    name: 'Pearson VUE',
    shortCode: 'VUE',
    category: 'PVTC AUTHORIZED TEST CENTER',
    supportUrl: 'https://www.pearsonvue.com/us/en/help/chat.html',
    status: 'SYNCED',
    telemetry: 'RMA 08:30 IST • 45/45 PODS OK',
    siteCode: 'PVTC: #84920 (CAL) / #84921 (COC)',
    color: '#f472b6',
    details: 'Global RMA batch updates, candidate check-in biometrics, and 24/7 Pearson VUE Live Chat.',
  },
  {
    slug: 'psi',
    name: 'PSI Exams',
    shortCode: 'PSI',
    category: 'GLOBAL PROCTORING SOLUTIONS',
    supportUrl: 'https://gps.psiexams.com/test-center-alerts',
    status: 'ONLINE',
    telemetry: 'GPS ALERT FEED VERIFIED',
    siteCode: 'PSI ID: 9381-IN',
    color: '#fb923c',
    details: 'Test center operational alerts, GPS proctor status, and incident resolution portal.',
  },
  {
    slug: 'celpip',
    name: 'CELPIP (Paragon)',
    shortCode: 'CEL',
    category: 'LANGUAGE PROFICIENCY ENGINE',
    supportUrl: 'https://ehelp.prometric.com/Paragon',
    status: 'ONLINE',
    telemetry: 'AUDIO STATIONS CALIBRATED',
    siteCode: 'CENTRE: CA-IN-04',
    color: '#facc15',
    details: 'Paragon English testing engine, audio recording calibration, and intake verifications.',
  },
  {
    slug: 'itts',
    name: 'ITTS (Surpass)',
    shortCode: 'ITTS',
    category: 'SURPASS SECURE ENGINE',
    supportUrl: 'https://tds.surpass.com/help/',
    status: 'STANDBY',
    telemetry: 'SECURE BROWSER ENGINE READY',
    siteCode: 'SURPASS: FETS-PRO-01',
    color: '#a78bfa',
    details: 'Surpass test delivery system, lockdown environment diagnostics, and tech support.',
  },
  {
    slug: 'fets',
    name: 'FETS Internal Command',
    shortCode: 'FETS',
    category: 'CENTRAL OPERATIONS & STAFF HUB',
    supportUrl: 'https://fets.live',
    status: 'ONLINE',
    telemetry: 'ROSTER & DUTY ENGINE LIVE',
    siteCode: 'MCR CLOUD: v7.0.6',
    color: '#00D084',
    details: 'Shift handovers, staff attendance roster, duty 6-day rotation, and inter-centre intercom.',
  },
];

export const VendorUplinkModal: React.FC<VendorUplinkModalProps> = ({
  isOpen,
  onClose,
  onSendTicker,
}) => {
  if (!isOpen) return null;

  const handleBroadcastVendor = (vendor: VendorPortal) => {
    playStingerSound();
    const text = `${vendor.name.toUpperCase()}: ${vendor.telemetry} • ${vendor.siteCode} • Live Support Connected`;
    onSendTicker(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#091b17] border border-[#225246] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#0d2822] to-[#091b17] border-b border-[#1f4a3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC72C] text-[#081412] flex items-center justify-center font-fets-title font-black text-base shadow-[0_0_12px_rgba(255,199,44,0.4)]">
              <Radio className="w-4 h-4 text-[#081412]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fets-title font-bold text-white text-base tracking-wide uppercase">
                  FETS VENDOR UPLINKS & LIVE SUPPORT PORTALS
                </h2>
                <span className="text-[10px] font-tech font-bold px-1.5 py-0.2 rounded bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40">
                  ALL VENDORS ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#719c90] font-sans-ui">
                Direct External Support Desks, Site Identification & Operational Status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendors Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {VENDOR_PORTALS.map((vendor) => (
            <div
              key={vendor.slug}
              className="p-4 rounded-xl bg-[#0d2721] border border-[#1f4e43] hover:border-[#357566] transition-all flex flex-col justify-between gap-3 shadow-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2 py-0.5 rounded font-fets-title font-black text-xs tracking-wider"
                      style={{
                        backgroundColor: `${vendor.color}25`,
                        color: vendor.color,
                        border: `1px solid ${vendor.color}60`,
                      }}
                    >
                      {vendor.shortCode}
                    </span>
                    <div>
                      <h3 className="font-fets-title font-bold text-white text-sm">
                        {vendor.name}
                      </h3>
                      <span className="text-[10px] font-tech text-[#7da59a] tracking-wider uppercase block">
                        {vendor.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-tech font-bold px-2 py-0.5 rounded-full bg-[#071914] text-[#00D084] border border-[#1b4338]">
                    {vendor.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-sans-ui mt-2 leading-relaxed">
                  {vendor.details}
                </p>

                {/* Telemetry & Site ID */}
                <div className="mt-2.5 p-2 rounded-lg bg-[#081c17] border border-[#1a4137] flex items-center justify-between text-[10px] font-tech">
                  <span className="text-[#8ec3b5] font-semibold">{vendor.telemetry}</span>
                  <span className="text-[#dfbf6e] font-bold">{vendor.siteCode}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#183a32]">
                <a
                  href={vendor.supportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#143930] hover:bg-[#1c4d41] text-[#7ce2ca] hover:text-white text-xs font-fets-title font-bold transition-all"
                >
                  <span>OPEN SUPPORT</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleBroadcastVendor(vendor)}
                  className="px-3 py-1.5 rounded-lg bg-[#FFC72C]/15 hover:bg-[#FFC72C]/30 text-[#FFC72C] border border-[#FFC72C]/40 text-xs font-fets-title font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Broadcast this vendor status to the live TV news ticker"
                >
                  <Tv className="w-3 h-3" />
                  <span>ON AIR</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0a1e19] border-t border-[#1f4a3e] flex items-center justify-between">
          <span className="text-[11px] text-[#6d968b] font-tech">
            FETS.LIVE STAFF QUICK ACCESS & OPERATIONAL VENDOR CONSOLE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#14372f] text-slate-300 hover:text-white text-xs font-fets-title cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
