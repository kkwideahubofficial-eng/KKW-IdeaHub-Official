import express from 'express';
import webpush from '../config/webPush.js';
import PushSubscription from '../models/PushSubscription.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// Subscribe route - Saves subscription to MongoDB
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user._id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    // Upsert the subscription (update if endpoint exists, otherwise insert)
    // We treat 'endpoint' as unique per device.
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      { 
        user: userId,
        subscription: subscription 
      },
      { upsert: true, new: true }
    );

    console.log(`Subscription saved for user ${userId}`);
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
});

// Test route - Sends to ALL subscriptions for the logged-in user (or specific logic)
router.post('/send-test', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found for this user.' });
    }

    const notificationPayload = JSON.stringify({
      title: 'IdeaHub Test',
      body: `Hello ${req.user.name || 'User'}, this is a test notification!`,
      icon: '/icons/icon-192.png',
    });

    const promises = subscriptions.map((subDoc) =>
      webpush.sendNotification(subDoc.subscription, notificationPayload).catch(async (err) => {
        console.error('Error sending notification, removing subscription', err.statusCode);
        if (err.statusCode === 410 || err.statusCode === 404) {
             // Subscription is gone (expired or unsubscribed), delete from DB
             await PushSubscription.deleteOne({ _id: subDoc._id });
        }
      })
    );

    await Promise.all(promises);
    res.status(200).json({ message: `Sent to ${subscriptions.length} devices.` });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

export default router;
