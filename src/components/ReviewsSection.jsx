import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Edit2, Trash2, LogIn } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${(hovered || value) >= s ? "text-[#C9956C] fill-[#C9956C]" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwn = review.user_id === currentUserId
  const initials = (review.user_name || "U").slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1B2B5E]/10 border border-[#1B2B5E]/20 flex items-center justify-center text-[#1B2B5E] text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[#1A1A2E] text-sm font-medium">{review.user_name || "Customer"}</p>
            <p className="text-[#8A8AAA] text-xs">{new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size={13} />
          {isOwn && (
            <div className="flex gap-1 ml-1">
              <button onClick={() => onEdit(review)} className="text-[#8A8AAA] hover:text-[#1B2B5E] transition-colors"><Edit2 size={13} /></button>
              <button onClick={() => onDelete(review.id)} className="text-[#8A8AAA] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
            </div>
          )}
        </div>
      </div>
      <p className="text-[#4A4A6A] text-sm mt-3 leading-relaxed">{review.comment}</p>
    </motion.div>
  )
}

export default function ReviewsSection() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const userReview = reviews.find(r => r.user_id === user?.id)
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  useEffect(() => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false) })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) { toast.error("Please write a comment"); return }
    setSubmitting(true)
    try {
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"
      if (editingId) {
        const { data, error } = await supabase.from("reviews")
          .update({ rating, comment: comment.trim() })
          .eq("id", editingId).select().single()
        if (error) throw error
        setReviews(p => p.map(r => r.id === editingId ? data : r))
        toast.success("Review updated!")
      } else {
        const { data, error } = await supabase.from("reviews")
          .insert({ user_id: user.id, user_name: userName, rating, comment: comment.trim() })
          .select().single()
        if (error) throw error
        setReviews(p => [data, ...p])
        toast.success("Review submitted!")
      }
      setComment(""); setRating(5); setEditingId(null); setShowForm(false)
    } catch (e) {
      toast.error(e.message || "Failed to submit review")
    } finally { setSubmitting(false) }
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setRating(review.rating)
    setComment(review.comment)
    setShowForm(true)
    setTimeout(() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete your review?")) return
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (!error) { setReviews(p => p.filter(r => r.id !== id)); toast.success("Review deleted") }
    else toast.error("Failed to delete")
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[#C9956C] text-xs uppercase tracking-widest mb-2">What Our Customers Say</p>
        <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>Real Reviews</h2>
        {avgRating && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <StarRating value={Math.round(Number(avgRating))} size={18} />
            <span className="text-[#C9956C] font-bold text-lg">{avgRating}</span>
            <span className="text-[#8A8AAA] text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {user && !userReview && !showForm && (
        <div className="text-center mb-8">
          <button onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-[#1B2B5E] text-white font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all text-sm">
            Write a Review
          </button>
        </div>
      )}

      {!user && (
        <div className="text-center mb-8 bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl p-5">
          <p className="text-[#4A4A6A] text-sm mb-3">Login to share your experience</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 bg-[#1B2B5E] text-white font-semibold rounded-lg hover:bg-[#2A3F7E] transition-all text-sm">
            <LogIn size={14} /> Login to Review
          </Link>
        </div>
      )}

      <AnimatePresence>
        {showForm && user && (
          <motion.form id="review-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-white border border-[#E8E0D5] rounded-xl p-5 mb-8 space-y-4 shadow-sm"
          >
            <p className="text-[#1A1A2E] font-medium">{editingId ? "Edit your review" : "Share your experience"}</p>
            <div>
              <p className="text-[#4A4A6A] text-xs mb-2 font-medium">Your Rating</p>
              <StarRating value={rating} onChange={setRating} size={24} />
            </div>
            <div>
              <p className="text-[#4A4A6A] text-xs mb-2 font-medium">Your Review</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience with Vidhyrathi..."
                rows={3}
                className="w-full bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder-[#8A8AAA] focus:outline-none focus:border-[#1B2B5E] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setComment(""); setRating(5) }}
                className="flex-1 py-2 border border-[#E8E0D5] text-[#4A4A6A] rounded-lg text-sm hover:border-[#1B2B5E]/30">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2 bg-[#1B2B5E] text-white font-semibold rounded-lg text-sm hover:bg-[#2A3F7E] disabled:opacity-50 flex items-center justify-center gap-1">
                {submitting && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                {editingId ? "Update" : "Submit Review"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-[#F2EDE6] rounded-xl p-4 h-24 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-[#8A8AAA] py-10">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} currentUserId={user?.id} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
