// Product data — replace with Supabase data in production

export const CATEGORIES = [
  "Photo Cubes",
  "Pillows",
  "Mugs",
  "Kiddy Banks",
  "Temples (MDF)",
  "Pens",
  "Photo Box",
  "Rotating Bottles",
  "Water Bottles",
  "Photo Frames",
  "Wood Engraving Photo Frames",
  "MDF Motovits",
  "LED Photo Frames",
  "Rings",
  "Brochettes",
  "Acrylic Photo Frames",
  "Photo Cut Borders",
  "Keychains",
  "Acrylic Photo Clothes",
  "Name Relieving",
  "Lifetime Calendar",
  "Mobile Pouches",
  "MDF Photo Frames",
  "T-Shirts",
  "Custom Cut Boards",
]

export const TAGS = ["personalized", "gifting", "photo", "custom", "premium"]

// Product images
const IMGS = {
  mug1:      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  mug2:      "https://images.unsplash.com/photo-1571816119607-57e48af1caa7?w=600&q=80",
  pillow1:   "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  pillow2:   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  frame1:    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80",
  frame2:    "https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600&q=80",
  tshirt1:   "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  tshirt2:   "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&q=80",
  keychain1: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
  keychain2: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  bottle1:   "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
  bottle2:   "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80",
  cube1:     "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  calendar1: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
  phone1:    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
  wood1:     "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80",
}

export const mockProducts = [
  // PHOTO CUBES
  { id: "1",  name: "Custom Photo Cube",            price: 599,  category: "Photo Cubes",                 description: "6-sided personalized photo cube with your favorite memories.",          images: [IMGS.cube1, IMGS.frame1],     tags: ["personalized","gifting","photo"],   stock: 30, created_at: "2024-01-10" },
  { id: "2",  name: "Magic Photo Cube Set",         price: 899,  category: "Photo Cubes",                 description: "Set of 2 magic folding photo cubes — great gifting option.",            images: [IMGS.cube1, IMGS.mug1],       tags: ["gifting","photo","premium"],        stock: 20, created_at: "2024-02-01" },
  // PILLOWS
  { id: "3",  name: "Personalized Photo Pillow",    price: 699,  category: "Pillows",                     description: "Custom printed pillow with your photo and message.",                    images: [IMGS.pillow1, IMGS.pillow2],  tags: ["personalized","gifting"],           stock: 25, created_at: "2024-01-15" },
  { id: "4",  name: "Couple Photo Pillow",          price: 849,  category: "Pillows",                     description: "Beautiful couple photo printed on soft premium pillow.",                images: [IMGS.pillow2, IMGS.pillow1],  tags: ["gifting","premium"],                stock: 18, created_at: "2024-02-10" },
  // MUGS
  { id: "5",  name: "Custom Photo Mug",             price: 349,  category: "Mugs",                        description: "Personalized ceramic mug with your photo — perfect morning gift.",      images: [IMGS.mug1, IMGS.mug2],        tags: ["personalized","gifting","photo"],   stock: 50, created_at: "2024-01-20" },
  { id: "6",  name: "Magic Color-Change Mug",       price: 449,  category: "Mugs",                        description: "Reveals your photo when filled with hot liquid. Wow factor guaranteed.",images: [IMGS.mug2, IMGS.mug1],        tags: ["gifting","custom","premium"],       stock: 35, created_at: "2024-02-15" },
  { id: "7",  name: "Couple Name Mug Set",          price: 799,  category: "Mugs",                        description: "Set of 2 mugs with customized names and a special message.",            images: [IMGS.mug1, IMGS.mug2],        tags: ["personalized","gifting"],           stock: 22, created_at: "2024-03-01" },
  // KIDDY BANKS
  { id: "8",  name: "Personalized Kiddy Bank",      price: 499,  category: "Kiddy Banks",                 description: "Cute piggy bank with child's name and photo — fun savings gift.",      images: [IMGS.cube1, IMGS.frame1],     tags: ["personalized","gifting","custom"],  stock: 20, created_at: "2024-01-25" },
  { id: "9",  name: "Photo Kiddy Bank",             price: 599,  category: "Kiddy Banks",                 description: "Custom photo printed kiddy bank in durable material.",                  images: [IMGS.frame1, IMGS.cube1],     tags: ["gifting","photo"],                  stock: 15, created_at: "2024-02-20" },
  // TEMPLES (MDF)
  { id: "10", name: "MDF Temple Showpiece",         price: 1299, category: "Temples (MDF)",               description: "Intricately cut MDF temple design — ideal home decor gifting piece.",  images: [IMGS.wood1, IMGS.frame1],     tags: ["custom","gifting","premium"],       stock: 12, created_at: "2024-02-05" },
  { id: "11", name: "Personalized MDF Temple",      price: 1599, category: "Temples (MDF)",               description: "Custom MDF temple with family name engraved — a blessed gift.",         images: [IMGS.wood1, IMGS.frame2],     tags: ["personalized","gifting","premium"], stock: 8,  created_at: "2024-03-10" },
  // PENS
  { id: "12", name: "Custom Name Pen",              price: 149,  category: "Pens",                        description: "Personalized ballpoint pen with name engraving — great corporate gift.",images: [IMGS.keychain1, IMGS.mug1],   tags: ["personalized","gifting","custom"],  stock: 100,created_at: "2024-01-05" },
  { id: "13", name: "Premium Engraved Pen Set",     price: 399,  category: "Pens",                        description: "Set of 2 premium pens in gift box with custom engraving.",              images: [IMGS.keychain2, IMGS.mug2],   tags: ["premium","gifting","personalized"], stock: 40, created_at: "2024-02-25" },
  // PHOTO BOX
  { id: "14", name: "Custom Photo Gift Box",        price: 999,  category: "Photo Box",                   description: "Personalized gift box with photo print — perfect for special occasions.",images: [IMGS.frame1, IMGS.pillow1],   tags: ["gifting","photo","premium"],        stock: 15, created_at: "2024-01-30" },
  { id: "15", name: "Memory Photo Box",             price: 1199, category: "Photo Box",                   description: "Beautiful keepsake box with photo collage print and custom message.",    images: [IMGS.frame2, IMGS.cube1],     tags: ["personalized","gifting","premium"], stock: 10, created_at: "2024-03-05" },
  // ROTATING BOTTLES
  { id: "16", name: "Rotating Photo Bottle",        price: 599,  category: "Rotating Bottles",            description: "Stainless steel bottle with 360 degree rotating photo strip.",           images: [IMGS.bottle1, IMGS.bottle2],  tags: ["photo","custom","gifting"],         stock: 25, created_at: "2024-02-12" },
  { id: "17", name: "Custom Spin Bottle",           price: 749,  category: "Rotating Bottles",            description: "Double-wall insulated bottle with rotating personalized label.",          images: [IMGS.bottle2, IMGS.bottle1],  tags: ["personalized","premium","gifting"], stock: 18, created_at: "2024-03-15" },
  // WATER BOTTLES
  { id: "18", name: "Photo Print Water Bottle",     price: 449,  category: "Water Bottles",               description: "BPA-free water bottle with full-wrap custom photo print.",               images: [IMGS.bottle1, IMGS.bottle2],  tags: ["photo","custom","gifting"],         stock: 40, created_at: "2024-01-18" },
  { id: "19", name: "Name Engraved Steel Bottle",   price: 649,  category: "Water Bottles",               description: "Premium stainless steel water bottle with laser-engraved name.",          images: [IMGS.bottle2, IMGS.bottle1],  tags: ["personalized","premium"],           stock: 30, created_at: "2024-02-22" },
  // PHOTO FRAMES
  { id: "20", name: "Classic Photo Frame",          price: 399,  category: "Photo Frames",                description: "Elegant photo frame with custom name and date engraving.",               images: [IMGS.frame1, IMGS.frame2],    tags: ["photo","gifting","personalized"],   stock: 35, created_at: "2024-01-12" },
  { id: "21", name: "Collage Photo Frame",          price: 699,  category: "Photo Frames",                description: "Multi-photo collage frame with custom caption — cherish memories.",      images: [IMGS.frame2, IMGS.frame1],    tags: ["photo","gifting","premium"],        stock: 20, created_at: "2024-02-08" },
  // WOOD ENGRAVING PHOTO FRAMES
  { id: "23", name: "Engraved Wood Frame",          price: 899,  category: "Wood Engraving Photo Frames", description: "Handcrafted wooden frame with laser-engraved photo and message.",         images: [IMGS.wood1, IMGS.frame1],     tags: ["personalized","premium","photo"],   stock: 15, created_at: "2024-01-28" },
  { id: "24", name: "Rustic Wood Engraved Frame",   price: 1199, category: "Wood Engraving Photo Frames", description: "Natural wood engraved frame — rustic charm for your best memories.",       images: [IMGS.wood1, IMGS.frame2],     tags: ["premium","gifting","photo"],        stock: 10, created_at: "2024-03-02" },
  // MDF MOTOVITS
  { id: "25", name: "MDF Name Plate",               price: 599,  category: "MDF Motovits",                description: "Custom MDF name plate with decorative motifs for home or office.",       images: [IMGS.wood1, IMGS.cube1],      tags: ["custom","gifting","personalized"],  stock: 22, created_at: "2024-02-18" },
  { id: "26", name: "MDF Wall Art",                 price: 799,  category: "MDF Motovits",                description: "Decorative MDF wall art with custom design and vibrant colors.",          images: [IMGS.frame2, IMGS.wood1],     tags: ["custom","premium","gifting"],       stock: 16, created_at: "2024-03-22" },
  // LED PHOTO FRAMES
  { id: "27", name: "LED Glowing Photo Frame",      price: 999,  category: "LED Photo Frames",            description: "Photo frame with LED light border — creates a warm glowing effect.",     images: [IMGS.frame1, IMGS.frame2],    tags: ["photo","premium","gifting"],        stock: 18, created_at: "2024-01-22" },
  { id: "28", name: "LED Neon Name Frame",          price: 1299, category: "LED Photo Frames",            description: "Custom LED neon name frame — eye-catching decoration for any room.",      images: [IMGS.frame2, IMGS.frame1],    tags: ["personalized","premium","custom"],  stock: 10, created_at: "2024-02-28" },
  // RINGS
  { id: "29", name: "Personalized Name Ring",       price: 449,  category: "Rings",                       description: "Custom name-engraved ring in silver-plated finish.",                    images: [IMGS.keychain1, IMGS.mug1],   tags: ["personalized","gifting"],           stock: 30, created_at: "2024-01-16" },
  { id: "30", name: "Couple Name Ring Set",         price: 799,  category: "Rings",                       description: "Set of 2 matching rings with couple names engraved.",                   images: [IMGS.keychain2, IMGS.mug2],   tags: ["personalized","gifting","premium"], stock: 20, created_at: "2024-02-14" },
  // BROCHETTES
  { id: "31", name: "Custom Logo Brooch",           price: 299,  category: "Brochettes",                  description: "Personalized acrylic brooch with photo or logo print.",                  images: [IMGS.keychain1, IMGS.cube1],  tags: ["custom","gifting","personalized"],  stock: 40, created_at: "2024-02-02" },
  { id: "32", name: "Name Brooch Pin",              price: 199,  category: "Brochettes",                  description: "Lightweight name brooch pin — great corporate or personal gift.",         images: [IMGS.keychain2, IMGS.cube1],  tags: ["personalized","gifting"],           stock: 50, created_at: "2024-03-08" },
  // ACRYLIC PHOTO FRAMES
  { id: "33", name: "Acrylic Clear Photo Frame",    price: 699,  category: "Acrylic Photo Frames",        description: "Crystal-clear acrylic photo frame with UV-printed photo.",               images: [IMGS.frame1, IMGS.frame2],    tags: ["photo","premium","gifting"],        stock: 22, created_at: "2024-01-26" },
  { id: "34", name: "Acrylic Heart Frame",          price: 849,  category: "Acrylic Photo Frames",        description: "Heart-shaped acrylic frame — a romantic personalized gift.",              images: [IMGS.frame2, IMGS.pillow2],   tags: ["personalized","gifting","premium"], stock: 15, created_at: "2024-02-26" },
  // PHOTO CUT BORDERS
  { id: "35", name: "Star Shape Photo Cut-Out",     price: 399,  category: "Photo Cut Borders",           description: "Photo printed in custom star-shape cut border — unique wall decor.",      images: [IMGS.frame1, IMGS.cube1],     tags: ["photo","custom","gifting"],         stock: 25, created_at: "2024-03-12" },
  { id: "36", name: "Heart Photo Cut Border",       price: 449,  category: "Photo Cut Borders",           description: "Heart-shaped photo cutout — perfect anniversary or Valentine gift.",      images: [IMGS.pillow2, IMGS.frame1],   tags: ["personalized","gifting","photo"],   stock: 20, created_at: "2024-04-01" },
  // KEYCHAINS
  { id: "37", name: "Custom Photo Keychain",        price: 199,  category: "Keychains",                   description: "Personalized photo keychain — carry your memories everywhere.",          images: [IMGS.keychain1, IMGS.keychain2], tags: ["photo","gifting","personalized"], stock: 60, created_at: "2024-01-08" },
  { id: "38", name: "Engraved Name Keychain",       price: 249,  category: "Keychains",                   description: "Laser-engraved metal keychain with custom name or message.",              images: [IMGS.keychain2, IMGS.keychain1], tags: ["personalized","gifting"],         stock: 50, created_at: "2024-02-04" },
  { id: "39", name: "Couple Keychain Set",          price: 399,  category: "Keychains",                   description: "Set of 2 matching keychains with couple names — a heartfelt gift.",      images: [IMGS.keychain1, IMGS.mug1],   tags: ["personalized","gifting","premium"], stock: 35, created_at: "2024-03-18" },
  // ACRYLIC PHOTO CLOTHES
  { id: "40", name: "Acrylic Photo T-Shirt Print",  price: 549,  category: "Acrylic Photo Clothes",       description: "High-quality acrylic photo print on premium fabric clothing.",             images: [IMGS.tshirt1, IMGS.tshirt2],  tags: ["photo","custom","gifting"],         stock: 25, created_at: "2024-02-16" },
  // NAME RELIEVING
  { id: "41", name: "Custom Name Relief Plaque",    price: 799,  category: "Name Relieving",              description: "3D name relief plaque in wood or MDF — a classy personalized gift.",     images: [IMGS.wood1, IMGS.frame1],     tags: ["personalized","custom","premium"],  stock: 15, created_at: "2024-01-20" },
  { id: "42", name: "Name Engraved Wall Plate",     price: 649,  category: "Name Relieving",              description: "Wall-mounted name plate with elegant engraved relief design.",            images: [IMGS.frame2, IMGS.wood1],     tags: ["personalized","gifting"],           stock: 18, created_at: "2024-03-06" },
  // LIFETIME CALENDAR
  { id: "43", name: "Personalized Lifetime Calendar",price: 1499,category: "Lifetime Calendar",           description: "Perpetual calendar with your photo — marks special dates forever.",       images: [IMGS.calendar1, IMGS.frame1], tags: ["personalized","gifting","premium"], stock: 12, created_at: "2024-02-10" },
  { id: "44", name: "Family Photo Calendar",        price: 1199, category: "Lifetime Calendar",           description: "12-month photo calendar with family pictures for each month.",           images: [IMGS.calendar1, IMGS.frame2], tags: ["photo","gifting","personalized"],   stock: 20, created_at: "2024-03-14" },
  // MOBILE POUCHES
  { id: "45", name: "Custom Photo Phone Pouch",     price: 349,  category: "Mobile Pouches",              description: "Personalized mobile phone pouch with photo print — stylish and practical.",images: [IMGS.phone1, IMGS.tshirt1],  tags: ["photo","custom","gifting"],         stock: 30, created_at: "2024-01-30" },
  { id: "46", name: "Name Print Mobile Sleeve",     price: 299,  category: "Mobile Pouches",              description: "Custom name-printed neoprene mobile sleeve for daily use.",               images: [IMGS.phone1, IMGS.keychain1], tags: ["personalized","custom"],            stock: 25, created_at: "2024-02-24" },
  // MDF PHOTO FRAMES
  { id: "47", name: "MDF Photo Frame Classic",      price: 749,  category: "MDF Photo Frames",            description: "Sturdy MDF photo frame with custom printed photo and border.",            images: [IMGS.wood1, IMGS.frame1],     tags: ["photo","gifting","custom"],         stock: 22, created_at: "2024-01-14" },
  { id: "48", name: "MDF Collage Frame",            price: 999,  category: "MDF Photo Frames",            description: "Multi-slot MDF frame for your favorite photo collage.",                   images: [IMGS.frame2, IMGS.wood1],     tags: ["photo","gifting","premium"],        stock: 16, created_at: "2024-03-24" },
  // T-SHIRTS
  { id: "49", name: "Custom Photo T-Shirt",         price: 499,  category: "T-Shirts",                    description: "Full-color photo printed T-shirt in soft 100% cotton fabric.",           images: [IMGS.tshirt1, IMGS.tshirt2],  tags: ["photo","personalized","gifting"],   stock: 40, created_at: "2024-01-06" },
  { id: "50", name: "Name Print T-Shirt",           price: 399,  category: "T-Shirts",                    description: "Round-neck T-shirt with custom name and graphic print.",                  images: [IMGS.tshirt2, IMGS.tshirt1],  tags: ["custom","gifting","personalized"],  stock: 50, created_at: "2024-02-06" },
  // CUSTOM CUT BOARDS
  { id: "51", name: "Personalized Cutting Board",   price: 1099, category: "Custom Cut Boards",           description: "Engraved wooden cutting board — a premium housewarming gift.",            images: [IMGS.wood1, IMGS.frame2],     tags: ["personalized","gifting","premium"], stock: 14, created_at: "2024-02-20" },
  { id: "52", name: "Acrylic Custom Cut Board",     price: 899,  category: "Custom Cut Boards",           description: "Clear acrylic cutting board with custom name and design engraving.",       images: [IMGS.frame1, IMGS.wood1],     tags: ["custom","premium","gifting"],       stock: 10, created_at: "2024-04-04" },
]
