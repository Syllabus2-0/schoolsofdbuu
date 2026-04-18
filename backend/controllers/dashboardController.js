const School = require("../models/School");
const Department = require("../models/Department");
const Program = require("../models/Program");
const Subject = require("../models/Subject");
const Syllabus = require("../models/Syllabus");
const User = require("../models/User");
const { isTopLevelAdmin } = require("../utils/accessScope");

// GET /api/dashboard/stats — role-scoped statistics
exports.getStats = async (req, res) => {
  try {
    const { role, schoolId, departmentId } = req.user;
    const stats = {};

    if (isTopLevelAdmin(req.user)) {
      stats.totalSchools = await School.countDocuments();
      stats.totalDepartments = await Department.countDocuments();
      stats.totalPrograms = await Program.countDocuments();
      stats.totalSyllabi = await Syllabus.countDocuments();
      stats.totalUsers = await User.countDocuments();
      stats.publishedSyllabi = await Syllabus.countDocuments({ status: "Published" });
    } else if (role === "Dean" && schoolId) {
      const deptIds = await Department.find({ schoolId }).distinct("_id");
      stats.totalDepartments = deptIds.length;
      stats.totalPrograms = await Program.countDocuments({ departmentId: { $in: deptIds } });
      const programIds = await Program.find({ departmentId: { $in: deptIds } }).distinct("_id");
      stats.pendingApproval = await Syllabus.countDocuments({
        programId: { $in: programIds },
        status: "Pending Dean Approval",
      });
      stats.publishedSyllabi = await Syllabus.countDocuments({
        programId: { $in: programIds },
        status: "Published",
      });
    } else if (role === "HOD" && departmentId) {
      const programIds = await Program.find({ departmentId }).distinct("_id");
      stats.totalPrograms = programIds.length;
      stats.facultyMembers = await User.countDocuments({ departmentId, role: "Faculty" });
      stats.pendingReview = await Syllabus.countDocuments({
        programId: { $in: programIds },
        status: "Pending HOD Review",
      });
      stats.totalSyllabi = await Syllabus.countDocuments({ programId: { $in: programIds } });
    } else if (role === "Faculty") {
      stats.mySyllabi = await Syllabus.countDocuments({ facultyId: req.user._id });
      stats.inDraft = await Syllabus.countDocuments({ facultyId: req.user._id, status: "Draft" });
      stats.underReview = await Syllabus.countDocuments({
        facultyId: req.user._id,
        status: { $in: ["Pending HOD Review", "Pending Dean Approval"] },
      });
      stats.published = await Syllabus.countDocuments({ facultyId: req.user._id, status: "Published" });
    }

    res.json(stats);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dashboard/analytics — intake analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { role, schoolId, departmentId } = req.user;
    let filter = {};

    if (role === "Dean" && schoolId) {
      const deptIds = await Department.find({ schoolId }).distinct("_id");
      filter.departmentId = { $in: deptIds };
    } else if ((role === "HOD" || role === "Faculty") && departmentId) {
      filter.departmentId = departmentId;
    }
    // Registrar/SuperAdmin: no filter (all programs)

    const programs = await Program.find(filter)
      .populate({
        path: "departmentId",
        select: "name schoolId",
        populate: { path: "schoolId", select: "name code" },
      })
      .sort("name");

    // Aggregate intake by year
    const intakeByYear = {};
    programs.forEach((prog) => {
      prog.intakeStats.forEach((stat) => {
        intakeByYear[stat.year] = (intakeByYear[stat.year] || 0) + stat.count;
      });
    });

    const chartData = Object.entries(intakeByYear)
      .map(([year, students]) => ({ year, students }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    res.json({
      programs: programs.map((p) => ({
        id: p._id,
        name: p.name,
        level: p.level,
        department: p.departmentId?.name,
        school: p.departmentId?.schoolId?.code,
        intakeStats: p.intakeStats,
      })),
      chartData,
      totalPrograms: programs.length,
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
