import { Abi } from 'viem'

/** A developer friendly representation of a Frame */
export type Frame = {
  /** A valid frame version string. The string must be a release date (e.g. 2020-01-01 ) or vNext. Apps must ignore versions they do not understand. Currently, the only valid version is vNext.  */
  version: FrameVersion
  /** A 256-byte string which contains a valid URL to send the Signature Packet to. If this prop is not present, apps must POST to the frame URL. */
  postUrl: string
  /** A page may contain 0 to 4 buttons. If more than 1 button is present, the idx values must be in sequence starting from 1 (e.g. 1, 2 3). If a broken sequence is present (e.g 1, 2, 4), apps must not render the frame and instead render an OG embed. */
  buttons?: FrameButtonsType
  /** An image which should have an aspect ratio of 1.91:1 or 1:1 */
  image: string
  /** Must be either `1.91:1` or `1:1`. Defaults to `1.91:1` */
  imageAspectRatio?: ImageAspectRatio
  /** An image which should have an aspect ratio of 1.91:1. Fallback for clients that do not support frames. */
  ogImage?: string
  /** Adding this property enables the text field. The content is a 32-byte label that is shown to the user (e.g. Enter a message). */
  inputText?: string
  /** Frame servers may set this value and apps must sign and include it in the Frame Signature Packet. May be up to 4kb */
  state?: string
}

export type FrameVersion = 'vNext' | `${number}-${number}-${number}`

export type ImageAspectRatio = '1.91:1' | '1:1'

export type FrameButtonsType =
  | []
  | [FrameButton]
  | [FrameButton, FrameButton]
  | [FrameButton, FrameButton, FrameButton]
  | [FrameButton, FrameButton, FrameButton, FrameButton]

export type FrameButton =
  | FrameButtonPost
  | FrameButtonLink
  | FrameButtonPostRedirect
  | FrameButtonMint
  | FrameButtonTx

export interface FrameButtonLink {
  action: 'link'
  /** required for action type 'link' */
  target: string
  post_url?: undefined

  /** A 256-byte string which is label of the button */
  label: string
}

export interface FrameButtonTx {
  action: 'tx'
  target: string
  post_url?: undefined
  /** A 256-byte string which is label of the button */
  label: string
}

export interface FrameButtonMint {
  action: 'mint'
  /** The target  property MUST be a valid [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) address, plus an optional token_id . */
  target: string
  post_url?: undefined

  /** A 256-byte string which is label of the button */
  label: string
}

export interface FrameButtonPost {
  /** Must be post or post_redirect. Defaults to post if no value was specified.
   * If set to post, app must make the POST request and frame server must respond with a 200 OK, which may contain another frame.
   * If set to post_redirect, app must make the POST request, and the frame server must respond with a 302 OK with a location property set on the header. */
  action: 'post' | 'post_redirect'
  /**
   * POST the packet to fc:frame:button:$idx:action:target if present
   * POST the packet to fc:frame:post_url if target was not present.
   */
  target?: string
  post_url?: undefined
  /** A 256-byte string which is label of the button */
  label: string
}
export type FrameButtonPostRedirect = FrameButtonPost

export type EthSendTransactionParams = {
  /** JSON ABI. This must include the encoded function type and should include any potential error types. */
  abi: JSON | Abi | []
  /** transaction to address */
  to: `0x${string}`
  /** value of ether to send with the transaction in wei */
  value: string
  /** optional transaction call data */
  data?: `0x${string}`
}

export type TransactionTargetResponse = {
  chainId: string
  method: 'eth_sendTransaction'
  params: EthSendTransactionParams
}
