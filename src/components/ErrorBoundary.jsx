import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Failed to fetch')

      if (isChunkError) {
        // Auto-reload for chunk errors (stale deployment)
        window.location.reload()
        return null
      }

      return (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <p className="text-red-400 text-sm font-medium">Something went wrong loading this page.</p>
          <p className="text-gray-600 text-xs max-w-sm text-center">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#D4AF37] text-black text-sm rounded-lg hover:bg-[#F0D060] transition-all"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
