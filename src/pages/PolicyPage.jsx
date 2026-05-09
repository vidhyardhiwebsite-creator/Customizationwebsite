import { useLocation } from 'react-router-dom'

const policies = {
  'shipping-policy': {
    title: 'Shipping Policy',
    content: [
      {
        heading: 'Processing Time',
        text: 'All confirmed orders are processed and dispatched within 24–48 hours (excluding Sundays and public holidays).\n\nIn case of delays due to stock availability or unforeseen reasons, customers will be informed promptly.'
      },
      {
        heading: 'Shipping Options & Charges',
        text: 'Standard Shipping:\n• ₹80 per order within Andhra Pradesh and Telangana\n• ₹100 for all other states\n\nDelivery timeline: 5–7 business days (after dispatch)\n\nNOTE: Currently, we do not offer free shipping on any orders.'
      },
      {
        heading: 'Delivery Information',
        text: 'Orders are shipped via trusted courier partners.\n\nDelivery timelines may vary based on location, courier performance, weather conditions, or other factors beyond our control.\n\nCustomers are responsible for providing a complete and accurate shipping address. Incorrect addresses may lead to delays or non-delivery.'
      },
      {
        heading: 'Tracking Orders',
        text: 'Once shipped, customers will receive a tracking ID via WhatsApp/email to track their order in real-time.'
      },
      {
        heading: 'International Shipping',
        text: 'At present, we do not offer international shipping. Orders are delivered only within India.'
      },
      {
        heading: 'Contact Us',
        text: 'For shipping-related queries, please contact:\n📞 Phone / WhatsApp: +91 8639006849\n📧 Email: nashejewels@gmail.com'
      },
    ]
  },
  'refund-policy': {
    title: 'Refund & Return Policy',
    content: [
      {
        heading: '😊 NaShe Jewels — Customer First',
        text: 'Customer satisfaction is very important to us. Every product is carefully checked and packed before dispatch to ensure it reaches you in the best condition.\n\nPlease go through our policy to understand how we handle returns, replacements, and refunds.'
      },
      {
        heading: 'General Policy',
        text: 'We follow a No Return / No Exchange policy for all orders once delivered.\n\nReturns are not accepted for reasons such as change of mind, dislike of design, or minor variations in color/finish (as some variation may occur due to photography and screen display).'
      },
      {
        heading: 'Damaged or Defective Products',
        text: 'If you receive a damaged or defective product, we are committed to resolving it quickly.\n\n• Inform us within 24 hours of receiving the order.\n• OPENING VIDEO IS MANDATORY. Share a clear unboxing video of the damaged product.\n• Before opening the package, the package should be focused at the tearing side properly.\n• ❌ NO ZOOM  ❌ NO EDITING\n• NOTE: 360° view of the package must be recorded before tearing it open.'
      },
      {
        heading: 'How to Report',
        text: 'Send the proof via:\n📱 WhatsApp: +91 8639006849\n📧 Email: nashejewels@gmail.com\n\nOnce verified by our team, we will:\n• Offer a replacement of the same product, or\n• Provide a refund if replacement is not possible.'
      },
      {
        heading: 'Refunds',
        text: 'Refunds will be processed to the original payment method within 5–7 working days after approval.\n\nShipping charges are non-refundable.'
      },
      {
        heading: 'Contact Us',
        text: 'For all return or refund related queries, please contact us:\n📞 Phone / WhatsApp: +91 8639006849\n📧 Email: nashejewels@gmail.com'
      },
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: [
      { heading: 'Information We Collect', text: 'We collect your name, email, phone number, and delivery address when you place an order or create an account.' },
      { heading: 'How We Use It', text: 'Your information is used solely to process orders, send shipping updates, and improve your shopping experience. We never sell your data.' },
      { heading: 'Payment Security', text: 'All payments are processed securely. We do not store your card or payment details.' },
      { heading: 'Cookies', text: 'We use cookies to remember your preferences and improve site performance. You can disable cookies in your browser settings.' },
      { heading: 'Contact', text: 'For any privacy concerns, email us at nashejewels@gmail.com.' },
    ]
  }
}

export default function PolicyPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/', '')
  const policy = policies[slug]

  if (!policy) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Page not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Georgia, serif' }}>{policy.title}</h1>
      <div className="space-y-6">
        {policy.content.map((section, i) => (
          <div key={i} className="bg-[#111] border border-[#D4AF37]/10 rounded-xl p-5">
            <h2 className="text-[#D4AF37] font-semibold mb-2">{section.heading}</h2>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{section.text}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-8 text-center">Last updated: May 2026 · NaShe Jewels</p>
    </div>
  )
}
