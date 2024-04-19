import { SheetState, useSheets } from '@/context/sheet'
import { useTheme } from '@/context/theme'
import { haptics } from '@/utils/haptics'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet'
import { ReactNode, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import { FullWindowOverlay } from 'react-native-screens'
import { Theme, useTheme as useTamaguiTheme } from 'tamagui'

export const BaseSheet = memo(
  ({
    sheet,
    children,
  }: {
    sheet: SheetState
    children: ReactNode
  }) => {
    const { closeSheet } = useSheets()
    const { theme: themeName } = useTheme()
    const theme = useTamaguiTheme()
    const snapPoints = useMemo(() => sheet.snapPoints || ['90%'], [])
    const reducedMotion = useReducedMotion()
    const config = useBottomSheetTimingConfigs({})

    const ref = useRef<BottomSheetModal>(null)

    useEffect(() => {
      ref.current?.present()
      haptics.impactLight()
      return ref.current?.close
    }, [ref])

    const containerComponent = useCallback(
      (props: any) => <FullWindowOverlay>{props.children}</FullWindowOverlay>,
      []
    )

    return (
      <BottomSheetModal
        ref={ref}
        animateOnMount={!reducedMotion}
        containerComponent={Platform.OS === 'ios' ? containerComponent : undefined}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{
          backgroundColor: theme.color1.val,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.color5.val,
        }}
        handleStyle={{
          backgroundColor: theme.color1.val,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        }}
        enableDynamicSizing={!!sheet.autoHeight}
        snapPoints={
          sheet.autoHeight ? undefined : sheet.fullscreen ? ['100%'] : snapPoints
        }
        onDismiss={() => {
          closeSheet(sheet.type)
        }}
        animationConfigs={config}
      >
        <Theme name={themeName}>{children}</Theme>
      </BottomSheetModal>
    )
  }
)
