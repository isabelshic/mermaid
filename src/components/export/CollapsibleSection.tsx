import { useState, type ReactNode } from 'react'
import { NavArrowDown } from 'iconoir-react'
import { uiLabelStyle } from '../../tokens/typography'
import { panelHoverClass } from '../../tokens/panel'

type CollapsibleSectionProps = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-md px-1 py-1 ${panelHoverClass}`}
        aria-expanded={open}
      >
        <span
          style={uiLabelStyle}
          className="text-[10px] text-[var(--neutral-text)]"
        >
          {title}
        </span>
        <NavArrowDown
          width={14}
          height={14}
          strokeWidth={1.5}
          color="var(--neutral-text-subtle)"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  )
}

export function CollapsibleHint({ children }: { children: ReactNode }) {
  return (
    <p
      style={uiLabelStyle}
      className="text-[9px] leading-snug text-[var(--neutral-textSubtle)]"
    >
      {children}
    </p>
  )
}
