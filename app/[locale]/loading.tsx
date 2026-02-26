export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16 flex items-center justify-center scale-90 sm:scale-100">
                    <div className="absolute inset-0 border-4 border-[var(--color-primary)]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />

                    <div className="absolute inset-2 border-4 border-[var(--color-primary-light)]/10 rounded-full" />
                    <div className="absolute inset-2 border-4 border-transparent border-b-[var(--color-primary-light)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div className="text-center">
                    <h2 className="text-[var(--foreground)] font-bold text-lg tracking-tight mb-1">Loading BillForge</h2>
                    <p className="text-[var(--foreground)]/50 text-xs font-medium uppercase tracking-wider">Preparing your dashboard...</p>
                </div>
            </div>
        </div>
    );
}
