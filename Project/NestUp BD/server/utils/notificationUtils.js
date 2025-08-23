// notificationUtils.js - Utility functions for sending notifications

import User from '../models/User.js';
import Service from '../models/Service.js';

/**
 * Send booking approval notification to guest
 * @param {Object} booking - The booking object
 * @param {string} approvalReason - Optional approval reason
 */
export const sendBookingApprovalNotification = async (booking, approvalReason = '') => {
  try {
    // In a real application, this would integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - Push notification service (Firebase, OneSignal, etc.)
    // - WebSocket for real-time notifications
    
    const notificationData = {
      type: 'booking_approved',
      userId: booking.user._id,
      data: {
        bookingId: booking._id,
        propertyTitle: booking.service.title,
        confirmationCode: booking.formattedConfirmationCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        approvalReason: approvalReason
      },
      timestamp: new Date()
    };
    
    // Log notification for development
    console.log('📧 Booking Approval Notification:', {
      to: booking.user.email,
      subject: 'Your booking has been approved!',
      data: notificationData
    });
    
    // TODO: Implement actual notification sending
    // await emailService.sendBookingApprovalEmail(booking.user.email, notificationData);
    // await pushNotificationService.send(booking.user._id, notificationData);
    
    return { success: true, notificationData };
  } catch (error) {
    console.error('Error sending booking approval notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking rejection notification to guest
 * @param {Object} booking - The booking object
 * @param {string} rejectionReason - Rejection reason
 */
export const sendBookingRejectionNotification = async (booking, rejectionReason) => {
  try {
    const notificationData = {
      type: 'booking_rejected',
      userId: booking.user._id,
      data: {
        bookingId: booking._id,
        propertyTitle: booking.service.title,
        confirmationCode: booking.formattedConfirmationCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        reason: rejectionReason
      },
      timestamp: new Date()
    };
    
    // Log notification for development
    console.log('📧 Booking Rejection Notification:', {
      to: booking.user.email,
      subject: 'Your booking request was not approved',
      data: notificationData
    });
    
    // TODO: Implement actual notification sending
    // await emailService.sendBookingRejectionEmail(booking.user.email, notificationData);
    // await pushNotificationService.send(booking.user._id, notificationData);
    
    return { success: true, notificationData };
  } catch (error) {
    console.error('Error sending booking rejection notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send new booking request notification to host
 * @param {Object} booking - The booking object
 */
export const sendNewBookingNotification = async (booking) => {
  try {
    const notificationData = {
      type: 'booking_pending',
      userId: booking.service.owner._id,
      data: {
        bookingId: booking._id,
        propertyTitle: booking.service.title,
        guestName: booking.user.name,
        guestEmail: booking.user.email,
        confirmationCode: booking.formattedConfirmationCode,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        numberOfGuests: booking.guestInfo.numberOfGuests
      },
      timestamp: new Date()
    };
    
    // Log notification for development
    console.log('📧 New Booking Request Notification:', {
      to: booking.service.owner.email,
      subject: 'New booking request for your property',
      data: notificationData
    });
    
    // TODO: Implement actual notification sending
    // await emailService.sendNewBookingEmail(booking.service.owner.email, notificationData);
    // await pushNotificationService.send(booking.service.owner._id, notificationData);
    
    return { success: true, notificationData };
  } catch (error) {
    console.error('Error sending new booking notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification (placeholder for actual email service)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
export const sendEmail = async (to, subject, html) => {
  try {
    // This is a placeholder for actual email service integration
    // In production, you would use services like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Mailgun
    
    console.log('📧 Email Notification:', {
      to,
      subject,
      html: html.substring(0, 100) + '...'
    });
    
    // TODO: Implement actual email sending
    // const result = await emailProvider.send({ to, subject, html });
    // return result;
    
    return { success: true, messageId: `mock-${Date.now()}` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate email templates for booking notifications
 */
export const emailTemplates = {
  bookingApproved: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 Your Booking Has Been Approved!</h2>
      <p>Great news! Your booking request for <strong>${data.propertyTitle}</strong> has been approved by the host.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
        <p><strong>Check-in:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(data.endDate).toLocaleDateString()}</p>
        ${data.approvalReason ? `<p><strong>Host Message:</strong> ${data.approvalReason}</p>` : ''}
      </div>
      
      <p>You can now proceed with your travel plans. Have a wonderful stay!</p>
      <p>Best regards,<br>The NestUp BD Team</p>
    </div>
  `,
  
  bookingRejected: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Booking Request Update</h2>
      <p>We regret to inform you that your booking request for <strong>${data.propertyTitle}</strong> was not approved.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
        <p><strong>Requested Dates:</strong> ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
      </div>
      
      <p>Don't worry! There are many other great properties available on NestUp BD. We encourage you to explore other options.</p>
      <p>Best regards,<br>The NestUp BD Team</p>
    </div>
  `,
  
  newBookingRequest: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">🏠 New Booking Request</h2>
      <p>You have received a new booking request for your property <strong>${data.propertyTitle}</strong>.</p>
      
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p><strong>Guest:</strong> ${data.guestName} (${data.guestEmail})</p>
        <p><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
        <p><strong>Check-in:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(data.endDate).toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${data.numberOfGuests}</p>
        <p><strong>Total Amount:</strong> ৳${data.totalAmount.toLocaleString()}</p>
      </div>
      
      <p>Please log in to your dashboard to review and respond to this booking request.</p>
      <p>Best regards,<br>The NestUp BD Team</p>
    </div>
  `
};