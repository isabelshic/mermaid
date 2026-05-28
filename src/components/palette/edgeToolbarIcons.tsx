import { ArrowRight, Minus } from 'iconoir-react'
import type { EdgeDirection, EdgeStrokeStyle } from '../../types/diagram'
import { BidirectionalArrowIcon } from './icons/BidirectionalArrowIcon'
import { GroupToolIcon } from './icons/GroupToolIcon'

export const edgeIconActiveColor = '#0066ff'
export const edgeIconMutedColor = 'var(--neutral-text-muted)'

export const edgeStrokeLabels: Record<EdgeStrokeStyle, string> = {
  solid: 'Solid line',
  dashed: 'Dashed line',
}

export const edgeDirectionLabels: Record<EdgeDirection, string> = {
  none: 'No arrows',
  'one-way': 'One-way arrow',
  both: 'Both ways',
}

export function EdgeStrokeIcon({
  strokeStyle,
  active,
  activeColor = edgeIconActiveColor,
}: {
  strokeStyle: EdgeStrokeStyle
  active: boolean
  activeColor?: string
}) {
  const color = active ? activeColor : edgeIconMutedColor

  if (strokeStyle === 'dashed') {
    return <GroupToolIcon color={color} />
  }

  return <Minus width={16} height={16} strokeWidth={1.5} color={color} />
}

export function EdgeDirectionIcon({
  direction,
  active,
  activeColor = edgeIconActiveColor,
}: {
  direction: EdgeDirection
  active: boolean
  activeColor?: string
}) {
  const color = active ? activeColor : edgeIconMutedColor

  if (direction === 'both') {
    return <BidirectionalArrowIcon color={color} />
  }

  if (direction === 'one-way') {
    return (
      <ArrowRight width={16} height={16} strokeWidth={1.5} color={color} />
    )
  }

  return <Minus width={16} height={16} strokeWidth={1.5} color={color} />
}
