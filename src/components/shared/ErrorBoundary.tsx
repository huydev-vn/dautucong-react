import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-400">
            <AlertTriangle size={32} strokeWidth={1.5} />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Đã xảy ra lỗi hiển thị</h2>
            <p className="mt-1 text-sm text-gray-500">
              Trang này gặp sự cố không mong muốn. Vui lòng thử lại.
            </p>
            {this.state.message && (
              <code className="mt-3 block rounded bg-gray-100 px-3 py-2 text-[11px] font-mono text-gray-500">
                {this.state.message}
              </code>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#1a3c6e] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0f2a52]"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
