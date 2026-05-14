import { clsx } from 'clsx'
import type { StrategyId } from '@/types/game'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'

const STRATEGIES = Object.values(STRATEGY_INFO)

interface StrategySelectorProps {
  selected: StrategyId
  onSelect: (id: StrategyId) => void
  disabled?: boolean
}

export function StrategySelector({ selected, onSelect, disabled = false }: StrategySelectorProps) {
  return (
    <div>
      <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-2">
        戦略を選択 ({STRATEGIES.length}種類)
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STRATEGIES.map(info => (
          <button
            key={info.id}
            onClick={() => onSelect(info.id)}
            disabled={disabled}
            className={clsx(
              'px-2.5 py-2 rounded-lg border text-left transition-all active:scale-95',
              selected === info.id
                ? 'border-opacity-80'
                : 'border-casino-border bg-casino-surface opacity-75',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
            style={selected === info.id ? {
              borderColor: info.color,
              backgroundColor: `${info.color}18`,
              boxShadow: `0 0 10px ${info.color}25`,
            } : {}}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
              <span className="text-xs font-ui text-white leading-tight font-medium">{info.name}</span>
            </div>
            {/* Risk bar */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: i < info.riskLevel ? info.color : '#2a2a32' }} />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Selected description */}
      {STRATEGIES.find(s => s.id === selected) && (
        <div
          className="mt-3 p-3 rounded-lg border text-xs text-white/70 font-ui"
          style={{
            borderColor: `${STRATEGY_INFO[selected].color}40`,
            backgroundColor: `${STRATEGY_INFO[selected].color}0d`,
          }}
        >
          <span className="font-semibold" style={{ color: STRATEGY_INFO[selected].color }}>
            {STRATEGY_INFO[selected].name}:
          </span>{' '}
          {STRATEGY_INFO[selected].description}
        </div>
      )}
    </div>
  )
}
