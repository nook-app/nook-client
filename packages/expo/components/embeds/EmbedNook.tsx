import { useCast } from '@/hooks/useCast'
import { UrlContentResponse } from '@/types'
import { EmbedCast } from './EmbedCast'

export const EmbedNook = ({ content }: { content: UrlContentResponse }) => {
  const pathname = new URL(content.uri).pathname

  if (pathname.startsWith('/casts/')) {
    const hash = pathname.split('/')[2]
    return <EmbedNookCast hash={hash} />
  }

  return <></>
}

const EmbedNookCast = ({ hash }: { hash: string }) => {
  const { cast } = useCast(hash)

  if (!cast) {
    return <></>
  }

  return <EmbedCast cast={cast} />
}
