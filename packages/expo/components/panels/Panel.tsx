import { Panel as PanelType } from '@/types'
import { FarcasterFeedPanel } from '../farcaster/FarcasterFeedPanel'
import { usePanel } from '@/hooks/usePanel'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useScroll } from '@/context/scroll'

export const Panel = ({ panel }: { panel: PanelType }) => {
  const { fetchPage } = usePanel(panel)
  const paddingBottom = useBottomTabBarHeight()
  const { setShowNookOverlay } = useScroll()

  switch (panel.type) {
    case 'feed':
    case 'default':
    case 'channel':
      return (
        <FarcasterFeedPanel
          keys={['panel', panel.id]}
          fetch={fetchPage}
          paddingTop={94}
          paddingBottom={paddingBottom}
          setOverlay={setShowNookOverlay}
          display={panel.display}
        />
      )
    default:
      return null
  }
}
