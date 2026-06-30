import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function EmailFields({
  email,
  setEmail,
  cc,
  setCc,
  bcc,
  setBcc,
  emailError,
  ccError,
  bccError,
  userEmail,
}) {
  const [showCcBcc, setShowCcBcc] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-muted-foreground">
            Recipient Email *
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 cursor-pointer uppercase tracking-wide"
            >
              {showCcBcc ? <Minus size={10} /> : <Plus size={10} />}
              {showCcBcc ? "CC / BCC" : "Add CC/BCC"}
            </button>
          </div>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={`w-full px-3.5 py-2.5 text-sm bg-input-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all ${emailError ? "border-destructive" : "border-border focus:border-primary/50"
            }`}
        />
        {emailError && <p className="text-[11px] text-destructive mt-1 font-medium">{emailError}</p>}
      </div>

      {showCcBcc && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              CC
            </label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@company.com"
              className={`w-full px-3.5 py-2 text-xs bg-input-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all ${ccError ? "border-destructive" : "border-border focus:border-primary/50"
                }`}
            />
            {ccError && <p className="text-[10px] text-destructive mt-1 font-medium">{ccError}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              BCC
            </label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@company.com"
              className={`w-full px-3.5 py-2 text-xs bg-input-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all ${bccError ? "border-destructive" : "border-border focus:border-primary/50"
                }`}
            />
            {bccError && <p className="text-[10px] text-destructive mt-1 font-medium">{bccError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
