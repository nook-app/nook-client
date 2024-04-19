import { SheetState, SheetType, useSheet, useSheets } from '@/context/sheet'
import { EnableSignerSheet } from './EnableSignerSheet'
import { CastMenuSheet } from './CastMenuSheet'
import { ChannelSelectorSheet } from './ChannelSelectorSheet'
import { UserSelectorSheet } from './UserSelectSheet'
import { SwitchAccountSheet } from './SwitchAccountSheet'
import { OptionSelectorSheet } from './OptionSelectorSheet'
import { DegenTipSheet } from './DegenTipSheet'
import { FrameTransactionSheet } from './FrameTransactionSheet'
import { RecastActionSheet } from './RecastActionSheet'
import { BrowseActionsSheet } from './BrowseActionsSheet'
import { AddActionSheet } from './AddAction'
import { InfoSheet } from './InfoSheet'
import { UserMenuSheet } from './UserMenuSheet'
import { ChannelMenuSheet } from './ChannelMenuSheet'
import { FeedActionSheet } from './FeedActionSheet'
import { NookActionSheet } from './NookActionSheet'
import { FeedInfoSheet } from './FeedInfoSheet'
import { ReactNode } from 'react'

export const Sheets = () => {
  return (
    <>
      <LazySheet type={SheetType.EnableSigner}>
        <EnableSignerSheet />
      </LazySheet>
      <LazySheet type={SheetType.CastAction}>
        <CastMenuSheet />
      </LazySheet>
      <LazySheet type={SheetType.ChannelSelector}>
        <ChannelSelectorSheet />
      </LazySheet>
      <LazySheet type={SheetType.UserSelector}>
        <UserSelectorSheet />
      </LazySheet>
      <LazySheet type={SheetType.SwitchAccount}>
        <SwitchAccountSheet />
      </LazySheet>
      <LazySheet type={SheetType.OptionSelector}>
        <OptionSelectorSheet />
      </LazySheet>
      <LazySheet type={SheetType.DegenTip}>
        <DegenTipSheet />
      </LazySheet>
      <LazySheet type={SheetType.FrameTransaction}>
        <FrameTransactionSheet />
      </LazySheet>
      <LazySheet type={SheetType.RecastAction}>
        <RecastActionSheet />
      </LazySheet>
      <LazySheet type={SheetType.BrowseActions}>
        <BrowseActionsSheet />
      </LazySheet>
      <LazySheet type={SheetType.AddAction}>
        <AddActionSheet />
      </LazySheet>
      <LazySheet type={SheetType.Info}>
        <InfoSheet />
      </LazySheet>
      <LazySheet type={SheetType.UserAction}>
        <UserMenuSheet />
      </LazySheet>
      <LazySheet type={SheetType.ChannelAction}>
        <ChannelMenuSheet />
      </LazySheet>
      <LazySheet type={SheetType.FeedAction}>
        <FeedActionSheet />
      </LazySheet>
      <LazySheet type={SheetType.NookAction}>
        <NookActionSheet />
      </LazySheet>
      <LazySheet type={SheetType.FeedInfo}>
        <FeedInfoSheet />
      </LazySheet>
    </>
  )
}

const LazySheet = ({ type, children }: { type: SheetType; children: ReactNode }) => {
  const { sheets } = useSheets()

  if (!sheets[type].isOpen) return null

  return <>{children}</>
}
