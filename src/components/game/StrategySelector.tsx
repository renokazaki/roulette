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
        戦略選択
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {STRATEGIES.map(info => (
          <button
            key={info.id}
            onClick={() => onSelect(info.id)}
            disabled={disabled}
            className={clsx(
              'px-2 py-2 rounded border text-left transition-all active:scale-95',
              selected === info.id
                ? 'border-opacity-80'
                : 'border-casino-border bg-casino-surface opacity-70',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
            style={selected === info.id ? {
              borderColor: info.color,
              backgroundColor: `${info.color}18`,
              boxShadow: `0 0 12px ${info.color}30`,
            } : {}}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: info.color }}
              />
              <span className="text-xs font-ui text-white leading-tight">{info.name}</span>
            </div>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: i < info.riskLevel ? info.color : '#2a2a32' }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
