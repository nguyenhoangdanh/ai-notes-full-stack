import { useKV } from '@github/spark/hooks'

export function useAuth() {
  const [user] = useKV('current-user', null)
  
  return {
    user,
    isLoading: false
  }
}