# PayPal Subscriptions API - Kurulum Rehberi

## Genel Bakis
Mevcut sistemde PayPal **Orders API** (tek seferlik odeme) kullaniliyor.
Aylik otomatik yenileme icin **PayPal Subscriptions API**'ye gecis gerekiyor.

## Adim 1: PayPal Developer Dashboard
1. https://developer.paypal.com/dashboard/ adresine git
2. Mevcut PayPal Business hesabinla giris yap
3. **Apps & Credentials** > Mevcut uygulamani sec

## Adim 2: Subscription Plans Olusturma (PayPal Dashboard'da)
PayPal'da once "Product" sonra her fiyat icin "Plan" olusturman gerekiyor:

### Product Olustur:
```
POST https://api-m.paypal.com/v1/catalogs/products
{
  "name": "Testmaster Subscription",
  "description": "English learning platform subscription",
  "type": "SERVICE",
  "category": "EDUCATIONAL_AND_TEXTBOOKS"
}
```

### Her Tier icin Plan Olustur:
```
POST https://api-m.paypal.com/v1/billing/plans
{
  "product_id": "<PRODUCT_ID>",
  "name": "Explorer Plan",
  "billing_cycles": [{
    "frequency": { "interval_unit": "MONTH", "interval_count": 1 },
    "tenure_type": "REGULAR",
    "pricing_scheme": { "fixed_price": { "value": "4.99", "currency_code": "USD" } }
  }],
  "payment_preferences": {
    "auto_bill_outstanding": true,
    "payment_failure_threshold": 3
  }
}
```

Ayni sekilde Learner ($9), Achiever ($19), Master ($29) planlari olustur.

## Adim 3: Frontend Entegrasyonu
```javascript
// PayPal JS SDK ile subscription button
<PayPalButtons
  createSubscription={(data, actions) => {
    return actions.subscription.create({
      plan_id: 'P-XXXXX' // PayPal'dan aldığın plan ID
    });
  }}
  onApprove={(data) => {
    // data.subscriptionID ile backend'e bildir
    fetch('/api/payments/paypal/activate-subscription', {
      method: 'POST',
      body: JSON.stringify({
        subscriptionId: data.subscriptionID,
        email: user.email,
        planTier: 'explorer'
      })
    });
  }}
/>
```

## Adim 4: Backend Webhook (Otomatik Yenileme)
PayPal her ay odeme aldiginda webhook gondeir:

1. PayPal Dashboard > Webhooks > "PAYMENT.SALE.COMPLETED" event'ini ekle
2. Webhook URL: `https://testmaster.pro/api/payments/paypal/webhook`

```python
@api_router.post("/payments/paypal/webhook")
async def paypal_webhook(request: Request):
    body = await request.json()
    event_type = body.get("event_type")
    
    if event_type == "PAYMENT.SALE.COMPLETED":
        # Aylik odeme basarili - kullanicinin planini yenile
        subscription_id = body["resource"]["billing_agreement_id"]
        # DB'den subscription_id ile kullaniciyi bul
        # monthly_usage'i sifirla (yeni ay)
        
    elif event_type == "BILLING.SUBSCRIPTION.CANCELLED":
        # Kullanici iptal etti - plani free'ye dondur
        
    elif event_type == "BILLING.SUBSCRIPTION.SUSPENDED":
        # Odeme basarisiz - kullaniciyi bilgilendir
```

## Adim 5: Yapilacaklar Listesi
1. [ ] PayPal Dashboard'da Product olustur
2. [ ] 4 Plan olustur (Explorer, Learner, Achiever, Master)
3. [ ] Plan ID'lerini backend .env'ye ekle
4. [ ] Frontend'te PayPal subscription butonlarini guncelle
5. [ ] Webhook endpoint'i yaz ve test et
6. [ ] PayPal Sandbox'ta test et
7. [ ] Production'a gecis yap

## Onemli Notlar
- Sandbox'ta test ederken: `https://api-m.sandbox.paypal.com` kullan
- Production: `https://api-m.paypal.com`
- Mevcut PAYPAL_CLIENT_ID ve SECRET .env'de zaten mevcut
- Webhook'lari PayPal Dashboard'dan manuel olarak eklemelisin
