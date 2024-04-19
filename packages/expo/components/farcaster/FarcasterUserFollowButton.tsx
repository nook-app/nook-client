import { UserAction, useUserActions } from '@/hooks/useUserActions'
import { Button } from '../Button'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/context/auth'

export const FarcasterUserFollowButton = ({ fid }: { fid: string }) => {
  const { dispatch } = useUserActions(fid)
  const { user } = useUser(fid)
  const { session } = useAuth()

  if (!user || session?.fid === fid) {
    return null
  }

  return (
    <Button
      onPress={() =>
        dispatch(
          user.context?.following ? UserAction.UnfollowUser : UserAction.FollowUser
        )
      }
      variant={user.context?.following ? 'primary-outlined' : 'primary'}
    >
      {user.context?.following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
