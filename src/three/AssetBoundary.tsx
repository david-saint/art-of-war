'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { clearTextures, type TextureSpec } from './textures'

/**
 * Texture-load error boundary.
 *
 * A texture cache memoises REJECTIONS as well as successes: one transient
 * failure — a dropped connection on a train, a CDN 503, a service worker miss
 * — and that asset is poisoned for the rest of the session. Every later mount
 * rethrows the cached rejection, so the chapter that briefly failed to load
 * never recovers, even when the network comes back and the file is sitting in
 * the browser cache.
 *
 * The fix is to evict the scene's assets from the cache and remount, which is
 * what this does. It retries a bounded number of times and then degrades to
 * the fallback rather than looping, because a genuinely missing asset should
 * show the reader a chapter without its imagery, not a blank page.
 */

type Props = {
  children: ReactNode
  /** Assets to evict from the texture cache before retrying. */
  specs?: readonly TextureSpec[]
  fallback?: ReactNode
  maxRetries?: number
  onError?: (error: Error) => void
}

type State = { failed: boolean; attempt: number; key: number }

export class AssetBoundary extends Component<Props, State> {
  state: State = { failed: false, attempt: 0, key: 0 }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error)
    const { specs = [], maxRetries = 2 } = this.props

    if (this.state.attempt >= maxRetries) {
      // eslint-disable-next-line no-console
      console.warn('[assets] giving up after retries', { urls: specs.map((s) => s.url), error: error.message, info: info.componentStack?.slice(0, 200) })
      return
    }

    clearTextures(specs)

    // Back off before remounting so a network blip has time to resolve.
    const delay = 600 * 2 ** this.state.attempt
    window.setTimeout(() => {
      this.setState((s) => ({ failed: false, attempt: s.attempt + 1, key: s.key + 1 }))
    }, delay)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return <group key={this.state.key}>{this.props.children}</group>
  }
}
