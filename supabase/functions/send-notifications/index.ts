// Supabase Edge Function: Send Notifications
// This function handles push notifications and email notifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  user_id?: string
  user_ids?: string[]
  type: 'push' | 'email' | 'both'
  notification_type: string
  title: string
  body: string
  data?: any
  schedule_for?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const notificationRequest: NotificationRequest = await req.json()

    // Validate request
    if (!notificationRequest.title || !notificationRequest.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine target users
    const targetUserIds = notificationRequest.user_ids || 
      (notificationRequest.user_id ? [notificationRequest.user_id] : [])

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No target users specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    // Process notifications for each user
    for (const userId of targetUserIds) {
      try {
        // Get user preferences
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('preferences, email, name')
          .eq('id', userId)
          .single()

        if (!profile) {
          console.warn(`Profile not found for user ${userId}`)
          continue
        }

        // Check if user wants this type of notification
        if (!shouldSendNotification(notificationRequest.notification_type, profile.preferences)) {
          console.log(`User ${userId} has disabled ${notificationRequest.notification_type} notifications`)
          continue
        }

        let pushResult = null
        let emailResult = null

        // Send push notification
        if (notificationRequest.type === 'push' || notificationRequest.type === 'both') {
          pushResult = await sendPushNotification(userId, notificationRequest, supabaseClient)
        }

        // Send email notification
        if (notificationRequest.type === 'email' || notificationRequest.type === 'both') {
          emailResult = await sendEmailNotification(profile, notificationRequest)
        }

        // Log notification
        await logNotification(userId, notificationRequest, supabaseClient)

        results.push({
          user_id: userId,
          push_result: pushResult,
          email_result: emailResult,
          success: true
        })

      } catch (userError) {
        console.error(`Error sending notification to user ${userId}:`, userError)
        results.push({
          user_id: userId,
          success: false,
          error: userError.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        total_sent: results.filter(r => r.success).length,
        total_failed: results.filter(r => !r.success).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function shouldSendNotification(notificationType: string, preferences: any): boolean {
  if (!preferences?.notifications) return true

  const notificationSettings = preferences.notifications

  switch (notificationType) {
    case 'friend_request':
      return notificationSettings.socialActivity !== false
    case 'tasting_invitation':
      return notificationSettings.tastingReminders !== false
    case 'achievement_earned':
      return notificationSettings.achievements !== false
    case 'daily_challenge':
      return notificationSettings.challenges !== false
    case 'weekly_digest':
      return notificationSettings.weeklyDigest !== false
    default:
      return true
  }
}

async function sendPushNotification(userId: string, notification: NotificationRequest, supabaseClient: any) {
  try {
    // Get user's push subscriptions
    const { data: subscriptions } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)

    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, reason: 'No active push subscriptions' }
    }

    const pushResults = []

    // Send to each subscription
    for (const subscription of subscriptions) {
      try {
        const pushPayload = {
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            url: getNotificationUrl(notification.notification_type, notification.data),
            ...notification.data
          },
          actions: getNotificationActions(notification.notification_type)
        }

        // Use Web Push API
        const response = await sendWebPush(subscription.subscription_data, pushPayload)
        
        pushResults.push({
          subscription_id: subscription.id,
          success: response.success,
          error: response.error
        })

        // Update subscription status if failed
        if (!response.success && response.error?.includes('410')) {
          await supabaseClient
            .from('push_subscriptions')
            .update({ active: false })
            .eq('id', subscription.id)
        }

      } catch (subError) {
        console.error(`Error sending to subscription ${subscription.id}:`, subError)
        pushResults.push({
          subscription_id: subscription.id,
          success: false,
          error: subError.message
        })
      }
    }

    return {
      success: pushResults.some(r => r.success),
      results: pushResults,
      total_subscriptions: subscriptions.length
    }

  } catch (error) {
    console.error('Error in sendPushNotification:', error)
    return { success: false, error: error.message }
  }
}

async function sendWebPush(subscription: any, payload: any) {
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      throw new Error('VAPID keys not configured')
    }

    // This is a simplified version - in production you'd use a proper Web Push library
    // For now, we'll simulate the push notification
    console.log('Sending push notification:', payload)
    
    return { success: true }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function sendEmailNotification(profile: any, notification: NotificationRequest) {
  try {
    const emailTemplate = getEmailTemplate(notification.notification_type, notification, profile)
    
    // This would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll simulate the email sending
    console.log('Sending email to:', profile.email)
    console.log('Email template:', emailTemplate)

    return { success: true, email: profile.email }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

function getEmailTemplate(notificationType: string, notification: NotificationRequest, profile: any) {
  const baseTemplate = {
    to: profile.email,
    from: 'noreply@flavorwheel.mx',
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B4513;">FlavorWheel México</h2>
        <h3>${notification.title}</h3>
        <p>${notification.body}</p>
        <p>¡Saludos!<br>El equipo de FlavorWheel México</p>
      </div>
    `
  }

  // Customize based on notification type
  switch (notificationType) {
    case 'friend_request':
      baseTemplate.html += `<a href="${Deno.env.get('NEXT_PUBLIC_APP_URL')}/friends" style="background: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Solicitudes</a>`
      break
    case 'tasting_invitation':
      baseTemplate.html += `<a href="${Deno.env.get('NEXT_PUBLIC_APP_URL')}/tastings/${notification.data?.tasting_id}" style="background: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Cata</a>`
      break
  }

  return baseTemplate
}

function getNotificationUrl(notificationType: string, data: any): string {
  const baseUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://flavorwheel.mx'

  switch (notificationType) {
    case 'friend_request':
      return `${baseUrl}/friends`
    case 'tasting_invitation':
      return `${baseUrl}/tastings/${data?.tasting_id}`
    case 'achievement_earned':
      return `${baseUrl}/profile/achievements`
    case 'daily_challenge':
      return `${baseUrl}/challenges`
    default:
      return baseUrl
  }
}

function getNotificationActions(notificationType: string) {
  switch (notificationType) {
    case 'friend_request':
      return [
        { action: 'accept', title: 'Aceptar' },
        { action: 'decline', title: 'Rechazar' }
      ]
    case 'tasting_invitation':
      return [
        { action: 'join', title: 'Unirse' },
        { action: 'view', title: 'Ver Detalles' }
      ]
    default:
      return [{ action: 'view', title: 'Ver' }]
  }
}

async function logNotification(userId: string, notification: NotificationRequest, supabaseClient: any) {
  try {
    await supabaseClient
      .from('notification_logs')
      .insert({
        user_id: userId,
        notification_type: notification.notification_type,
        title: notification.title,
        body: notification.body,
        delivery_method: notification.type,
        sent_at: new Date().toISOString(),
        metadata: notification.data || {}
      })
  } catch (error) {
    console.error('Error logging notification:', error)
  }
}
