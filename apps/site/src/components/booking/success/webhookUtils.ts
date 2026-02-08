export async function triggerTestWebhook(paymentIntentId: string): Promise<void> {
  console.log('🔥 Triggering test webhook for:', paymentIntentId);
  try {
    const response = await fetch("/api/payments/test-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    });
    const data = await response.json();
    console.log('🔥 Webhook response:', data);
    if (!response.ok) {
      console.error('❌ Webhook failed:', data);
    } else {
      console.log('✅ Webhook succeeded:', data);
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
  }
}
