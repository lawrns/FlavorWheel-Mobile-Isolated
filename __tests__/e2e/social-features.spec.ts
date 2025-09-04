import { test, expect } from '@playwright/test'

test.describe('Social Features & Community', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Mock authenticated user
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          followers: 15,
          following: 8
        }
      }))
    })
  })

  test.describe('Social Feed & Discovery', () => {
    test('should display community tasting feed', async ({ page }) => {
      await page.click('[data-testid="social-feed"], [aria-label*="Community"]')
      await page.waitForURL('**/social**')

      // Should show feed of tastings
      await expect(page.locator('[data-testid="tasting-feed"]')).toBeVisible()

      // Should show tasting cards
      const tastingCards = page.locator('[data-testid="tasting-card"]')
      await expect(tastingCards.first()).toBeVisible()

      // Each card should have user info, tasting details, and actions
      const firstCard = tastingCards.first()
      await expect(firstCard.locator('[data-testid="tasting-author"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="tasting-title"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="tasting-rating"]')).toBeVisible()
    })

    test('should handle feed pagination', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Should show initial set of posts
      const initialCards = await page.locator('[data-testid="tasting-card"]').count()
      expect(initialCards).toBeGreaterThan(0)

      // Scroll to load more
      await page.locator('[data-testid="feed-container"]').evaluate(el => el.scrollTo(0, el.scrollHeight))
      await page.waitForTimeout(2000)

      // Should load more posts
      const loadedCards = await page.locator('[data-testid="tasting-card"]').count()
      expect(loadedCards).toBeGreaterThan(initialCards)

      // Should show loading indicator during pagination
      await expect(page.locator('[data-testid="loading-more"]')).toBeVisible()
    })

    test('should filter feed by categories', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Apply whiskey filter
      await page.click('[data-testid="filter-whiskey"]')

      // Should show only whiskey tastings
      const tastingCards = page.locator('[data-testid="tasting-card"]')
      await expect(tastingCards.first()).toBeVisible()

      // Verify all visible tastings are whiskey
      const cards = await tastingCards.all()
      for (const card of cards.slice(0, 3)) { // Check first 3 cards
        await expect(card.locator('text=/whiskey|bourbon|scotch/i')).toBeVisible()
      }

      // Apply wine filter
      await page.click('[data-testid="filter-wine"]')

      // Should show only wine tastings
      await expect(page.locator('[data-testid="tasting-card"]')).toBeVisible()
    })

    test('should search community content', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Use search functionality
      await page.fill('[data-testid="search-input"]', 'premium tequila')
      await page.click('[data-testid="search-button"]')

      // Should show search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible()

      // Results should contain search term
      const results = page.locator('[data-testid="tasting-card"]')
      await expect(results.first().locator('text=/premium tequila/i')).toBeVisible()

      // Should show result count
      await expect(page.locator('[data-testid="result-count"]')).toBeVisible()
    })
  })

  test.describe('User Interactions', () => {
    test('should handle liking and unliking tastings', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      const firstCard = page.locator('[data-testid="tasting-card"]').first()
      const likeButton = firstCard.locator('[data-testid="like-button"]')

      // Get initial like count
      const initialLikes = await firstCard.locator('[data-testid="like-count"]').textContent()

      // Click like
      await likeButton.click()

      // Like count should increase
      await expect(firstCard.locator('[data-testid="like-count"]')).not.toHaveText(initialLikes || '0')

      // Button should show liked state
      await expect(likeButton).toHaveAttribute('data-liked', 'true')

      // Click again to unlike
      await likeButton.click()

      // Like count should decrease
      await expect(firstCard.locator('[data-testid="like-count"]')).toHaveText(initialLikes || '0')
    })

    test('should add and manage comments', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      const firstCard = page.locator('[data-testid="tasting-card"]').first()

      // Open comments section
      await firstCard.locator('[data-testid="comments-toggle"]').click()

      // Add a comment
      await page.fill('[data-testid="comment-input"]', 'Great tasting! I love the vanilla notes.')
      await page.click('[data-testid="submit-comment"]')

      // Comment should appear
      await expect(page.locator('text=Great tasting! I love the vanilla notes.')).toBeVisible()

      // Should show comment count
      await expect(firstCard.locator('[data-testid="comment-count"]')).toContainText('1')

      // Reply to comment
      await page.click('[data-testid="reply-button"]')
      await page.fill('[data-testid="reply-input"]', 'Thanks for the feedback!')
      await page.click('[data-testid="submit-reply"]')

      // Reply should appear
      await expect(page.locator('text=Thanks for the feedback!')).toBeVisible()
    })

    test('should share tastings across platforms', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      const firstCard = page.locator('[data-testid="tasting-card"]').first()

      // Click share button
      await firstCard.locator('[data-testid="share-button"]').click()

      // Share modal should appear
      await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()

      // Test different sharing options
      const shareOptions = [
        { button: '[data-testid="share-twitter"]', platform: 'Twitter' },
        { button: '[data-testid="share-facebook"]', platform: 'Facebook' },
        { button: '[data-testid="share-copy-link"]', platform: 'Copy Link' }
      ]

      for (const option of shareOptions) {
        const shareButton = page.locator(option.button)
        if (await shareButton.isVisible()) {
          await shareButton.click()

          // Should show success message or open share dialog
          if (option.platform === 'Copy Link') {
            await expect(page.locator('text=/copied|link copied/i')).toBeVisible()
          }
        }
      }
    })

    test('should bookmark and save tastings', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      const firstCard = page.locator('[data-testid="tasting-card"]').first()
      const bookmarkButton = firstCard.locator('[data-testid="bookmark-button"]')

      // Click bookmark
      await bookmarkButton.click()

      // Should show bookmarked state
      await expect(bookmarkButton).toHaveAttribute('data-bookmarked', 'true')

      // Navigate to bookmarks/saved section
      await page.click('[data-testid="saved-tastings"]')
      await page.waitForURL('**/saved**')

      // Bookmarked tasting should appear
      await expect(page.locator('[data-testid="saved-tasting-card"]')).toBeVisible()

      // Remove bookmark
      await page.locator('[data-testid="remove-bookmark"]').click()

      // Should no longer appear in saved
      await expect(page.locator('[data-testid="saved-tasting-card"]')).not.toBeVisible()
    })
  })

  test.describe('User Profiles & Following', () => {
    test('should view and interact with user profiles', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      // Click on a user's profile
      await page.locator('[data-testid="tasting-author"]').first().click()
      await page.waitForURL('**/profile/**')

      // Should show user profile
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-stats"]')).toBeVisible()

      // Should show user's tastings
      await expect(page.locator('[data-testid="user-tastings"]')).toBeVisible()

      // Test follow/unfollow
      const followButton = page.locator('[data-testid="follow-button"]')
      const initialText = await followButton.textContent()

      await followButton.click()

      // Button text should change
      await expect(followButton).not.toHaveText(initialText || '')

      // Follower count should update
      const followerCount = page.locator('[data-testid="follower-count"]')
      const initialCount = await followerCount.textContent()
      await expect(followerCount).not.toHaveText(initialCount || '0')
    })

    test('should display follower/following lists', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.waitForURL('**/profile**')

      // View followers
      await page.click('[data-testid="followers-tab"]')

      // Should show follower list
      await expect(page.locator('[data-testid="follower-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="follower-item"]').first()).toBeVisible()

      // View following
      await page.click('[data-testid="following-tab"]')

      // Should show following list
      await expect(page.locator('[data-testid="following-list"]')).toBeVisible()
      await expect(page.locator('[data-testid="following-item"]').first()).toBeVisible()

      // Test unfollowing someone
      const firstFollowing = page.locator('[data-testid="following-item"]').first()
      await firstFollowing.locator('[data-testid="unfollow-button"]').click()

      // Should show confirmation
      await expect(page.locator('text=/unfollowed|removed/i')).toBeVisible()
    })

    test('should show user activity feed', async ({ page }) => {
      // Visit another user's profile
      await page.goto('/en/profile/user-123')
      await page.waitForSelector('[data-testid="user-profile"]')

      // Should show activity feed
      await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible()

      // Should show recent activities
      const activities = page.locator('[data-testid="activity-item"]')
      await expect(activities.first()).toBeVisible()

      // Activities should include tastings, follows, comments, etc.
      const activityTypes = ['tasting', 'follow', 'comment', 'like']
      let foundActivity = false

      for (const type of activityTypes) {
        if (await page.locator(`[data-testid="activity-${type}"]`).isVisible()) {
          foundActivity = true
          break
        }
      }

      expect(foundActivity).toBe(true)
    })
  })

  test.describe('Community Features', () => {
    test('should create and manage tasting groups', async ({ page }) => {
      await page.click('[data-testid="groups-section"]')
      await page.waitForURL('**/groups**')

      // Create new group
      await page.click('[data-testid="create-group-button"]')

      await page.fill('[data-testid="group-name"]', 'Whiskey Enthusiasts')
      await page.fill('[data-testid="group-description"]', 'A group for whiskey lovers')
      await page.selectOption('[data-testid="group-privacy"]', 'public')

      await page.click('[data-testid="create-group-submit"]')

      // Should show created group
      await expect(page.locator('text=Whiskey Enthusiasts')).toBeVisible()

      // Invite members
      await page.click('[data-testid="invite-members"]')
      await page.fill('[data-testid="invite-email"]', 'friend@example.com')
      await page.click('[data-testid="send-invite"]')

      // Should show pending invitation
      await expect(page.locator('text=/invited|pending/i')).toBeVisible()
    })

    test('should participate in group tastings', async ({ page }) => {
      // Join a group
      await page.goto('/en/groups/whiskey-enthusiasts')
      await page.click('[data-testid="join-group"]')

      // Should show group content
      await expect(page.locator('[data-testid="group-feed"]')).toBeVisible()

      // Participate in group tasting
      await page.click('[data-testid="group-tasting-event"]')
      await page.click('[data-testid="join-tasting-event"]')

      // Should show tasting interface
      await expect(page.locator('[data-testid="group-tasting-interface"]')).toBeVisible()

      // Complete group tasting
      await page.fill('[data-testid="tasting-notes"]', 'Group tasting notes')
      await page.click('[data-testid="submit-group-tasting"]')

      // Should show group results
      await expect(page.locator('[data-testid="group-results"]')).toBeVisible()
    })

    test('should handle notifications and messaging', async ({ page }) => {
      // Check notifications
      await page.click('[data-testid="notifications-bell"]')

      // Should show notification dropdown
      await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible()

      // Mark notification as read
      await page.locator('[data-testid="notification-item"]').first().click()

      // Should mark as read
      await expect(page.locator('[data-testid="notification-unread"]')).not.toBeVisible()

      // Send direct message
      await page.click('[data-testid="messages"]')
      await page.click('[data-testid="new-message"]')

      await page.fill('[data-testid="recipient-select"]', 'user123')
      await page.fill('[data-testid="message-content"]', 'Hey, great tasting review!')
      await page.click('[data-testid="send-message"]')

      // Should show sent message
      await expect(page.locator('text=Hey, great tasting review!')).toBeVisible()
    })

    test('should moderate community content', async ({ page }) => {
      // Assume user has moderator privileges
      await page.evaluate(() => {
        localStorage.setItem('user-role', 'moderator')
      })

      await page.goto('/en/moderate')
      await page.waitForSelector('[data-testid="moderation-queue"]')

      // Should show content to moderate
      await expect(page.locator('[data-testid="moderation-item"]').first()).toBeVisible()

      // Approve content
      await page.click('[data-testid="approve-button"]')

      // Should remove from queue
      await expect(page.locator('[data-testid="moderation-item"]')).toHaveCount(0)

      // Test reporting content
      await page.goto('/en/social')
      await page.locator('[data-testid="report-button"]').first().click()

      await page.selectOption('[data-testid="report-reason"]', 'inappropriate')
      await page.fill('[data-testid="report-details"]', 'Inappropriate content')
      await page.click('[data-testid="submit-report"]')

      // Should show report submitted
      await expect(page.locator('text=/reported|submitted/i')).toBeVisible()
    })
  })

  test.describe('Social Analytics & Insights', () => {
    test('should display user engagement metrics', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.click('[data-testid="analytics-tab"]')

      // Should show engagement metrics
      await expect(page.locator('[data-testid="engagement-metrics"]')).toBeVisible()

      // Should show likes received
      await expect(page.locator('[data-testid="likes-received"]')).toBeVisible()

      // Should show comments received
      await expect(page.locator('[data-testid="comments-received"]')).toBeVisible()

      // Should show shares count
      await expect(page.locator('[data-testid="shares-count"]')).toBeVisible()

      // Should show follower growth
      await expect(page.locator('[data-testid="follower-growth"]')).toBeVisible()
    })

    test('should show tasting popularity insights', async ({ page }) => {
      await page.goto('/en/tastings/my-tasting-123/analytics')

      // Should show tasting analytics
      await expect(page.locator('[data-testid="tasting-analytics"]')).toBeVisible()

      // Should show view count
      await expect(page.locator('[data-testid="view-count"]')).toBeVisible()

      // Should show engagement rate
      await expect(page.locator('[data-testid="engagement-rate"]')).toBeVisible()

      // Should show geographic distribution
      await expect(page.locator('[data-testid="geographic-distribution"]')).toBeVisible()
    })

    test('should provide community trend analysis', async ({ page }) => {
      await page.click('[data-testid="trends"]')
      await page.waitForURL('**/trends**')

      // Should show trending tastings
      await expect(page.locator('[data-testid="trending-tastings"]')).toBeVisible()

      // Should show popular beverages
      await expect(page.locator('[data-testid="popular-beverages"]')).toBeVisible()

      // Should show trending flavors
      await expect(page.locator('[data-testid="trending-flavors"]')).toBeVisible()

      // Should show community activity
      await expect(page.locator('[data-testid="activity-heatmap"]')).toBeVisible()
    })
  })

  test.describe('Privacy & Safety', () => {
    test('should manage privacy settings', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.click('[data-testid="settings"]')
      await page.click('[data-testid="privacy-tab"]')

      // Toggle profile visibility
      await page.click('[data-testid="profile-visibility-toggle"]')

      // Should show confirmation
      await expect(page.locator('text=/visibility updated|privacy changed/i')).toBeVisible()

      // Manage blocked users
      await page.click('[data-testid="blocked-users"]')
      await expect(page.locator('[data-testid="blocked-list"]')).toBeVisible()

      // Block a user
      await page.click('[data-testid="block-user-button"]')
      await page.fill('[data-testid="block-username"]', 'spammer123')
      await page.click('[data-testid="confirm-block"]')

      // Should show blocked user
      await expect(page.locator('text=spammer123')).toBeVisible()
    })

    test('should handle content reporting', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')

      // Find inappropriate content
      const tastingCard = page.locator('[data-testid="tasting-card"]').first()
      await tastingCard.locator('[data-testid="report-button"]').click()

      // Select report reason
      await page.selectOption('[data-testid="report-reason"]', 'harassment')

      // Add details
      await page.fill('[data-testid="report-description"]', 'Harassing comments in the tasting')

      // Submit report
      await page.click('[data-testid="submit-report"]')

      // Should show success message
      await expect(page.locator('text=/reported|submitted/i')).toBeVisible()

      // Content should be hidden or flagged
      await expect(tastingCard.locator('[data-testid="content-flagged"]')).toBeVisible()
    })

    test('should manage notification preferences', async ({ page }) => {
      await page.click('[data-testid="settings"]')
      await page.click('[data-testid="notifications-tab"]')

      // Manage different notification types
      const notificationTypes = [
        'likes',
        'comments',
        'follows',
        'group-invites',
        'tasting-events'
      ]

      for (const type of notificationTypes) {
        const toggle = page.locator(`[data-testid="${type}-notifications"]`)
        if (await toggle.isVisible()) {
          await toggle.click()
        }
      }

      // Save preferences
      await page.click('[data-testid="save-preferences"]')

      // Should show success
      await expect(page.locator('text=/saved|updated/i')).toBeVisible()
    })
  })
})
