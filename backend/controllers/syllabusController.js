const Syllabus = require("../models/Syllabus");
const Program = require("../models/Program");
const Department = require("../models/Department");

// GET /api/syllabi?programId=&facultyId=&status=
exports.getSyllabi = async (req, res) => {
  try {
    const filter = {};
    if (req.query.programId) filter.programId = req.query.programId;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.status) filter.status = req.query.status;

    // Scope for Faculty: only their own syllabi
    if (req.user.role === "Faculty") {
      filter.facultyId = req.user._id;
    }

    // Scope for HOD: syllabi from their department's programs
    if (req.user.role === "HOD" && req.user.departmentId) {
      const programIds = await Program.find({ departmentId: req.user.departmentId }).distinct("_id");
      filter.programId = { $in: programIds };
    }

    // Scope for Dean: syllabi from their school's programs
    if (req.user.role === "Dean" && req.user.schoolId) {
      const deptIds = await Department.find({ schoolId: req.user.schoolId }).distinct("_id");
      const programIds = await Program.find({ departmentId: { $in: deptIds } }).distinct("_id");
      filter.programId = { $in: programIds };
    }

    const syllabi = await Syllabus.find(filter)
      .populate("programId", "name level departmentId")
      .populate("subjectId", "name yearLabel")
      .populate("facultyId", "name email")
      .sort("-updatedAt");
    res.json(syllabi);
  } catch (err) {
    console.error("getSyllabi error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/syllabi/:id
exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate("programId", "name level duration departmentId")
      .populate("subjectId", "name yearLabel")
      .populate("facultyId", "name email");
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });
    res.json(syllabus);
  } catch (err) {
    console.error("getSyllabus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/syllabi — Faculty creates
exports.createSyllabus = async (req, res) => {
  try {
    const { programId, subjectId, semesters } = req.body;
    if (!programId || !semesters) {
      return res.status(400).json({ message: "programId and semesters are required" });
    }

    const syllabus = await Syllabus.create({
      programId,
      subjectId: subjectId || null,
      facultyId: req.user._id,
      status: "Pending HOD Review",
      semesters,
      comments: [],
    });

    const populated = await Syllabus.findById(syllabus._id)
      .populate("programId", "name level")
      .populate("facultyId", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("createSyllabus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/syllabi/:id — Faculty updates own draft
exports.updateSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });

    // Only faculty who owns this syllabus can update, and only if Draft
    if (req.user.role === "Faculty") {
      if (syllabus.facultyId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Cannot update another faculty's syllabus" });
      }
      if (syllabus.status !== "Draft") {
        return res.status(400).json({ message: "Can only edit syllabi in Draft status" });
      }
    }

    const { semesters, status } = req.body;
    if (semesters) syllabus.semesters = semesters;
    if (status && req.user.role !== "Faculty") syllabus.status = status;
    await syllabus.save();
    res.json(syllabus);
  } catch (err) {
    console.error("updateSyllabus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/syllabi/:id/approve — HOD or Dean approves
exports.approveSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });

    if (req.user.role === "HOD") {
      if (syllabus.status !== "Pending HOD Review") {
        return res.status(400).json({ message: "Syllabus is not pending HOD review" });
      }
      // Scope check: HOD's department programs only
      const program = await Program.findById(syllabus.programId);
      if (!program || program.departmentId.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({ message: "Cannot approve syllabus from another department" });
      }
      syllabus.status = "Pending Dean Approval";
      syllabus.hodSignature = req.user.name;
    } else if (req.user.role === "Dean") {
      if (syllabus.status !== "Pending Dean Approval") {
        return res.status(400).json({ message: "Syllabus is not pending Dean approval" });
      }
      // Scope check: Dean's school programs only
      const program = await Program.findById(syllabus.programId);
      if (!program) return res.status(404).json({ message: "Program not found" });
      const dept = await Department.findById(program.departmentId);
      if (!dept || dept.schoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({ message: "Cannot approve syllabus from another school" });
      }
      syllabus.status = "Published";
      syllabus.deanSignature = req.user.name;
    } else {
      return res.status(403).json({ message: "Only HOD or Dean can approve" });
    }

    await syllabus.save();
    res.json(syllabus);
  } catch (err) {
    console.error("approveSyllabus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/syllabi/:id/reject — HOD or Dean rejects back to Draft
exports.rejectSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });

    const { comment } = req.body;

    if (req.user.role === "HOD" && syllabus.status !== "Pending HOD Review") {
      return res.status(400).json({ message: "Syllabus is not pending HOD review" });
    }
    if (req.user.role === "Dean" && syllabus.status !== "Pending Dean Approval") {
      return res.status(400).json({ message: "Syllabus is not pending Dean approval" });
    }

    syllabus.status = "Draft";
    if (comment) {
      syllabus.comments.push({
        userId: req.user._id,
        userName: req.user.name,
        text: `Rejected: ${comment}`,
        timestamp: new Date(),
      });
    }

    await syllabus.save();
    res.json(syllabus);
  } catch (err) {
    console.error("rejectSyllabus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/syllabi/:id/comments — add comment
exports.addComment = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ message: "Syllabus not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    // Faculty can only comment on their own syllabi
    if (req.user.role === "Faculty" && syllabus.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Cannot comment on another faculty's syllabus" });
    }

    syllabus.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      text,
      timestamp: new Date(),
    });

    await syllabus.save();
    res.json(syllabus);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
