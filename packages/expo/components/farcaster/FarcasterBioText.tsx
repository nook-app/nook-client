import { Linking } from 'react-native'
import { Text } from 'tamagui'
import { Buffer } from 'buffer'
import { DebouncedLink } from '../DebouncedLink'

export const FarcasterBioText = ({
  text,
  selectable,
}: { text: string; selectable?: boolean }) => {
  const textParts = []

  const textBuffer = Buffer.from(text.replaceAll(/\uFFFC/g, ''), 'utf-8')

  const splitLinkParts = (partText: string, index: number) => {
    if (partText.length === 0) return []

    const urlRegex =
      /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?/gi

    const matches = partText.match(urlRegex)
    if (!matches)
      return [
        <Text key={index} color="$mauve12">
          {partText}
        </Text>,
      ]

    const result = []
    let endIndex = partText.length
    for (const [i, url] of matches.reverse().entries()) {
      const index = partText.lastIndexOf(url) + url.length
      const nonUrlPart = partText.slice(index, endIndex)

      if (nonUrlPart !== '') {
        result.push(
          <Text key={`${index}-${i}-${nonUrlPart}`} color="$mauve12">
            {nonUrlPart}
          </Text>
        )
      }

      result.push(
        <Text
          key={`${index}-${i}-${url}`}
          color="$color11"
          fontWeight="500"
          onPress={() => Linking.openURL(url)}
        >
          {url}
        </Text>
      )

      endIndex = index - url.length
    }

    if (endIndex > 0) {
      const remainingText = partText.slice(0, endIndex)
      if (remainingText.trim() !== '') {
        result.push(
          <Text key={`${index}-${remainingText}`} color="$mauve12">
            {remainingText}
          </Text>
        )
      }
    }

    return result
  }

  const words = text.split(/\s+/)

  const channelMentions = words.reduce(
    (acc, word) => {
      const matchWord = word.match(/^\//)?.[0]
      const cleanWord = word.match(/^\/([\w-]+)/)?.[0]
      if (matchWord && cleanWord) {
        const position = Buffer.from(
          text.slice(0, text.indexOf(cleanWord, acc.lastIndex))
        ).length
        acc.mentions.push({ word: cleanWord, position })
        acc.lastIndex = position + matchWord.length
      }
      return acc
    },
    { mentions: [], lastIndex: 0 } as {
      mentions: { word: string; position: number }[]
      lastIndex: number
    }
  ).mentions

  const mentions = words.reduce(
    (acc, word) => {
      const cleanWord = word.match(/^@(\w+(?:\.eth)?)\b/)?.[0]
      if (cleanWord) {
        const position = Buffer.from(
          text.slice(0, text.indexOf(cleanWord, acc.lastIndex))
        ).length
        acc.mentions.push({ word: cleanWord, position, isUser: true })
        acc.lastIndex = position + cleanWord.length
      }
      return acc
    },
    { mentions: [], lastIndex: 0 } as {
      mentions: { word: string; position: number; isUser: boolean }[]
      lastIndex: number
    }
  ).mentions

  let index = textBuffer.length
  const sortedMentions = [...mentions, ...channelMentions]
    .sort((a, b) => Number(b.position) - Number(a.position))
    .filter(
      (mention, index, self) =>
        index === self.findIndex((m) => Number(m.position) === Number(mention.position))
    )
  for (const mention of sortedMentions) {
    if (mention.word.startsWith('/')) {
      textParts.push(
        ...splitLinkParts(
          textBuffer
            .slice(Number(mention.position) + mention.word.length, index)
            .toString('utf-8'),
          index
        )
      )
      textParts.push(
        <DebouncedLink
          key={`${mention.position}-${mention.word}`}
          href={{
            pathname: `/channels/[channelId]`,
            params: { channelId: mention.word.slice(1) },
          }}
          asChild
        >
          <Text color="$color11" fontWeight="500">
            {mention.word}
          </Text>
        </DebouncedLink>
      )
    } else {
      textParts.push(
        ...splitLinkParts(
          textBuffer
            .slice(Number(mention.position) + mention.word.length, index)
            .toString('utf-8'),
          index
        )
      )

      textParts.push(
        <DebouncedLink
          key={`${mention.position}-${mention.word}`}
          href={{
            pathname: `/users/[fid]`,
            params: { fid: mention.word.slice(1) },
          }}
          asChild
        >
          <Text color="$color11" fontWeight="500">
            {mention.word}
          </Text>
        </DebouncedLink>
      )
    }
    index = Number(mention.position)
  }

  if (index > 0) {
    textParts.push(...splitLinkParts(textBuffer.slice(0, index).toString('utf-8'), index))
  }

  if (textParts.length === 0) {
    return null
  }

  textParts.reverse()

  return <Text selectable={selectable}>{textParts}</Text>
}
