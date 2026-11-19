import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { errorMessage } from '#/lib/api-client'

/**
 * A mutation that toasts on success, refreshes the given query keys (and the
 * alerts bell), and reports failures as a toast unless onError handles them.
 */
export function useSave<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  opts: {
    invalidate: Array<string>
    success?: string | ((r: TResult) => string)
    onDone?: (r: TResult) => void
    onError?: (message: string) => void
  },
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result) => {
      const msg = typeof opts.success === 'function' ? opts.success(result) : opts.success
      if (msg) toast.success(msg)
      await Promise.all(
        [...opts.invalidate, 'alerts', 'dashboard'].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      )
      opts.onDone?.(result)
    },
    onError: (err) => (opts.onError ? opts.onError(errorMessage(err)) : toast.error(errorMessage(err))),
  })
}
