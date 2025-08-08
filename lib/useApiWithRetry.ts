import { useState, useCallback } from 'react'

interface ApiError {
  error: string
  details?: string
  requestId?: string
  retryable?: boolean
  duration?: number
}

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

interface ApiCallState<T> {
  data: T | null
  error: ApiError | null
  isLoading: boolean
  isRetrying: boolean
  retryCount: number
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  onRetry: () => {}
}

export function useApiWithRetry<T>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0
  })

  const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
    const exponentialDelay = options.baseDelay * Math.pow(options.backoffFactor, attempt)
    const jitterDelay = exponentialDelay + Math.random() * 1000 // Add jitter
    return Math.min(jitterDelay, options.maxDelay)
  }

  const makeApiCall = useCallback(async (
    apiCall: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const opts = { ...defaultRetryOptions, ...options }
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      isRetrying: false,
      retryCount: 0 
    }))

    let lastError: Error | undefined
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        console.log(`🔄 API call attempt ${attempt + 1}/${opts.maxRetries + 1}`)
        
        if (attempt > 0 && lastError) {
          setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt }))
          opts.onRetry(attempt, lastError)
          
          const delay = calculateDelay(attempt - 1, opts)
          console.log(`⏱️ Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const result = await apiCall()
        
        console.log(`✅ API call succeeded on attempt ${attempt + 1}`)
        setState(prev => ({ 
          ...prev, 
          data: result, 
          isLoading: false, 
          isRetrying: false,
          error: null 
        }))
        
        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`❌ API call failed on attempt ${attempt + 1}:`, lastError.message)

        // Try to parse as API error if it's a Response error
        if (error instanceof Error && error.message.includes('HTTP')) {
          try {
            const response = (error as Error & { response?: { json: () => Promise<ApiError> } }).response
            if (response && typeof response.json === 'function') {
              const apiError: ApiError = await response.json()
              
              // If the error is explicitly non-retryable, stop trying
              if (apiError.retryable === false) {
                console.log(`🚫 Error marked as non-retryable, stopping attempts`)
                setState(prev => ({ 
                  ...prev, 
                  error: apiError, 
                  isLoading: false, 
                  isRetrying: false 
                }))
                throw lastError
              }
            }
          } catch {
            // If we can't parse the error, continue with regular retry logic
            console.warn('⚠️ Could not parse API error response')
          }
        }

        // If this was the last attempt, fail
        if (attempt === opts.maxRetries) {
          console.error(`💥 All ${opts.maxRetries + 1} attempts failed`)
          setState(prev => ({ 
            ...prev, 
            error: {
              error: lastError?.message || 'Unknown error',
              details: 'All retry attempts exhausted'
            },
            isLoading: false, 
            isRetrying: false 
          }))
          throw lastError || new Error('All retry attempts failed')
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error occurred')
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isRetrying: false,
      retryCount: 0
    })
  }, [])

  return {
    ...state,
    makeApiCall,
    reset
  }
}

// Specialized hook for audio generation
export function useAudioApiWithRetry() {
  const { makeApiCall, ...rest } = useApiWithRetry<Blob>()

  const generateAudio = useCallback(async (
    text: string, 
    sampleRate: string = "22050",
    options?: RetryOptions
  ) => {
    console.log(`🎤 Starting audio generation with retry for text: "${text.substring(0, 50)}..."`)
    
    return makeApiCall(async () => {
      const response = await fetch("/api/generate-lesson-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sampleRate
        }),
      })

      console.log(`📡 Audio API response status: ${response.status}`)

      if (!response.ok) {
        // Try to parse error details
        let errorDetails: ApiError
        try {
          errorDetails = await response.json()
        } catch {
          errorDetails = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            retryable: response.status >= 500 || response.status === 429
          }
        }

        console.error(`❌ Audio API error:`, errorDetails)
        const error = new Error(errorDetails.error) as Error & { response: { json: () => Promise<ApiError> } };
        error.response = { json: () => Promise.resolve(errorDetails) }
        throw error
      }

      const audioBlob = await response.blob()
      console.log(`✅ Audio blob received: ${audioBlob.size} bytes`)
      
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio file')
      }

      return audioBlob
    }, {
      maxRetries: 2,
      baseDelay: 2000,
      maxDelay: 8000,
      onRetry: (attempt, error) => {
        console.log(`🔄 Retrying audio generation (attempt ${attempt}): ${error.message}`)
      },
      ...options
    })
  }, [makeApiCall])

  return {
    ...rest,
    generateAudio
  }
}