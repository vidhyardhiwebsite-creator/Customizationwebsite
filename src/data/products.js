// Mock product data - replace with Supabase data in production

export const CATEGORIES = [
  "Bangles", "Black Beads", "Bracelets", "Champaswaram",
  "Earrings", "Maatilu", "Necklaces", "Tikka"
]

export const TAGS = ["traditional", "modern", "bridal", "dailywear", "premium"]

// Reliable jewelry image URLs
const IMGS = {
  earring1: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  earring2: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  earring3: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
  necklace1: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
  necklace2: "https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=600&q=80",
  bracelet1: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  bracelet2: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  bangle1: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
  ring1: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
  ring2: "https://images.unsplash.com/photo-1515562153-702640cf-b037-4b1e-83b0-418397cf1be3?w=600&q=80",
}

export const mockProducts = [
  // EARRINGS
  { id: "1", name: "Kundan Jhumka Earrings", price: 2499, category: "Earrings", description: "Handcrafted kundan jhumkas with intricate gold work and pearl drops. Perfect for weddings and festive occasions.", images: [IMGS.earring1, IMGS.earring2, IMGS.earring3], tags: ["traditional", "bridal", "premium"], stock: 15, size: "Medium", created_at: "2024-01-15" },
  { id: "2", name: "Diamond Stud Earrings", price: 8999, category: "Earrings", description: "Elegant solitaire diamond studs set in 18K gold. Timeless and versatile for everyday luxury.", images: [IMGS.earring2, IMGS.earring1], tags: ["modern", "premium", "dailywear"], stock: 8, size: "Small", created_at: "2024-01-20" },
  { id: "3", name: "Oxidized Silver Chandbali", price: 899, category: "Earrings", description: "Beautiful oxidized silver chandbali earrings with traditional motifs. Lightweight and comfortable.", images: [IMGS.earring3, IMGS.earring1], tags: ["traditional", "dailywear"], stock: 25, size: "Large", created_at: "2024-02-01" },
  { id: "4", name: "Gold Hoop Earrings", price: 3499, category: "Earrings", description: "Classic 22K gold hoop earrings with a modern twist. Suitable for both casual and formal wear.", images: [IMGS.earring1, IMGS.earring2], tags: ["modern", "dailywear"], stock: 12, size: "Medium", created_at: "2024-02-10" },
  { id: "5", name: "Meenakari Floral Earrings", price: 1299, category: "Earrings", description: "Vibrant meenakari earrings with floral patterns in traditional Rajasthani style.", images: [IMGS.earring3, IMGS.earring2], tags: ["traditional", "bridal"], stock: 20, size: "Medium", created_at: "2024-02-15" },
  { id: "6", name: "Pearl Drop Earrings", price: 1899, category: "Earrings", description: "Lustrous freshwater pearl drop earrings with gold-plated hooks. Elegant and sophisticated.", images: [IMGS.earring2, IMGS.earring3], tags: ["modern", "premium", "dailywear"], stock: 18, size: "Small", created_at: "2024-03-01" },
  { id: "7", name: "Temple Jewellery Earrings", price: 4299, category: "Earrings", description: "South Indian temple jewellery earrings with goddess motifs in antique gold finish.", images: [IMGS.earring1, IMGS.earring3], tags: ["traditional", "bridal", "premium"], stock: 10, size: "Large", created_at: "2024-03-10" },
  { id: "8", name: "Emerald Stud Earrings", price: 5999, category: "Earrings", description: "Natural emerald studs set in 18K gold with diamond halo. A statement piece for special occasions.", images: [IMGS.earring2, IMGS.earring1], tags: ["premium", "bridal", "modern"], stock: 5, size: "Small", created_at: "2024-03-15" },
  { id: "9", name: "Terracotta Earrings", price: 599, category: "Earrings", description: "Handmade terracotta earrings with traditional Indian motifs. Eco-friendly and unique.", images: [IMGS.earring3, IMGS.earring1], tags: ["traditional", "dailywear"], stock: 30, size: "Medium", created_at: "2024-03-20" },
  { id: "10", name: "Polki Diamond Earrings", price: 9500, category: "Earrings", description: "Uncut polki diamond earrings in traditional Mughal style with enamel work.", images: [IMGS.earring1, IMGS.earring2], tags: ["traditional", "bridal", "premium"], stock: 3, size: "Large", created_at: "2024-04-01" },

  // NECKLACES
  { id: "11", name: "Layered Gold Necklace", price: 6999, category: "Necklaces", description: "Multi-layered 22K gold necklace with intricate filigree work. A timeless heirloom piece.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["traditional", "bridal", "premium"], stock: 7, size: "Medium", created_at: "2024-01-10" },
  { id: "12", name: "Diamond Pendant Necklace", price: 9800, category: "Necklaces", description: "Solitaire diamond pendant on a delicate 18K gold chain. Minimalist luxury at its finest.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["modern", "premium", "dailywear"], stock: 4, size: "Small", created_at: "2024-01-25" },
  { id: "13", name: "Kundan Choker Necklace", price: 4500, category: "Necklaces", description: "Royal kundan choker with emerald and ruby accents. Perfect for bridal trousseau.", images: [IMGS.necklace1, IMGS.earring2], tags: ["traditional", "bridal", "premium"], stock: 6, size: "Medium", created_at: "2024-02-05" },
  { id: "14", name: "Pearl Strand Necklace", price: 3200, category: "Necklaces", description: "Classic freshwater pearl strand with gold clasp. Elegant for any occasion.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["modern", "dailywear", "premium"], stock: 10, size: "Medium", created_at: "2024-02-20" },
  { id: "15", name: "Oxidized Tribal Necklace", price: 1100, category: "Necklaces", description: "Bold oxidized silver tribal necklace with geometric patterns. Statement piece for casual wear.", images: [IMGS.earring3, IMGS.necklace1], tags: ["traditional", "dailywear"], stock: 22, size: "Large", created_at: "2024-03-05" },
  { id: "16", name: "Emerald Gold Necklace", price: 8500, category: "Necklaces", description: "Colombian emerald necklace set in 22K gold with diamond accents. Exquisite craftsmanship.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["premium", "bridal", "traditional"], stock: 3, size: "Medium", created_at: "2024-03-15" },
  { id: "17", name: "Mangalsutra Necklace", price: 2800, category: "Necklaces", description: "Traditional mangalsutra with black beads and gold pendant. Auspicious and beautiful.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["traditional", "dailywear"], stock: 15, size: "Medium", created_at: "2024-03-25" },
  { id: "18", name: "Rose Gold Chain", price: 4200, category: "Necklaces", description: "Delicate rose gold chain with heart pendant. Modern and romantic.", images: [IMGS.necklace1, IMGS.earring2], tags: ["modern", "dailywear"], stock: 14, size: "Small", created_at: "2024-04-05" },
  { id: "19", name: "Antique Temple Necklace", price: 5500, category: "Necklaces", description: "South Indian antique gold temple necklace with deity motifs. Heritage craftsmanship.", images: [IMGS.necklace2, IMGS.earring3], tags: ["traditional", "bridal", "premium"], stock: 5, size: "Large", created_at: "2024-04-10" },
  { id: "20", name: "Sapphire Pendant", price: 7200, category: "Necklaces", description: "Blue sapphire pendant in white gold setting with diamond halo. Stunning and sophisticated.", images: [IMGS.necklace1, IMGS.earring2], tags: ["premium", "modern", "bridal"], stock: 4, size: "Small", created_at: "2024-04-15" },

  // BLACK BEADS
  { id: "21", name: "Traditional Mangalsutra", price: 1800, category: "Black Beads", description: "Classic black bead mangalsutra with gold pendant. Symbol of marital bliss.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["traditional", "dailywear"], stock: 20, size: "Medium", created_at: "2024-01-12" },
  { id: "22", name: "Designer Black Bead Necklace", price: 3200, category: "Black Beads", description: "Contemporary black bead necklace with diamond-studded gold pendant.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["modern", "premium", "dailywear"], stock: 12, size: "Medium", created_at: "2024-02-08" },
  { id: "23", name: "Short Black Bead Chain", price: 950, category: "Black Beads", description: "Short black bead chain with small gold pendant. Perfect for daily wear.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["traditional", "dailywear"], stock: 30, size: "Small", created_at: "2024-02-18" },
  { id: "24", name: "Bridal Mangalsutra Set", price: 6500, category: "Black Beads", description: "Elaborate bridal mangalsutra with multiple gold pendants and black beads.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["traditional", "bridal", "premium"], stock: 6, size: "Large", created_at: "2024-03-08" },
  { id: "25", name: "Gold-Plated Black Bead Bracelet", price: 750, category: "Black Beads", description: "Elegant black bead bracelet with gold-plated accents. Versatile and stylish.", images: [IMGS.bracelet1, IMGS.bracelet2], tags: ["modern", "dailywear"], stock: 25, size: "Small", created_at: "2024-03-18" },

  // TIKKA
  { id: "26", name: "Maang Tikka Gold", price: 2200, category: "Tikka", description: "Traditional maang tikka in 22K gold with kundan setting. Bridal essential.", images: [IMGS.earring1, IMGS.earring2], tags: ["traditional", "bridal"], stock: 15, size: "Medium", created_at: "2024-01-18" },
  { id: "27", name: "Diamond Maang Tikka", price: 8200, category: "Tikka", description: "Exquisite diamond maang tikka in 18K white gold. The crown jewel of bridal jewelry.", images: [IMGS.earring2, IMGS.earring1], tags: ["premium", "bridal", "modern"], stock: 4, size: "Small", created_at: "2024-02-12" },
  { id: "28", name: "Kundan Tikka", price: 3800, category: "Tikka", description: "Elaborate kundan tikka with floral design and pearl drops. Rajasthani craftsmanship.", images: [IMGS.earring3, IMGS.earring2], tags: ["traditional", "bridal", "premium"], stock: 8, size: "Large", created_at: "2024-03-02" },
  { id: "29", name: "Simple Gold Tikka", price: 1500, category: "Tikka", description: "Minimalist gold tikka for everyday elegance. Lightweight and comfortable.", images: [IMGS.earring1, IMGS.earring3], tags: ["modern", "dailywear"], stock: 20, size: "Small", created_at: "2024-03-22" },
  { id: "30", name: "Meenakari Tikka", price: 2700, category: "Tikka", description: "Colorful meenakari tikka with peacock motif. Vibrant and festive.", images: [IMGS.earring2, IMGS.earring3], tags: ["traditional", "bridal"], stock: 12, size: "Medium", created_at: "2024-04-02" },

  // CHAMPASWARAM
  { id: "31", name: "Gold Champaswaram", price: 5500, category: "Champaswaram", description: "Traditional South Indian champaswaram in 22K gold with floral motifs.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["traditional", "bridal", "premium"], stock: 6, size: "Large", created_at: "2024-01-22" },
  { id: "32", name: "Pearl Champaswaram", price: 3200, category: "Champaswaram", description: "Elegant champaswaram with freshwater pearls and gold beads. Graceful and feminine.", images: [IMGS.necklace2, IMGS.necklace1], tags: ["traditional", "bridal"], stock: 10, size: "Medium", created_at: "2024-02-22" },
  { id: "33", name: "Antique Champaswaram", price: 4800, category: "Champaswaram", description: "Antique finish champaswaram with temple motifs. Heritage piece for special occasions.", images: [IMGS.earring3, IMGS.necklace1], tags: ["traditional", "premium", "bridal"], stock: 5, size: "Large", created_at: "2024-03-12" },
  { id: "34", name: "Ruby Champaswaram", price: 7500, category: "Champaswaram", description: "Stunning champaswaram with natural ruby stones and gold work. Bridal masterpiece.", images: [IMGS.necklace1, IMGS.necklace2], tags: ["premium", "bridal", "traditional"], stock: 3, size: "Large", created_at: "2024-04-08" },

  // MAATILU
  { id: "35", name: "Traditional Maatilu", price: 2800, category: "Maatilu", description: "Classic Telugu maatilu in 22K gold with traditional design. Auspicious bridal jewelry.", images: [IMGS.earring1, IMGS.earring2], tags: ["traditional", "bridal"], stock: 12, size: "Medium", created_at: "2024-01-28" },
  { id: "36", name: "Diamond Maatilu", price: 9200, category: "Maatilu", description: "Premium diamond-studded maatilu in 18K gold. Luxurious bridal accessory.", images: [IMGS.earring2, IMGS.earring1], tags: ["premium", "bridal", "modern"], stock: 3, size: "Small", created_at: "2024-02-28" },
  { id: "37", name: "Pearl Maatilu", price: 1900, category: "Maatilu", description: "Delicate pearl maatilu with gold accents. Elegant and traditional.", images: [IMGS.earring3, IMGS.earring2], tags: ["traditional", "bridal", "dailywear"], stock: 18, size: "Small", created_at: "2024-03-28" },
  { id: "38", name: "Kundan Maatilu", price: 4200, category: "Maatilu", description: "Ornate kundan maatilu with colorful stones. Perfect for bridal occasions.", images: [IMGS.earring1, IMGS.earring3], tags: ["traditional", "bridal", "premium"], stock: 7, size: "Medium", created_at: "2024-04-18" },

  // BRACELETS
  { id: "39", name: "Gold Kada Bracelet", price: 4500, category: "Bracelets", description: "Solid 22K gold kada with traditional engravings. Timeless and sturdy.", images: [IMGS.bracelet1, IMGS.bracelet2], tags: ["traditional", "premium", "dailywear"], stock: 10, size: "Medium", created_at: "2024-01-30" },
  { id: "40", name: "Diamond Tennis Bracelet", price: 9800, category: "Bracelets", description: "Classic diamond tennis bracelet in 18K white gold. Timeless elegance.", images: [IMGS.bracelet2, IMGS.bracelet1], tags: ["premium", "modern", "bridal"], stock: 3, size: "Small", created_at: "2024-02-14" },
  { id: "41", name: "Charm Bracelet", price: 1800, category: "Bracelets", description: "Gold-plated charm bracelet with traditional Indian motifs. Fun and fashionable.", images: [IMGS.bracelet1, IMGS.bracelet2], tags: ["modern", "dailywear"], stock: 22, size: "Small", created_at: "2024-03-04" },
  { id: "42", name: "Kundan Bracelet", price: 3200, category: "Bracelets", description: "Ornate kundan bracelet with floral design. Bridal and festive wear.", images: [IMGS.bracelet2, IMGS.bracelet1], tags: ["traditional", "bridal", "premium"], stock: 8, size: "Medium", created_at: "2024-03-24" },
  { id: "43", name: "Silver Oxidized Bracelet", price: 750, category: "Bracelets", description: "Oxidized silver bracelet with tribal patterns. Bohemian and stylish.", images: [IMGS.bracelet1, IMGS.bracelet2], tags: ["traditional", "dailywear"], stock: 28, size: "Medium", created_at: "2024-04-04" },
  { id: "44", name: "Ruby Gold Bracelet", price: 6800, category: "Bracelets", description: "Exquisite ruby and gold bracelet with intricate craftsmanship. Premium statement piece.", images: [IMGS.bracelet2, IMGS.bracelet1], tags: ["premium", "bridal", "traditional"], stock: 4, size: "Medium", created_at: "2024-04-20" },

  // BANGLES
  { id: "45", name: "Gold Bangles Set (6)", price: 7500, category: "Bangles", description: "Set of 6 traditional 22K gold bangles with intricate patterns. Bridal essential.", images: [IMGS.bangle1, IMGS.bracelet1], tags: ["traditional", "bridal", "premium"], stock: 8, size: "Medium", created_at: "2024-01-05" },
  { id: "46", name: "Glass Bangles Set (12)", price: 599, category: "Bangles", description: "Colorful glass bangles with gold border. Festive and vibrant.", images: [IMGS.bangle1, IMGS.bracelet2], tags: ["traditional", "dailywear"], stock: 40, size: "Small", created_at: "2024-01-15" },
  { id: "47", name: "Diamond Bangles Pair", price: 9500, category: "Bangles", description: "Pair of diamond-studded bangles in 18K gold. Luxurious and timeless.", images: [IMGS.bracelet1, IMGS.bangle1], tags: ["premium", "bridal", "modern"], stock: 3, size: "Medium", created_at: "2024-02-05" },
  { id: "48", name: "Lac Bangles Set", price: 850, category: "Bangles", description: "Traditional lac bangles with mirror work and gold accents. Rajasthani craft.", images: [IMGS.bangle1, IMGS.bracelet2], tags: ["traditional", "dailywear"], stock: 35, size: "Medium", created_at: "2024-02-25" },
  { id: "49", name: "Kundan Bangles Set (4)", price: 4800, category: "Bangles", description: "Set of 4 kundan bangles with floral motifs. Bridal and festive wear.", images: [IMGS.bracelet1, IMGS.bangle1], tags: ["traditional", "bridal", "premium"], stock: 6, size: "Large", created_at: "2024-03-15" },
  { id: "50", name: "Rose Gold Bangles Pair", price: 3200, category: "Bangles", description: "Modern rose gold bangles with diamond accents. Contemporary elegance.", images: [IMGS.bangle1, IMGS.bracelet1], tags: ["modern", "dailywear", "premium"], stock: 12, size: "Small", created_at: "2024-04-12" },
]
