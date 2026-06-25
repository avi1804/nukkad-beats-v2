

export class WhatsAppService {
  private static get isConfigured(): boolean {
    return !!(
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ADMIN_NUMBER
    );
  }

  private static async sendMessage(message: string): Promise<void> {
    if (!this.isConfigured) {
      console.log('[WhatsAppService] Skipped: Missing WhatsApp configuration.');
      return;
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
    const version = process.env.WHATSAPP_API_VERSION || 'v17.0';

    const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: adminNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${JSON.stringify(data)}`);
      }

      console.log(`[WhatsAppService] Successfully sent message to ${adminNumber}`);
    } catch (error) {
      console.error('[WhatsAppService] Failed to send message:', error);
      // We purposefully do not re-throw the error so that the main transaction (booking, order, etc.)
      // is not blocked or rolled back if WhatsApp fails.
    }
  }

  static async sendStudioBookingNotification(booking: any, user: any): Promise<void> {
    const message = `🎤 *NEW STUDIO BOOKING*

Booking ID: ${booking.bookingReference}
Customer: ${user.fullName}
Phone: ${user.phone || 'N/A'}
Studio: ${booking.studio.name}
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
    const itemsList = order.items.map((item: any) => `${item.quantity} × ${item.product.name}`).join('\n');

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
