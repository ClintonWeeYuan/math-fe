export function LoadingPage() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                {/* Spinner */}
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>

                {/* Loading text */}
                <p className="text-gray-700 text-lg font-medium animate-pulse">
                    Loading...
                </p>

                {/* Optional progress dots */}
                <div className="flex justify-center mt-4 space-x-2">
                    <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    ></div>
                </div>
            </div>
        </div>
    )
}
