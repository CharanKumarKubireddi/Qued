require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  ClerkExpressRequireAuth,
  clerkClient,
} = require("@clerk/clerk-sdk-node");
const { ClerkSync } = require("./middleware/clerkAuth");

// Payment Imports
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Models
const Course = require("./models/Course");
const User = require("./models/User");

const app = express();
app.use(express.json());

// --- CORS Configuration (Better Security) ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Allow Vercel URL in production
    credentials: true,
  })
);

// --- RAZORPAY CONFIGURATION ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // ✅ Moved to .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // ✅ Moved to .env
});

// --- 1. SETUP STATIC FILE SERVING ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 2. CONFIGURE FILE STORAGE ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const requireAuth = [ClerkExpressRequireAuth(), ClerkSync];

// --- ROUTES ---

// FILE UPLOAD ENDPOINT (FIXED)
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // ✅ FIXED: Dynamic URL generation
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 1. GET ALL COURSES (Public)
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE COURSE (Protected)
app.post("/api/courses", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      image,
      lectures,
      previewVideo,
      pdfNotes,
    } = req.body;

    const newCourse = new Course({
      title,
      description,
      price,
      category,
      instructorId: req.user.id,
      instructorName: req.user.name || "Instructor",
      image: image || "https://via.placeholder.com/300",
      previewVideo: previewVideo || "",
      lectures: lectures || [],
      pdfNotes: pdfNotes || [],
      studentsEnrolled: [],
    });

    await newCourse.save();
    res.json({ message: "Course Created", course: newCourse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// 3. PURCHASE COURSE (Legacy) - Kept for reference
app.post("/api/purchase", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.studentsEnrolled.includes(req.user.id)) {
      course.studentsEnrolled.push(req.user.id);
      await course.save();
    }
    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Purchase failed" });
  }
});

// 4. PAYMENT: CREATE ORDER
app.post("/api/payment/checkout", requireAuth, async (req, res) => {
  try {
    const { courseIds } = req.body;

    // Recalculate price on backend for security
    const courses = await Course.find({ _id: { $in: courseIds } });
    const subTotal = courses.reduce((sum, course) => sum + course.price, 0);

    // Calculate 7% Platform Fee
    const platformFee = Math.round(subTotal * 0.07);
    const totalAmount = subTotal + platformFee;

    const options = {
      amount: totalAmount * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      subTotal,
      platformFee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// 5. PAYMENT: VERIFY & ENROLL (FIXED)
app.post("/api/payment/verify", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseIds,
    } = req.body;

    // 🔍 DEBUGGING: Log exactly what we received
    console.log("🔹 VERIFYING PAYMENT:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // 1. Check if we actually received the data (Critical for "50% failure" bug)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Missing payment details from frontend" });
    }

    // 2. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ SIGNATURE MISMATCH:", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      return res.status(400).json({ error: "Invalid Payment Signature" });
    }

    // 3. ENROLL USER & CLEAR CART (The Fix)
    const userId = req.user.id;

    // Enroll in all courses
    // Use $addToSet to prevent duplicate enrollment in one go
    await User.updateOne(
      { _id: userId },
      {
        $addToSet: { enrolledCourses: { $each: courseIds } }, // Add courses
        $pull: { cart: { $in: courseIds } }, // 🗑️ REMOVE FROM CART
      }
    );

    // Also update Course models to show student count
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $addToSet: { studentsEnrolled: userId } }
    );

    console.log("✅ PAYMENT SUCCESS: User enrolled and cart cleared.");
    res.json({
      success: true,
      message: "Payment Verified, Enrolled, and Cart Cleared",
    });
  } catch (err) {
    console.error("❌ VERIFICATION ERROR:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// 6. TEACHER STATS
app.get("/api/teacher/stats", requireAuth, async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id }).populate(
      "studentsEnrolled",
      "name email"
    );
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teacher stats" });
  }
});

// 7. GET CURRENT USER
app.get("/api/me", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: "User not found in DB" });
    }
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// 8. UPDATE COURSE
app.put("/api/courses/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      category,
      image,
      previewVideo,
      lectures,
      pdfNotes,
    } = req.body;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // SECURITY CHECK: Temporarily Commented Out
    // if (course.instructorId !== req.user.id) {
    //   return res.status(403).json({ error: "Unauthorized" });
    // }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.category = category || course.category;
    course.image = image || course.image;
    course.previewVideo = previewVideo || course.previewVideo;
    course.lectures = lectures || course.lectures;
    course.pdfNotes = pdfNotes || course.pdfNotes;

    await course.save();
    res.json({ message: "Course Updated Successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

// 9. DELETE COURSE
app.delete("/api/courses/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // SECURITY CHECK
    // if (course.instructorId !== req.user.id) { return res.status(403).json({ error: "Unauthorized" }); }

    await Course.findByIdAndDelete(id);
    res.json({ message: "Course Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// 10. ADMIN STATS
app.get("/api/admin/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
    }

    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "teacher" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();

    const allUsers = await User.find().select("name email role").lean();

    const coursesRaw = await Course.find()
      .populate("studentsEnrolled", "name email")
      .lean();

    const coursesList = coursesRaw.map((course) => {
      const instructor = allUsers.find(
        (user) => user._id.toString() === course.instructorId
      );
      return {
        ...course,
        instructorName: instructor ? instructor.name : "Unknown",
        instructorEmail: instructor ? instructor.email : "No Email",
      };
    });

    const studentsList = allUsers
      .filter((u) => u.role === "student")
      .map((student) => {
        const enrolledCourses = coursesList.filter((course) =>
          course.studentsEnrolled.some(
            (s) => s._id.toString() === student._id.toString()
          )
        );
        return {
          ...student,
          enrolledCount: enrolledCourses.length,
          enrolledCourseTitles: enrolledCourses.map((c) => c.title),
        };
      });

    const instructorsList = allUsers
      .filter((u) => u.role === "teacher")
      .map((instructor) => {
        const myCourses = coursesList.filter(
          (c) => c.instructorId === instructor._id.toString()
        );
        return {
          ...instructor,
          coursesUploaded: myCourses.length,
          courseTitles: myCourses.map((c) => c.title),
        };
      });

    res.json({
      stats: { totalUsers, totalInstructors, totalStudents, totalCourses },
      data: {
        instructors: instructorsList,
        students: studentsList,
        courses: coursesList,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin data" });
  }
});

// 11. ADMIN DELETE USER
app.delete("/api/admin/user/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// SYNC ROUTE
app.post("/api/sync", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { role } = req.body;
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "New User";
      user = new User({
        clerkId: userId,
        email,
        name,
        role: role || "student",
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));
