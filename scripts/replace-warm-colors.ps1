$replacements = @(
    # MUST be ordered from most-specific to least-specific

    # border-warm-mustard (specific opacity variants first)
    @{ Old = 'border-warm-mustard/30'; New = 'border-gold/30' }
    @{ Old = 'border-warm-mustard/20'; New = 'border-gold/20' }
    @{ Old = 'border-warm-mustard';     New = 'border-gold' }

    # border-warm-rust
    @{ Old = 'border-warm-rust/30'; New = 'border-blood/30' }
    @{ Old = 'border-warm-rust';     New = 'border-blood' }

    # border-warm-copper (specific first)
    @{ Old = 'border-warm-copper/60'; New = 'border-blood/60' }
    @{ Old = 'border-warm-copper/50'; New = 'border-blood/50' }
    @{ Old = 'border-warm-copper/40'; New = 'border-blood/40' }
    @{ Old = 'border-warm-copper';    New = 'border-blood' }

    # border-warm-border
    @{ Old = 'border-warm-border/50'; New = 'border-white/[0.06]/50' }
    @{ Old = 'border-warm-border';    New = 'border-white/[0.06]' }

    # Divide warm-border
    @{ Old = 'divide-warm-border'; New = 'divide-white/[0.06]' }

    # bg-warm-mustard (children of warm-bg need to come before bg-warm-bg)
    @{ Old = 'bg-warm-mustard/10'; New = 'bg-gold-dim' }

    # bg-warm-rust
    @{ Old = 'bg-warm-rust/12'; New = 'bg-blood-muted' }

    # bg-warm-copper (specific first)
    @{ Old = 'bg-warm-copper/15'; New = 'bg-blood-muted' }
    @{ Old = 'bg-warm-copper/10'; New = 'bg-blood/10' }

    # bg-warm-card
    @{ Old = 'bg-warm-card'; New = 'bg-crimson-900' }

    # bg-warm-bg (specific opacity first)
    @{ Old = 'bg-warm-bg/70'; New = 'bg-crimson-950/70' }
    @{ Old = 'bg-warm-bg/60'; New = 'bg-crimson-950/60' }
    @{ Old = 'bg-warm-bg/50'; New = 'bg-crimson-950/50' }
    @{ Old = 'bg-warm-bg';    New = 'bg-crimson-950' }

    # text-warm-sage (specific opacity first)
    @{ Old = 'text-warm-sage/80'; New = 'text-gold-light/80' }
    @{ Old = 'text-warm-sage';    New = 'text-gold-light' }

    # text-warm-rust (specific opacity first)
    @{ Old = 'text-warm-rust/60'; New = 'text-blood/60' }
    @{ Old = 'text-warm-rust';    New = 'text-blood' }

    # text-warm-mustard (specific opacity first)
    @{ Old = 'text-warm-mustard/80'; New = 'text-gold-light/80' }
    @{ Old = 'text-warm-mustard';    New = 'text-gold-light' }

    # text-warm-greige (specific opacity first)
    @{ Old = 'text-warm-greige/75'; New = 'text-white/30' }
    @{ Old = 'text-warm-greige/60'; New = 'text-white/25' }
    @{ Old = 'text-warm-greige/50'; New = 'text-white/20' }
    @{ Old = 'text-warm-greige';    New = 'text-white/40' }

    # text-warm-cream
    @{ Old = 'text-warm-cream'; New = 'text-parchment' }

    # text-warm-copper
    @{ Old = 'text-warm-copper'; New = 'text-blood' }

    # hover states
    @{ Old = 'hover:bg-warm-border'; New = 'hover:bg-white/[0.06]' }
    @{ Old = 'hover:bg-warm-card';   New = 'hover:bg-crimson-900' }
    @{ Old = 'hover:border-warm-copper/60'; New = 'hover:border-blood/60' }
    @{ Old = 'hover:border-warm-copper/50'; New = 'hover:border-blood/50' }
    @{ Old = 'hover:border-warm-copper';    New = 'hover:border-blood' }
    @{ Old = 'hover:text-warm-copper';      New = 'hover:text-blood' }
    @{ Old = 'hover:text-warm-cream';       New = 'hover:text-parchment' }
    @{ Old = 'hover:text-warm-rust';        New = 'hover:text-blood' }

    # ring
    @{ Old = 'focus-visible:ring-warm-copper/50'; New = 'focus-visible:ring-blood/50' }
    @{ Old = 'focus-visible:ring-warm-copper';    New = 'focus-visible:ring-blood' }
    @{ Old = 'ring-warm-copper/50';               New = 'ring-blood/50' }

    # Hardcoded hex colors
    @{ Old = "hover:text-[#E7B877]"; New = 'hover:text-blood' }
    @{ Old = "text-[#E7B877]";       New = 'text-blood' }

    # #24251F hardcoded backgrounds
    @{ Old = 'hover:bg-[#24251F]/80'; New = 'hover:bg-white/[0.04]/80' }
    @{ Old = 'bg-[#24251F]';          New = 'bg-white/[0.04]' }
    @{ Old = 'hover:bg-[#24251F]';    New = 'hover:bg-white/[0.04]' }

    # warm-copper in arbitrary classes (like shadow, mark bg)
    @{ Old = 'bg-warm-copper/30'; New = 'bg-blood/30' }
    @{ Old = 'shadow-[0_0_20px_rgba(216,162,94,0.1)]'; New = 'shadow-red-sm' }

    # animate-highlight-pulse - already exists in config, keep as is
    # shadow-glow - already exists in config, keep as is
)

$files = Get-ChildItem -Recurse -Filter "*.tsx" -Path "C:\Users\DELL\Documents\New project\components" | Select-Object -ExpandProperty FullName

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $original = $content

    foreach ($rep in $replacements) {
        $content = $content.Replace($rep.Old, $rep.New)
    }

    if ($content -ne $original) {
        $diff = [System.Text.Encoding]::UTF8.GetByteCount($original) - [System.Text.Encoding]::UTF8.GetByteCount($content)
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Output "Modified: $($file) (size changed by $diff bytes)"
        $totalReplacements++
    }
}

Write-Output ""
Write-Output "Done. $totalReplacements files modified."

# Verify no warm-* classes remain
$remaining = Select-String -Path "C:\Users\DELL\Documents\New project\components" -Pattern "warm-" -SimpleMatch
if ($remaining) {
    Write-Output "WARNING: warm-* classes still found:"
    $remaining | ForEach-Object { Write-Output "  $($_.Path):$($_.LineNumber) $($_.Line.Trim())" }
    exit 1
} else {
    Write-Output "SUCCESS: No warm-* classes remain in components directory."
    exit 0
}
