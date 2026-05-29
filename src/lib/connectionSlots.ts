/** Handle ids on asset nodes (`AssetNode`); used for JSON edge attachment points. */
export const ASSET_CONNECTION_SLOT_IDS = [
  'left-top',
  'left',
  'left-bottom',
  'right-top',
  'right',
  'right-bottom',
  'top-left',
  'top',
  'top-right',
  'bottom-left',
  'bottom',
  'bottom-right',
] as const

export type AssetConnectionSlotId = (typeof ASSET_CONNECTION_SLOT_IDS)[number]

const SLOT_ID_SET = new Set<string>(ASSET_CONNECTION_SLOT_IDS)

export function isAssetConnectionSlotId(value: string): value is AssetConnectionSlotId {
  return SLOT_ID_SET.has(value)
}
