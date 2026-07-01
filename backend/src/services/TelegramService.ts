export class TelegramService {
  private static get isConfigured(): boolean {
    return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  }

  private static async sendMessage(message: string): Promise<void> {
    if (!this.isConfigured) {
      console.log('[TelegramService] Skipped: Missing Telegram configuration.');
      return;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Telegram API Error: ${JSON.stringify(data)}`);
      }

      console.log(`[TelegramService] Successfully sent message to chat ${chatId}`);
    } catch (error) {
      console.error('[TelegramService] Failed to send message:', error);
      // We purposefully do not re-throw the error so that the main transaction
      // is not blocked or rolled back if Telegram fails.
    }
  }

  static async sendStudioBookingNotification(booking: any, user: any): Promise<void> {
    const message = `🎤 *NEW STUDIO BOOKING*

Booking ID: ${booking.bookingReference}
Customer: ${user.fullName}
Phone: ${user.phone || 'N/A'}
Studio: ${booking.studio?.name || 'Unknown Studio'}
Date: ${new Date(booking.bookingDate).toLocaleDateString()}
Time: ${booking.startTime} - ${booking.endTime}
Guests: ${booking.guestCount}
Payment Method: ${booking.paymentMethod}
Payment Status: ${booking.paymentStatus}
Total Amount: ₹${booking.totalAmount}

Please check the Admin Dashboard for complete details.`;

    await this.sendMessage(message);
  }

  static async sendOrderNotification(order: any, user: any): Promise<void> {
    const itemsList = order.items?.map((item: any) => `${item.quantity} × ${item.product?.name || 'Unknown'}`).join('\n') || 'None';

    const message = `🍔 *NEW CAFÉ ORDER*

Order ID: ${order.orderReference}
Customer: ${user.fullName}
Phone: ${user.phone || 'N/A'}
Items:
${itemsList}

Total Amount: ₹${order.totalAmount}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}

Please review in Admin Dashboard.`;

    await this.sendMessage(message);
  }

  static async sendPaymentSuccessNotification(payment: any, referenceType: string, referenceId: string, user: any): Promise<void> {
    const message = `💰 *PAYMENT RECEIVED*

Reference: ${referenceType} (${referenceId})
Customer: ${user.fullName}
Amount: ₹${payment.amount}
Transaction ID: ${payment.razorpayPaymentId || 'N/A'}
Status: ${payment.paymentStatus}`;

    await this.sendMessage(message);
  }

  static async sendOfflinePaymentRequest(type: string, id: string, amount: number, user: any): Promise<void> {
    const message = `⚠️ *OFFLINE PAYMENT REQUEST*

Customer: ${user.fullName}
Phone: ${user.phone || 'N/A'}
Type: ${type}
Reference ID: ${id}
Amount Pending: ₹${amount}

Requires Admin Verification at reception.`;

    await this.sendMessage(message);
  }
}
