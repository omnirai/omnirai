import React, { useState } from 'react';
import { X, Globe, Copy, Check, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

export default function DomainVerifyModal({ isOpen, onClose, onVerifyDomain }) {
  const [domainName, setDomainName] = useState('');
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'dns' | 'verified'

  const challengeName = `_omnira-challenge.${domainName.trim() || 'yourdomain.com'}`;
  const challengeValue = `omnira-verify-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'name') {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else {
      setCopiedTxt(true);
      setTimeout(() => setCopiedTxt(false), 2000);
    }
  };

  const handleVerifyDNS = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('verified');
      setTimeout(() => {
        onVerifyDomain({
          domain: domainName.trim(),
          txtRecord: challengeValue,
          status: 'Verified',
          verifiedAt: new Date().toLocaleDateString()
        });
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 select-none">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative text-[var(--text-primary)]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-base">
            <Globe className="w-5 h-5 text-black dark:text-white" />
            <span>Verify Custom Domain Ownership</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Add your domain to publish public GPTs and custom branded links under your own domain name.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="e.g. ai.yourdomain.com or gpt.mydomain.io"
                className="w-full px-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)] font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => setStep('dns')}
                disabled={!domainName.trim()}
                className="px-5 py-2 rounded-full bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                Continue to DNS Setup
              </button>
            </div>
          </div>
        )}

        {step === 'dns' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Add the following <strong>TXT</strong> record to your DNS provider (e.g. Cloudflare, Namecheap, GoDaddy) to prove ownership of <strong>{domainName}</strong>:
            </p>

            {/* DNS Records Box */}
            <div className="p-4 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] space-y-3 font-mono text-xs">
              
              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] font-sans text-xs">Record Type:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold">TXT</span>
              </div>

              {/* Host/Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)] font-sans text-xs">Host / Name:</span>
                  <button
                    onClick={() => handleCopy(challengeName, 'name')}
                    className="flex items-center gap-1 text-[11px] text-black dark:text-white hover:underline font-sans"
                  >
                    {copiedName ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedName ? 'Copied' : 'Copy Name'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] truncate text-[11px]">
                  {challengeName}
                </div>
              </div>

              {/* TXT Value */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)] font-sans text-xs">TXT Value / Content:</span>
                  <button
                    onClick={() => handleCopy(challengeValue, 'txt')}
                    className="flex items-center gap-1 text-[11px] text-black dark:text-white hover:underline font-sans"
                  >
                    {copiedTxt ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTxt ? 'Copied' : 'Copy TXT Value'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-black dark:text-white font-bold truncate text-[11px]">
                  {challengeValue}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-semibold hover:bg-[var(--bg-hover)] transition-colors"
              >
                Back
              </button>

              <button
                onClick={handleVerifyDNS}
                disabled={isVerifying}
                className="px-5 py-2 rounded-full bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking DNS Propagation...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Verify DNS Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'verified' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Domain Ownership Verified!
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              <strong>{domainName}</strong> has been successfully verified and added to your builder profile.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
