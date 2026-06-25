import { User } from '@prisma/client';

export class EmailTemplates {
  private static readonly colors = {
    bgMain: '#0D0B12',
    bgCard: '#181523',
    textLight: '#F7F5F2',
    textMuted: '#A3A0AB',
    gold: '#dca550',
    burgundy: '#800020',
    border: '#2A253A',
  };

  private static getBaseLayout(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${this.colors.bgMain}; color: ${this.colors.textLight};">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${this.colors.bgCard}; border: 1px solid ${this.colors.border}; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
          <!-- Header -->
          <div style="background-color: ${this.colors.bgMain}; padding: 32px; text-align: center; border-bottom: 1px solid ${this.colors.border};">
            <h1 style="margin: 0; color: ${this.colors.textLight}; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">
              NUKKAD <span style="color: ${this.colors.gold};">BEATS</span>
            </h1>
            <p style="margin: 8px 0 0 0; color: ${this.colors.textMuted}; font-size: 14px;">Sing. Sip. Celebrate.</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: ${this.colors.bgMain}; padding: 32px; text-align: center; border-top: 1px solid ${this.colors.border};">
            <p style="margin: 0; color: ${this.colors.textMuted}; font-size: 14px;">Need help? Contact us at support@nukkadbeats.com</p>
            <p style="margin: 16px 0 0 0; color: ${this.colors.textMuted}; font-size: 12px;">&copy; ${new Date().getFullYear()} Nukkad Beats. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getBookingConfirmation(user: Partial<User>, booking: any, qrCodeDataUrl: string): string {
    const content = `
      <h2 style="margin: 0 0 24px 0; color: ${this.colors.gold}; font-size: 24px;">Booking Confirmed! 🎤</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">Your studio booking is successfully confirmed. Please find your booking receipt and check-in QR code below.</p>
      
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; border-bottom: 1px solid ${this.colors.border}; padding-bottom: 12px;">Booking Details</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Reference ID</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Studio</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.studio?.name || 'Standard Studio'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date(booking.bookingDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.startTime} - ${booking.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Guests</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.guestCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px; border-top: 1px dashed ${this.colors.border};">Total Amount</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${this.colors.gold}; border-top: 1px dashed ${this.colors.border};">₹${booking.totalAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Payment Method</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Payment Status</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${booking.paymentStatus}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <p style="color: ${this.colors.textMuted}; font-size: 14px; margin-bottom: 16px;">Show this QR code at the front desk for quick check-in.</p>
        <div style="background-color: white; display: inline-block; padding: 16px; border-radius: 12px;">
          <img src="${qrCodeDataUrl}" alt="Check-in QR Code" style="display: block; width: 150px; height: 150px;" />
        </div>
      </div>
    `;
    return this.getBaseLayout('Booking Confirmation', content);
  }

  static getOrderConfirmation(user: Partial<User>, order: any): string {
    const itemsHtml = order.items?.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${this.colors.border};">
          <div style="font-weight: 600;">${item.product?.name || 'Product'}</div>
          <div style="font-size: 12px; color: ${this.colors.textMuted};">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid ${this.colors.border}; font-weight: 600;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `).join('') || '';

    const content = `
      <h2 style="margin: 0 0 24px 0; color: ${this.colors.gold}; font-size: 24px;">Order Confirmed! 🍔</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">We've received your café order and our chefs are getting ready to prepare it. Here's a summary of your order:</p>
      
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid ${this.colors.border}; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <span style="color: ${this.colors.textMuted}; font-size: 12px; display: block;">Order ID</span>
            <span style="font-weight: 600; font-size: 14px;">${order.orderReference}</span>
          </div>
          <div style="text-align: right;">
            <span style="color: ${this.colors.textMuted}; font-size: 12px; display: block;">Date</span>
            <span style="font-weight: 600; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px 0 8px 0; font-size: 16px; font-weight: 600;">Total Amount</td>
            <td style="padding: 16px 0 8px 0; text-align: right; font-weight: 600; color: ${this.colors.gold}; font-size: 18px;">₹${order.totalAmount}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 14px; color: ${this.colors.textMuted}; text-align: center;">We will notify you when your order is ready!</p>
    `;
    return this.getBaseLayout('Order Confirmation', content);
  }

  static getOrderStatus(user: Partial<User>, order: any, status: string): string {
    const statusMessages: Record<string, { title: string, text: string }> = {
      'PREPARING': { title: 'Order is being prepared 👨‍🍳', text: 'Our chefs have started preparing your order. It will be ready soon!' },
      'READY': { title: 'Order is Ready! 🍽️', text: 'Your order is hot and ready for pickup/delivery.' },
      'DELIVERED': { title: 'Order Delivered ✅', text: 'We hope you enjoyed your food. Thanks for ordering with NUKKAD BEATS!' },
      'CANCELLED': { title: 'Order Cancelled ❌', text: 'Your order has been cancelled. If a payment was made, it will be refunded shortly.' },
    };

    const msg = statusMessages[status] || { title: `Order Update: ${status}`, text: `The status of your order has been updated to ${status}.` };

    const content = `
      <h2 style="margin: 0 0 24px 0; color: ${this.colors.gold}; font-size: 24px;">${msg.title}</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">${msg.text}</p>
      
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 16px;">
        <p style="margin: 0; font-size: 14px;"><span style="color: ${this.colors.textMuted};">Order Ref:</span> <strong>${order.orderReference}</strong></p>
      </div>
    `;
    return this.getBaseLayout('Order Status Update', content);
  }

  static getPaymentSuccess(user: Partial<User>, amount: number, transactionId: string, serviceName: string): string {
    const content = `
      <h2 style="margin: 0 0 24px 0; color: #10b981; font-size: 24px;">Payment Successful ✅</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">We have successfully received your payment for <strong>${serviceName}</strong>.</p>
      
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Amount Paid</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${this.colors.gold}; font-size: 18px;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Transaction ID</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;
    return this.getBaseLayout('Payment Receipt', content);
  }

  static getWelcome(user: Partial<User>): string {
    const content = `
      <h2 style="margin: 0 0 24px 0; color: ${this.colors.gold}; font-size: 24px;">Welcome to NUKKAD BEATS! 🎉</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">We are thrilled to have you join our community. Whether you're here to lay down some tracks in our state-of-the-art studios, or just want to grab a bite from our café, you're in for a treat.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/studios" style="display: inline-block; background-color: ${this.colors.gold}; color: ${this.colors.bgMain}; text-decoration: none; font-weight: 600; padding: 12px 32px; border-radius: 8px; font-size: 16px; margin: 0 8px 16px 8px;">Explore Studios</a>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cafe" style="display: inline-block; background-color: transparent; border: 1px solid ${this.colors.gold}; color: ${this.colors.gold}; text-decoration: none; font-weight: 600; padding: 12px 32px; border-radius: 8px; font-size: 16px; margin: 0 8px 16px 8px;">Order Food</a>
      </div>
    `;
    return this.getBaseLayout('Welcome to Nukkad Beats', content);
  }

  static getPasswordResetOTP(user: Partial<User>, otp: string): string {
    const content = `
      <h2 style="margin: 0 0 24px 0; color: ${this.colors.gold}; font-size: 24px;">Password Reset Code</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">We received a request to reset your password. Use the following verification code to continue. This code expires in 10 minutes.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <div style="display: inline-block; background-color: ${this.colors.bgMain}; border: 2px dashed ${this.colors.gold}; color: ${this.colors.gold}; text-decoration: none; font-weight: 700; padding: 16px 40px; border-radius: 8px; font-size: 32px; letter-spacing: 8px;">
          ${otp}
        </div>
      </div>
      
      <p style="font-size: 14px; color: ${this.colors.textMuted}; margin-top: 32px;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
    `;
    return this.getBaseLayout('Reset Your Password', content);
  }

  static getPasswordResetConfirmation(user: Partial<User>): string {
    const content = `
      <h2 style="margin: 0 0 24px 0; color: #10b981; font-size: 24px;">Password Changed Successfully</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Hi ${user.fullName},</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">Your password was successfully changed. You can now log in using your new password.</p>
      
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 16px;">
        <p style="margin: 0; font-size: 14px; color: ${this.colors.textMuted}; text-align: center;">If this wasn't you, please contact support immediately.</p>
      </div>
    `;
    return this.getBaseLayout('Your Password Has Been Changed', content);
  }

  static getAdminNotification(title: string, details: Record<string, any>): string {
    const detailsHtml = Object.entries(details).map(([key, value]) => `
      <tr>
        <td style="padding: 8px 0; color: ${this.colors.textMuted}; font-size: 14px;">${key}</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600;">${value}</td>
      </tr>
    `).join('');

    const content = `
      <h2 style="margin: 0 0 24px 0; color: #dc3545; font-size: 24px;">System Alert: ${title}</h2>
      <div style="background-color: ${this.colors.bgMain}; border: 1px solid ${this.colors.border}; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsHtml}
        </table>
      </div>
      <p style="font-size: 14px; color: ${this.colors.textMuted};">Login to the Admin Dashboard to take action.</p>
    `;
    return this.getBaseLayout(`Admin Alert: ${title}`, content);
  }
}
