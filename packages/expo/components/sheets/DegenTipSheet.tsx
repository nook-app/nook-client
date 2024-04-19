import { SheetType, useSheet } from '@/context/sheet'
import { Spinner, View, YStack, XStack, Checkbox, Slider } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useCast } from '@/hooks/useCast'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { EmbedCast } from '../embeds/EmbedCast'
import { getDegenAllowance } from '@/utils/api/degen'
import { Text } from 'tamagui'
import { Label } from '../Label'
import { Check } from '@tamagui/lucide-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/context/auth'
import { fetchCast, submitCastAdd } from '@/utils/api'
import { ScrollProvider } from '@/context/scroll'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '../Button'
import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'

const queryClient = new QueryClient()

export const DegenTipSheet = () => {
  const { sheet, closeSheet, openSheet } = useSheet(SheetType.DegenTip)
  const { cast } = useCast(sheet.initialState?.hash || '')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['degenAllowance'],
    queryFn: getDegenAllowance,
  })
  const [error, setError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const { signer } = useAuth()
  const insets = useSafeAreaInsets()
  const { navigate } = useDebouncedNavigate()

  useEffect(() => {
    if (sheet.isOpen) {
      refetch()
      setIsPosting(false)
      setError(null)
    }
  }, [sheet.isOpen])

  const handlePress = async (amount: number, withComment: boolean) => {
    if (signer?.state !== 'completed') {
      closeSheet(SheetType.DegenTip)
      openSheet(SheetType.EnableSigner)
      return
    }

    if (withComment) {
      closeSheet(SheetType.DegenTip)
      router.push({
        pathname: `/create/post`,
        params: {
          parentHash: sheet.initialState?.hash,
          text: `${amount} $DEGEN\n\n`,
        },
      })
    } else {
      setIsPosting(true)
      const response = await submitCastAdd({
        text: `${amount} $DEGEN`,
        parentFid: cast?.user.fid,
        parentHash: cast?.hash,
      })
      if ('message' in response) {
        setError(response.message || 'An unknown error occurred')
        setIsPosting(false)
        return
      }

      await pollForHash(response.hash)
    }
  }

  const pollForHash = async (hash: string) => {
    let currentAttempts = 0
    let maxAttempts = 60

    let cast
    while (currentAttempts < maxAttempts && !cast) {
      currentAttempts++
      cast = await fetchCast(hash)
      if (cast) break
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    if (!cast) {
      setIsPosting(false)
      setError('Failed to enable Nook. Try again later.')
      return
    }

    if (cast) {
      queryClient.setQueryData(['cast', cast.hash], {
        ...cast,
        engagement: { ...cast.context, replies: (cast.engagement.replies || 0) + 1 },
      })
    }

    closeSheet(SheetType.DegenTip)

    navigate({
      pathname: '/casts/[hash]/',
      params: { hash },
    })
  }

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetScrollView>
        <QueryClientProvider client={queryClient}>
          <ScrollProvider>
            <YStack padding="$4" paddingBottom={insets.bottom} gap="$4">
              {isLoading && (
                <View>
                  <Spinner />
                </View>
              )}
              {(error || isError) && (
                <View>
                  <Text color="$red10">
                    {error || 'There was an error fetching the degen allowance'}
                  </Text>
                </View>
              )}
              {cast && !isError && data && (
                <>
                  <EmbedCast cast={cast} />
                  {!isPosting && (
                    <TipBar
                      remaining={Number(data.remaining) || 0}
                      total={Number(data.total)}
                      handlePress={handlePress}
                    />
                  )}
                  {isPosting && (
                    <YStack gap="$2" alignItems="center">
                      <Spinner />
                      <Label>Tipping post...</Label>
                    </YStack>
                  )}
                </>
              )}
            </YStack>
          </ScrollProvider>
        </QueryClientProvider>
      </BottomSheetScrollView>
    </BaseSheet>
  )
}

const TipBar = ({
  remaining,
  total,
  handlePress,
}: {
  remaining: number
  total: number
  handlePress: (amount: number, withComment: boolean) => void
}) => {
  const [tipMode, setTipMode] = useState<'percentage' | 'amount' | 'custom'>('amount')
  const [withComment, setWithComment] = useState(false)
  const [value, setValue] = useState([remaining])

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <XStack justifyContent="space-between">
          <Label>{`${remaining}/${total} remaining`}</Label>
        </XStack>
        <Slider
          size="$1"
          max={remaining}
          defaultValue={[remaining]}
          step={10}
          value={value}
          onValueChange={(val) => {
            setValue(val)
            setTipMode('custom')
          }}
        >
          <Slider.Track>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb circular index={0} />
        </Slider>
      </YStack>
      {tipMode === 'percentage' && remaining > 0 && (
        <XStack gap="$2" justifyContent="space-between">
          {Math.floor(remaining * 0.1) >= 100 && (
            <Button
              flex={1}
              onPress={() => handlePress(Math.floor(remaining * 0.1), withComment)}
            >
              10%
            </Button>
          )}
          {Math.floor(remaining * 0.25) >= 100 && (
            <Button
              flex={1}
              onPress={() => handlePress(Math.floor(remaining * 0.25), withComment)}
            >
              25%
            </Button>
          )}
          {Math.floor(remaining * 0.5) >= 100 && (
            <Button
              flex={1}
              onPress={() => handlePress(Math.floor(remaining * 0.5), withComment)}
            >
              50%
            </Button>
          )}
          <Button flex={1} onPress={() => handlePress(remaining, withComment)}>
            Max
          </Button>
        </XStack>
      )}
      {tipMode === 'amount' && remaining > 0 && (
        <XStack gap="$2" justifyContent="space-between">
          {remaining >= 100 && (
            <Button flex={1} onPress={() => handlePress(100, withComment)}>
              100
            </Button>
          )}
          {remaining >= 200 && (
            <Button flex={1} onPress={() => handlePress(200, withComment)}>
              200
            </Button>
          )}
          {remaining >= 500 && (
            <Button flex={1} onPress={() => handlePress(500, withComment)}>
              500
            </Button>
          )}
          <Button flex={1} onPress={() => handlePress(remaining, withComment)}>
            Max
          </Button>
        </XStack>
      )}
      {tipMode === 'custom' && remaining > 0 && (
        <XStack gap="$2" justifyContent="space-between">
          <Button flex={1} onPress={() => handlePress(value[0], withComment)}>
            {`Tip ${value} $DEGEN`}
          </Button>
        </XStack>
      )}
      {remaining > 0 && (
        <XStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity
            onPress={() => {
              setTipMode((prev) =>
                prev === 'amount'
                  ? 'percentage'
                  : prev === 'percentage'
                    ? 'custom'
                    : 'amount'
              )
              setValue([remaining])
            }}
          >
            <XStack
              borderRadius="$10"
              borderWidth="$0.5"
              borderColor="$color7"
              backgroundColor="$color4"
              paddingHorizontal="$2"
              paddingVertical="$1.5"
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              {tipMode === 'percentage' && <Label>% Percentage</Label>}
              {tipMode === 'amount' && <Label># Amount</Label>}
              {tipMode === 'custom' && <Label>Custom</Label>}
            </XStack>
          </TouchableOpacity>
          <XStack gap="$2" alignItems="center">
            <Checkbox
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              checked={withComment}
              onCheckedChange={(val) =>
                val === 'indeterminate' ? setWithComment(false) : setWithComment(val)
              }
            >
              <Checkbox.Indicator>
                <Check />
              </Checkbox.Indicator>
            </Checkbox>
            <Label>With Comment</Label>
          </XStack>
        </XStack>
      )}
      {remaining === 0 && (
        <View alignSelf="center">
          <Text>You don't have any degen allowance</Text>
        </View>
      )}
    </YStack>
  )
}
