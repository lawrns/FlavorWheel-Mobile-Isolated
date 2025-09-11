import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import { vi } from 'vitest'
import {
  createTastingShare,
  getTastingShares,
  createComment,
  getComments,
  likeComment,
  unlikeComment,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  createTastingGroup,
  joinTastingGroup,
  leaveTastingGroup,
  inviteToGroup,
  getGroupMembers,
  shareToSocialMedia,
  getSocialFeed,
  getUserActivity
} from '@/services/social-service'
import { createUser, createTasting, createReview } from '@/test-utils/factories'
// import { mockSupabaseResponse } from '@/test-utils/test-utils'


// Local helper to mock Supabase responses
const mockSupabaseResponse = (data: any, error?: any) => ({ data, error })

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    }))
  }
}))

describe('SocialService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Tasting Sharing', () => {
    describe('createTastingShare', () => {
      it('should create a public share link', async () => {
        const shareData = {
          tastingId: 'tasting-123',
          shareType: 'public' as const,
          expiresAt: '2024-12-31T00:00:00Z'
        }

        const mockCreatedShare = {
          id: 'share-123',
          tasting_id: 'tasting-123',
          share_type: 'public',
          share_token: 'abc123token',
          expires_at: '2024-12-31T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedShare))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await createTastingShare(shareData, 'user-123')

        expect(result).toHaveProperty('id', 'share-123')
        expect(result).toHaveProperty('share_token', 'abc123token')
        expect(result.share_type).toBe('public')
      })

      it('should create a private share with specific users', async () => {
        const shareData = {
          tastingId: 'tasting-123',
          shareType: 'private' as const,
          allowedUsers: ['user-456', 'user-789']
        }

        const mockCreatedShare = {
          id: 'share-456',
          tasting_id: 'tasting-123',
          share_type: 'private',
          allowed_users: ['user-456', 'user-789'],
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedShare))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await createTastingShare(shareData, 'user-123')

        expect(result.share_type).toBe('private')
        expect(result.allowed_users).toEqual(['user-456', 'user-789'])
      })
    })

    describe('getTastingShares', () => {
      it('should retrieve shares for a tasting', async () => {
        const mockShares = [
          {
            id: 'share-1',
            tasting_id: 'tasting-123',
            share_type: 'public',
            share_token: 'token1',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'share-2',
            tasting_id: 'tasting-123',
            share_type: 'private',
            allowed_users: ['user-456'],
            created_at: '2024-01-02T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockShares))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getTastingShares('tasting-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(2)
        expect(result[0]).toHaveProperty('share_token')
        expect(result[1]).toHaveProperty('allowed_users')
      })
    })
  })

  describe('Comments System', () => {
    describe('createComment', () => {
      it('should create a comment on a tasting', async () => {
        const commentData = {
          tastingId: 'tasting-123',
          content: 'Great tasting session!',
          parentId: null
        }

        const mockCreatedComment = {
          id: 'comment-123',
          tasting_id: 'tasting-123',
          user_id: 'user-456',
          content: 'Great tasting session!',
          parent_id: null,
          likes_count: 0,
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedComment))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await createComment(commentData, 'user-456')

        expect(result).toHaveProperty('id', 'comment-123')
        expect(result.content).toBe('Great tasting session!')
        expect(result.likes_count).toBe(0)
      })

      it('should create a reply to a comment', async () => {
        const replyData = {
          tastingId: 'tasting-123',
          content: 'I agree!',
          parentId: 'comment-123'
        }

        const mockCreatedReply = {
          id: 'reply-456',
          tasting_id: 'tasting-123',
          user_id: 'user-789',
          content: 'I agree!',
          parent_id: 'comment-123',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedReply))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await createComment(replyData, 'user-789')

        expect(result.parent_id).toBe('comment-123')
        expect(result.content).toBe('I agree!')
      })
    })

    describe('getComments', () => {
      it('should retrieve comments for a tasting', async () => {
        const mockComments = [
          {
            id: 'comment-1',
            tasting_id: 'tasting-123',
            user_id: 'user-456',
            content: 'Great tasting!',
            likes_count: 5,
            created_at: '2024-01-01T00:00:00Z',
            user: { name: 'John Doe', avatar: 'avatar.jpg' },
            replies: [
              {
                id: 'reply-1',
                content: 'Agreed!',
                user: { name: 'Jane Smith' }
              }
            ]
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockComments))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getComments('tasting-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(1)
        expect(result[0]).toHaveProperty('user')
        expect(result[0]).toHaveProperty('replies')
        expect(result[0].replies).toHaveLength(1)
      })
    })

    describe('likeComment / unlikeComment', () => {
      it('should like a comment', async () => {
        const mockLike = {
          id: 'like-123',
          comment_id: 'comment-456',
          user_id: 'user-789',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockLike))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await likeComment('comment-456', 'user-789')

        expect(result).toHaveProperty('id', 'like-123')
        expect(result.comment_id).toBe('comment-456')
      })

      it('should unlike a comment', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        await expect(unlikeComment('comment-456', 'user-789')).resolves.toBeUndefined()
      })
    })
  })

  describe('User Following System', () => {
    describe('followUser / unfollowUser', () => {
      it('should follow a user', async () => {
        const mockFollow = {
          id: 'follow-123',
          follower_id: 'user-456',
          following_id: 'user-789',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockFollow))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await followUser('user-789', 'user-456')

        expect(result.follower_id).toBe('user-456')
        expect(result.following_id).toBe('user-789')
      })

      it('should unfollow a user', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        await expect(unfollowUser('user-789', 'user-456')).resolves.toBeUndefined()
      })

      it('should prevent self-following', async () => {
        await expect(followUser('user-123', 'user-123')).rejects.toThrow('Cannot follow yourself')
      })
    })

    describe('getFollowers / getFollowing', () => {
      it('should get user followers', async () => {
        const mockFollowers = [
          {
            id: 'follow-1',
            follower: {
              id: 'user-456',
              name: 'Follower User',
              avatar: 'avatar.jpg'
            },
            created_at: '2024-01-01T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockFollowers))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getFollowers('user-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(1)
        expect(result[0]).toHaveProperty('follower')
      })

      it('should get users being followed', async () => {
        const mockFollowing = [
          {
            id: 'follow-1',
            following: {
              id: 'user-789',
              name: 'Following User',
              avatar: 'avatar.jpg'
            },
            created_at: '2024-01-01T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockFollowing))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getFollowing('user-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result[0]).toHaveProperty('following')
      })
    })
  })

  describe('Tasting Groups', () => {
    describe('createTastingGroup', () => {
      it('should create a tasting group', async () => {
        const groupData = {
          name: 'Premium Tequila Tasters',
          description: 'Group for premium tequila enthusiasts',
          isPrivate: false,
          maxMembers: 50
        }

        const mockCreatedGroup = {
          id: 'group-123',
          name: 'Premium Tequila Tasters',
          description: 'Group for premium tequila enthusiasts',
          is_private: false,
          max_members: 50,
          created_by: 'user-456',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedGroup))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await createTastingGroup(groupData, 'user-456')

        expect(result).toHaveProperty('id', 'group-123')
        expect(result.name).toBe('Premium Tequila Tasters')
        expect(result.created_by).toBe('user-456')
      })
    })

    describe('joinTastingGroup / leaveTastingGroup', () => {
      it('should join a tasting group', async () => {
        const mockMembership = {
          id: 'membership-123',
          group_id: 'group-456',
          user_id: 'user-789',
          role: 'member',
          joined_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockMembership))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await joinTastingGroup('group-456', 'user-789')

        expect(result.group_id).toBe('group-456')
        expect(result.user_id).toBe('user-789')
        expect(result.role).toBe('member')
      })

      it('should leave a tasting group', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        await expect(leaveTastingGroup('group-456', 'user-789')).resolves.toBeUndefined()
      })
    })

    describe('inviteToGroup', () => {
      it('should send group invitation', async () => {
        const invitationData = {
          groupId: 'group-123',
          inviteeEmail: 'newuser@example.com',
          message: 'Join our tasting group!'
        }

        const mockInvitation = {
          id: 'invitation-123',
          group_id: 'group-123',
          invitee_email: 'newuser@example.com',
          message: 'Join our tasting group!',
          invited_by: 'user-456',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockInvitation))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await inviteToGroup(invitationData, 'user-456')

        expect(result.invitee_email).toBe('newuser@example.com')
        expect(result.status).toBe('pending')
      })
    })

    describe('getGroupMembers', () => {
      it('should retrieve group members', async () => {
        const mockMembers = [
          {
            id: 'member-1',
            user: {
              id: 'user-456',
              name: 'John Doe',
              avatar: 'avatar.jpg'
            },
            role: 'admin',
            joined_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'member-2',
            user: {
              id: 'user-789',
              name: 'Jane Smith',
              avatar: 'avatar.jpg'
            },
            role: 'member',
            joined_at: '2024-01-02T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockMembers))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getGroupMembers('group-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(2)
        expect(result[0]).toHaveProperty('user')
        expect(result[0]).toHaveProperty('role')
      })
    })
  })

  describe('Social Media Integration', () => {
    describe('shareToSocialMedia', () => {
      it('should share tasting to Twitter', async () => {
        const shareData = {
          tastingId: 'tasting-123',
          platform: 'twitter' as const,
          message: 'Check out this amazing tequila tasting!'
        }

        const mockShare = {
          id: 'social-share-123',
          tasting_id: 'tasting-123',
          platform: 'twitter',
          message: 'Check out this amazing tequila tasting!',
          share_url: 'https://twitter.com/status/123',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockShare))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await shareToSocialMedia(shareData, 'user-456')

        expect(result.platform).toBe('twitter')
        expect(result).toHaveProperty('share_url')
      })

      it('should share tasting to Facebook', async () => {
        const shareData = {
          tastingId: 'tasting-123',
          platform: 'facebook' as const,
          message: 'Amazing tequila tasting experience!'
        }

        const mockShare = {
          id: 'social-share-456',
          tasting_id: 'tasting-123',
          platform: 'facebook',
          message: 'Amazing tequila tasting experience!',
          share_url: 'https://facebook.com/posts/456',
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockShare))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await shareToSocialMedia(shareData, 'user-456')

        expect(result.platform).toBe('facebook')
        expect(result.share_url).toContain('facebook.com')
      })
    })
  })

  describe('Social Feed', () => {
    describe('getSocialFeed', () => {
      it('should retrieve social feed for user', async () => {
        const mockFeed = [
          {
            id: 'activity-1',
            type: 'tasting_completed',
            user_id: 'user-456',
            tasting_id: 'tasting-123',
            message: 'completed a tequila tasting',
            created_at: '2024-01-01T00:00:00Z',
            user: { name: 'John Doe', avatar: 'avatar.jpg' },
            tasting: { name: 'Premium Tequila Tasting' }
          },
          {
            id: 'activity-2',
            type: 'comment_added',
            user_id: 'user-789',
            tasting_id: 'tasting-123',
            message: 'commented on a tasting',
            created_at: '2024-01-02T00:00:00Z',
            user: { name: 'Jane Smith', avatar: 'avatar.jpg' }
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockFeed))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getSocialFeed('user-123')

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(2)
        expect(result[0]).toHaveProperty('type')
        expect(result[0]).toHaveProperty('user')
        expect(result[0].type).toBe('tasting_completed')
      })

      it('should filter feed by activity type', async () => {
        const mockFilteredFeed = [
          {
            id: 'activity-1',
            type: 'group_joined',
            user_id: 'user-456',
            message: 'joined a tasting group',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockFilteredFeed))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getSocialFeed('user-123', { type: 'group_joined' })

        expect(result.length).toBe(1)
        expect(result[0].type).toBe('group_joined')
      })
    })

    describe('getUserActivity', () => {
      it('should retrieve user activity history', async () => {
        const mockActivity = [
          {
            id: 'activity-1',
            type: 'tasting_created',
            tasting_id: 'tasting-123',
            message: 'created a new tasting',
            created_at: '2024-01-01T10:00:00Z'
          },
          {
            id: 'activity-2',
            type: 'tasting_shared',
            tasting_id: 'tasting-123',
            message: 'shared a tasting publicly',
            created_at: '2024-01-01T11:00:00Z'
          },
          {
            id: 'activity-3',
            type: 'comment_added',
            tasting_id: 'tasting-456',
            message: 'added a comment',
            created_at: '2024-01-01T12:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockActivity))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getUserActivity('user-123', { limit: 10 })

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(3)
        expect(result[0].type).toBe('tasting_created')
        expect(result[1].type).toBe('tasting_shared')
        expect(result[2].type).toBe('comment_added')
      })

      it('should filter activity by date range', async () => {
        const mockActivity = [
          {
            id: 'activity-1',
            type: 'tasting_completed',
            created_at: '2024-01-15T00:00:00Z'
          }
        ]

        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockActivity))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await getUserActivity('user-123', {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })

        expect(result.length).toBe(1)
        expect(mockQuery.gte).toHaveBeenCalledWith('created_at', '2024-01-01')
        expect(mockQuery.lte).toHaveBeenCalledWith('created_at', '2024-01-31')
      })
    })
  })
})
