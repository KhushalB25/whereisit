"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/ui/PageTransition";
import { updateProfile } from "firebase/auth";
import { Bell, Download, Edit3, KeyRound, Lock, LogOut, Mail, Save, Shield, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useItems } from "@/hooks/useItems";
import { PinModal } from "@/components/security/PinModal";
import { usePrivateVault } from "@/components/security/PrivateVaultProvider";
import { useMemo, useState } from "react";
import { VaultStatToggle } from "@/components/security/VaultStatToggle";
import { useToast } from "@/components/ui/Toast";
import { getExpiryState } from "@/lib/utils";
import { downloadCSV, downloadEncryptedFile, encryptVaultCSV, exportToCSV, parseImportCSV } from "@/lib/export-import";
import { useNotifications } from "@/hooks/useNotifications";

export function ProfileClient() {
  const router = useRouter();
  const { user, logOut } = useAuth();
  const { hasPin, pin, unlocked, lock, changePin } = usePrivateVault();
  const { items } = useItems();
  const [pinOpen, setPinOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [pinChanging, setPinChanging] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [statsIncludeVault, setStatsIncludeVault] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const { permission, requestPermission } = useNotifications();
  const statItems = statsIncludeVault ? items : items.filter((item) => !item.isPrivate);
  const active = statItems.filter((item) => item.status !== "finished").length;
  const finished = statItems.filter((item) => item.status === "finished").length;
  const expiringSoon = statItems.filter((item) => item.status !== "finished" && getExpiryState(item).days !== null && getExpiryState(item).days! <= 7).length;

  async function handleLogout() {
    await logOut();
    router.replace("/login");
  }

  async function saveProfile() {
    if (!user || !displayName.trim()) return;
    setProfileSaving(true);
    try {
      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ displayName })
      });
      await updateProfile(user, { displayName });
      await user.reload();
      setEditingProfile(false);
    } finally {
      setProfileSaving(false);
    }
  }

  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const publicItems = useMemo(() => items.filter((i) => !i.isPrivate), [items]);
  const vaultItems = useMemo(() => items.filter((i) => i.isPrivate), [items]);

  async function handleExportPublic() {
    const csv = exportToCSV(publicItems);
    downloadCSV(csv, `whereisit-public-${new Date().toISOString().split("T")[0]}.csv`);
    toast(`${publicItems.length} items exported.`, "success");
    setExportOpen(false);
  }

  async function handleExportVault() {
    if (!pin) { toast("Unlock the vault first to export encrypted items.", "error"); setExportOpen(false); return; }
    setExporting(true);
    try {
      const csv = exportToCSV(vaultItems);
      const hexData = await encryptVaultCSV(csv, pin!);
      downloadEncryptedFile(hexData, `whereisit-vault-${new Date().toISOString().split("T")[0]}.vault`);
      toast(`${vaultItems.length} vault items exported (PIN-protected).`, "success");
      setExportOpen(false);
    } catch {
      toast("Could not encrypt vault export.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCombined() {
    setExporting(true);
    try {
      const publicCSV = exportToCSV(publicItems);
      const vaultCSV = exportToCSV(vaultItems);
      const vaultHex = vaultItems.length && pin ? await encryptVaultCSV(vaultCSV, pin) : "";

      const combined = JSON.stringify({
        exportedAt: new Date().toISOString(),
        public: { csv: publicCSV, count: publicItems.length },
        vault: vaultItems.length
          ? { encrypted: vaultHex, count: vaultItems.length }
          : { count: 0 },
      });

      downloadCSV(combined, `whereisit-combined-${new Date().toISOString().split("T")[0]}.wicd`);
      toast(`Export downloaded (${publicItems.length} public + ${vaultItems.length} vault).`, "success");
      setExportOpen(false);
    } catch {
      toast("Could not export combined data.", "error");
    } finally {
      setExporting(false);
    }
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const rows = parseImportCSV(text);
      if (!rows.length) { toast("No valid rows found in CSV.", "error"); return; }
      setImportPreview(rows.length);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function confirmImport() {
    if (!user || !importPreview) return;
    setImporting(true);
    try {
      const file = fileRef.current?.files?.[0];
      const text = file ? await file.text() : "";
      if (!text) { toast("Could not read file.", "error"); setImportPreview(null); setImporting(false); return; }
      const rows = parseImportCSV(text);
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: rows }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Import failed.");
      toast(`${rows.length} items imported.`, "success");
      setImportPreview(null);
      location.reload();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Import failed.", "error");
    } finally {
      setImporting(false);
    }
  }

  async function handleChangePin() {
    setPinMessage(null);
    if (!/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
      setPinMessage("Both PIN fields must be 4 digits.");
      return;
    }
    setPinChanging(true);
    try {
      await changePin(oldPin, newPin);
      setOldPin("");
      setNewPin("");
      setPinMessage("PIN changed.");
    } catch (error) {
      setPinMessage(error instanceof Error ? error.message : "Could not change PIN.");
    } finally {
      setPinChanging(false);
    }
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-warm-cream">Profile</h1>
        <p className="mt-1 text-sm text-warm-greige">Account and inventory summary.</p>
      </div>

      <section className="panel p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-copper text-xl font-semibold text-warm-bg">
            {(user?.displayName || user?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            {editingProfile ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="input-shell" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                <Button type="button" onClick={saveProfile} loading={profileSaving}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-lg font-semibold text-warm-cream">
                <UserRound className="h-5 w-5 text-warm-copper" />
                <span className="truncate">{user?.displayName || "WhereIsIt user"}</span>
                <button type="button" onClick={() => setEditingProfile(true)} className="rounded-lg p-1 text-warm-greige hover:bg-[#24251F] hover:text-warm-cream">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-warm-greige">
              <Mail className="h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total" value={statItems.length} includeVault={statsIncludeVault} onToggleVault={setStatsIncludeVault} />
        <Stat label="Active" value={active} includeVault={statsIncludeVault} onToggleVault={setStatsIncludeVault} />
        <Stat label="Expiring 7d" value={expiringSoon} includeVault={statsIncludeVault} onToggleVault={setStatsIncludeVault} />
        <Stat label="Finished" value={finished} />
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-lg font-semibold text-warm-cream">Data</h2>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} loading={importing}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={handleImportFile} />
        </div>
        {importPreview ? (
          <div className="mt-3 rounded-xl border border-warm-mustard/30 bg-warm-mustard/10 p-4 text-sm text-warm-mustard">
            <p className="font-medium">{importPreview} items ready to import.</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" onClick={confirmImport} loading={importing}>
                Confirm import
              </Button>
              <Button type="button" variant="ghost" onClick={() => setImportPreview(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {exportOpen ? (
          <div className="mt-4 grid gap-2 border-t border-warm-border pt-4">
            <p className="text-xs text-warm-greige/75">Choose what to export:</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button type="button" variant="secondary" onClick={handleExportPublic}>
                <Download className="h-4 w-4" />
                All items ({publicItems.length})
              </Button>
              <Button type="button" variant="secondary" onClick={handleExportVault} disabled={!vaultItems.length} loading={exporting}>
                <Shield className="h-4 w-4" />
                Vault items{vaultItems.length ? ` (${vaultItems.length})` : ""}
              </Button>
              <Button type="button" variant="secondary" onClick={handleExportCombined} loading={exporting}>
                <Lock className="h-4 w-4" />
                Combined
              </Button>
            </div>
            {vaultItems.length && !pin ? (
              <p className="text-xs text-warm-mustard">Unlock the vault to export encrypted items.</p>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => setExportOpen(false)} className="self-start text-xs">
              Cancel
            </Button>
          </div>
        ) : null}
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-warm-cream">
              <Bell className="h-5 w-5 text-warm-copper" />
              Notifications
            </div>
            <p className="mt-1 text-sm text-warm-greige">
              {permission === "granted"
                ? "Push notifications are enabled."
                : permission === "denied"
                  ? "Notifications blocked in browser settings."
                  : permission === "unsupported"
                    ? "Notifications not supported in this browser."
                    : "Get notified about expiring items and low stock."}
            </p>
          </div>
          {permission === "default" ? (
            <Button type="button" variant="secondary" onClick={requestPermission}>
              <Bell className="h-4 w-4" />
              Enable
            </Button>
          ) : null}
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-warm-cream">
              <KeyRound className="h-5 w-5 text-warm-copper" />
              Security
            </div>
            <p className="mt-1 text-sm text-warm-greige">{hasPin ? "Your private vault PIN is configured." : "Create a 4-digit PIN before saving private items."}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warm-bg px-3 py-1 text-xs text-warm-greige">
              <Lock className="h-3.5 w-3.5" />
              Vault is {unlocked ? "unlocked for this session" : "locked"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setPinOpen(true)}>
              {hasPin ? "Unlock Vault" : "Create PIN"}
            </Button>
            {unlocked ? (
              <Button type="button" variant="secondary" onClick={lock}>
                Lock
              </Button>
            ) : null}
          </div>
        </div>
        {hasPin ? (
          <div className="mt-5 grid gap-3 border-t border-warm-border pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-2">
              <span className="field-label">Old PIN</span>
              <input className="input-shell" inputMode="numeric" maxLength={4} type="password" value={oldPin} onChange={(event) => setOldPin(event.target.value.replace(/\D/g, "").slice(0, 4))} />
            </label>
            <label className="space-y-2">
              <span className="field-label">New PIN</span>
              <input className="input-shell" inputMode="numeric" maxLength={4} type="password" value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))} />
            </label>
            <Button type="button" loading={pinChanging} onClick={handleChangePin}>
              Change PIN
            </Button>
            {pinMessage ? <div className="text-sm text-warm-greige sm:col-span-3">{pinMessage}</div> : null}
          </div>
        ) : null}
      </section>

      <Button type="button" variant="danger" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
      <PinModal open={pinOpen} mode={hasPin ? "verify" : "setup"} onClose={() => setPinOpen(false)} />
    </div>
    </PageTransition>
  );
}

function Stat({ label, value, includeVault, onToggleVault }: { label: string; value: number; includeVault?: boolean; onToggleVault?: (show: boolean) => void }) {
  return (
    <div className="panel p-5">
      <div className="text-3xl font-semibold text-warm-cream">{value}</div>
      <div className="mt-1 text-sm text-warm-greige">{label}</div>
      {onToggleVault ? <VaultStatToggle showing={Boolean(includeVault)} onToggle={onToggleVault} /> : null}
    </div>
  );
}
