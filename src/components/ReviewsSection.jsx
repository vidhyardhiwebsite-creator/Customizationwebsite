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
            className={`transition-colors ${(hovered || value) >= s
              ? "text-[#C8A23A] fill-[#C8A23A]"
              : "text-[#E7DED1] fill-[#E7DED1]"
            }`}
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7DED1",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(44,36,27,0.05)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,162,58,0.35)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(44,36,27,0.08)"; e.currentTarget.style.transform = "translateY(-2px)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,36,27,0.05)"; e.currentTarget.style.transform = "none" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(200,162,58,0.10)",
            border: "1.5px solid rgba(200,162,58,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700, fontSize: 13,
            color: "#A88422",
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#2C241B", margin: 0, lineHeight: 1.3 }}>
              {review.user_name || "Customer"}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#8F857A", margin: 0, marginTop: 2, lineHeight: 1 }}>
              {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRating value={review.rating} size={13} />
          {isOwn && (
            <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
              <button onClick={() => onEdit(review)}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#8F857A", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                onMouseLeave={e => e.currentTarget.style.color = "#8F857A"}>
                <Edit2 size={13} />
              </button>
              <button onClick={() => onDelete(review.id)}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#8F857A", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#D9534F"}
                onMouseLeave={e => e.currentTarget.style.color = "#8F857A"}>
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13, color: "#6F655A",
        lineHeight: 1.7, margin: 0,
      }}>
        {review.comment}
      </p>
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
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  useEffect(() => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false) })
  }, [])

  const handleSubmit = async e => {
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

  const handleEdit = review => {
    setEditingId(review.id)
    setRating(review.rating)
    setComment(review.comment)
    setShowForm(true)
    setTimeout(() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100)
  }

  const handleDelete = async id => {
    if (!confirm("Delete your review?")) return
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (!error) { setReviews(p => p.filter(r => r.id !== id)); toast.success("Review deleted") }
    else toast.error("Failed to delete")
  }

  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span className="eyebrow" style={{ display: "block", textAlign: "center" }}>What Our Customers Say</span>
        <h2 className="heading-xl" style={{ textAlign: "center" }}>
          Real <span className="text-gold-accent">Reviews</span>
        </h2>
        {avgRating && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
            <StarRating value={Math.round(Number(avgRating))} size={18} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#C8A23A" }}>{avgRating}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#8F857A" }}>
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {user && !userReview && !showForm && (
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            style={{ height: 44, padding: "0 28px", fontSize: 13 }}
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Login to review */}
      {!user && (
        <div style={{
          textAlign: "center", marginBottom: 32,
          background: "#FAF8F3",
          border: "1px solid #E7DED1",
          borderRadius: 20,
          padding: "24px 20px",
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6F655A", marginBottom: 14 }}>
            Login to share your experience with Vidhyrathi
          </p>
          <Link to="/login" className="btn-primary" style={{ height: 44, padding: "0 24px", fontSize: 13 }}>
            <LogIn size={14} /> Login to Review
          </Link>
        </div>
      )}

      {/* Review form */}
      <AnimatePresence>
        {showForm && user && (
          <motion.form
            id="review-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E7DED1",
              borderRadius: 20,
              padding: "24px",
              marginBottom: 28,
              boxShadow: "0 4px 20px rgba(44,36,27,0.07)",
            }}
          >
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: 17, color: "#2C241B", marginBottom: 18 }}>
              {editingId ? "Edit your review" : "Share your experience"}
            </p>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#8F857A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Your Rating
              </p>
              <StarRating value={rating} onChange={setRating} size={26} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#8F857A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Your Review
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience with Vidhyrathi…"
                rows={3}
                style={{
                  width: "100%", background: "#F8F5F0",
                  border: "1px solid #E7DED1", borderRadius: 12,
                  padding: "12px 16px",
                  fontFamily: "'Inter', sans-serif", fontSize: 14,
                  color: "#2C241B", resize: "none", outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "#C8A23A"}
                onBlur={e => e.target.style.borderColor = "#E7DED1"}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setComment(""); setRating(5) }}
                className="btn-ghost"
                style={{ flex: 1, height: 44, fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ flex: 1, height: 44, fontSize: 13, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting && <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                {editingId ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 96, borderRadius: 20 }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#8F857A" }}>
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map(r => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
