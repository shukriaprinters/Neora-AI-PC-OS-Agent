import { AlertTriangle, CheckCircle2, CircleDashed } from 'lucide-react';

type DebugBannerProps = {
  apiHealthy: boolean;
  overlayBlocked: boolean;
  modalOpen: boolean;
  serverOnline: boolean;
  onDismiss?: () => void;
  onTogglePersist?: () => void;
  persisted?: boolean;
};

export function DebugBanner({ apiHealthy, overlayBlocked, modalOpen, serverOnline, onDismiss, onTogglePersist, persisted }: DebugBannerProps) {
  const allGood = apiHealthy && !overlayBlocked && !modalOpen && serverOnline;
  const statusText = allGood
    ? 'UI ready'
    : overlayBlocked
      ? 'Overlay blocking clicks'
      : !serverOnline
        ? 'Server offline'
        : !apiHealthy
          ? 'API unhealthy'
          : modalOpen
            ? 'Modal open'
            : 'Check UI';

  return (
    <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2">
      <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs backdrop-blur-xl ${
        allGood
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
          : 'border-amber-500/20 bg-amber-500/10 text-amber-200'
      }`}>
        {allGood ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <span className="font-medium">Neora Debug</span>
        <span className="opacity-80">•</span>
        <span>{statusText}</span>
        <span className="opacity-70">•</span>
        <span>API {apiHealthy ? 'OK' : 'ERR'}</span>
        <span className="opacity-70">•</span>
        <span>Overlay {overlayBlocked ? 'BLOCK' : 'OK'}</span>
        <span className="opacity-70">•</span>
        <span>Modal {modalOpen ? 'OPEN' : 'CLOSED'}</span>
        {onDismiss && (
          <>
            <span className="opacity-70">•</span>
            <button type="button" onClick={onDismiss} className="text-slate-200/80 hover:text-white">
              Dismiss
            </button>
          </>
        )}
        {onTogglePersist && (
          <>
            <span className="opacity-70">•</span>
            <button type="button" onClick={onTogglePersist} className="text-slate-200/80 hover:text-white">
              {persisted ? 'Pinned' : 'Pin'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
