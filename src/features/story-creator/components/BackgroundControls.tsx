interface BackgroundControlsProps {
  backgroundColor: string;
  onChangeBackground: (color: string) => void;
}

const PRESET_COLORS = [
  '#141418',
  '#09090b',
  '#1c1917',
  '#1e1b4b',
  '#172554',
  '#14532d',
  '#4c0519',
  '#f5f5f4',
];

export function BackgroundControls({
  backgroundColor,
  onChangeBackground,
}: BackgroundControlsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => {
          const isActive =
            backgroundColor.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChangeBackground(color)}
              title={color}
              aria-label={`Pilih warna latar ${color}`}
              className={`h-8 w-full rounded-lg border transition-transform hover:scale-105 ${
                isActive
                  ? 'border-white ring-2 ring-white/30'
                  : 'border-white/15'
              }`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300 transition-colors hover:border-white/20">
        <span>Warna Kustom</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-neutral-400">
            {backgroundColor}
          </span>
          <input
            type="color"
            value={
              backgroundColor === 'transparent' ? '#141418' : backgroundColor
            }
            onChange={(e) => onChangeBackground(e.target.value)}
            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </div>
      </label>

      <button
        type="button"
        onClick={() => onChangeBackground('transparent')}
        className={`w-full rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
          backgroundColor === 'transparent'
            ? 'border-white/25 bg-white/10 text-white'
            : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-neutral-200'
        }`}
      >
        Transparan (untuk Export PNG)
      </button>
    </div>
  );
}
