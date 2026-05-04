import { useParams } from 'react-router-dom'

const policies = {
  'shipping-policy': {
    title: 'Shipping Policy',
    content: [
      { heading: 'Free Shipping', text: 'We offer free shipping on all orders across India. No minimum order value required.' },
      { heading: 'Delivery Time', text: 'Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available at checkout for select pincodes.' },
      { heading: 'Order Processing', text: 'Orders are processed within 1–2 business days after payment confirmation. You will receive a tracking number via email once your order is shipped.' },
      { heading: 'Packaging', text: 'All jewelry is carefully packed in premium gift boxes to ensure safe delivery and a delightful unboxing experience.' },
      { heading: 'International Shipping', text: 'Currently we ship only within India. International shipping will be available soon.' },
    ]
  },
  'refund-policy': {
    title: 'Refund & Return Policy',
    content: [
      { heading: '30-Day Returns', text: 'We accept returns within 30 days of delivery. Items must be unused, in original packaging, and in the same condition as received.' },
      { heading: 'How to Return', text: 'Contact us at support@nashejewels.in with your order ID and reason for return. We will arrange a pickup at no extra cost.' },
      { heading: 'Refund Process', text: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days to your original payment method.' },
      { heading: 'Non-Returnable Items', text: 'Custom-made or personalized jewelry cannot be returned unless there is a manufacturing defect.' },
      { heading: 'Damaged Items', text: 'If you receive a damaged or defective item, please contact us within 48 hours with photos. We will replace it at no charge.' },
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: [
      { heading: 'Information We Collect', text: 'We collect your name, email, phone number, and delivery address when you place an order or create an account.' },
      { heading: 'How We Use It', text: 'Your information is used solely to process orders, send shipping updates, and improve your shopping experience. We never sell your data.' },
      { heading: 'Payment Security', text: 'All payments are processed securely through Razorpay. We do not store your card or payment details.' },
      { heading: 'Cookies', text: 'We use cookies to remember your preferences and improve site performance. You can disable cookies in your browser settings.' },
      { heading: 'Contact', text: 'For any privacy concerns, email us at support@nashejewels.in.' },
    ]
  }
}

export default function PolicyPage() {
  const { slug } = useParams()
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
            <p className="text-gray-400 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-8 text-center">Last updated: January 2024 · NaShe Jewels</p>
    </div>
  )
}
