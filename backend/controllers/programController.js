const Program = require("../models/Program");
const Department = require("../models/Department");

// GET /api/programs?departmentId=
exports.getPrograms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;

    // Scope for Dean: programs in their school's departments
    if (req.user.role === "Dean" && req.user.schoolId) {
      const deptIds = await Department.find({ schoolId: req.user.schoolId }).distinct("_id");
      filter.departmentId = { $in: deptIds };
    }
    // Scope for HOD/Faculty: programs in their department
    if ((req.user.role === "HOD" || req.user.role === "Faculty") && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
    }

    const programs = await Program.find(filter)
      .populate("departmentId", "name schoolId")
      .sort("name");
    res.json(programs);
  } catch (err) {
    console.error("getPrograms error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/programs/:id
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate("departmentId", "name schoolId");
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  } catch (err) {
    console.error("getProgram error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/programs
exports.createProgram = async (req, res) => {
  try {
    const { name, level, duration, startYear, departmentId, intakeStats } = req.body;
    if (!name || !level || !duration || !startYear || !departmentId) {
      return res.status(400).json({ message: "name, level, duration, startYear, departmentId are required" });
    }

    // Scope check for Dean
    if (req.user.role === "Dean") {
      const dept = await Department.findById(departmentId);
      if (!dept || dept.schoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({ message: "Cannot create program in another school's department" });
      }
    }

    const program = await Program.create({
      name, level, duration, startYear, departmentId,
      intakeStats: intakeStats || [],
    });
    res.status(201).json(program);
  } catch (err) {
    console.error("createProgram error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    // Scope check for Dean
    if (req.user.role === "Dean") {
      const dept = await Department.findById(program.departmentId);
      if (!dept || dept.schoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({ message: "Cannot update program in another school" });
      }
    }

    const { name, level, duration, startYear, intakeStats } = req.body;
    if (name) program.name = name;
    if (level) program.level = level;
    if (duration) program.duration = duration;
    if (startYear) program.startYear = startYear;
    if (intakeStats) program.intakeStats = intakeStats;

    await program.save();
    res.json(program);
  } catch (err) {
    console.error("updateProgram error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    if (req.user.role === "Dean") {
      const dept = await Department.findById(program.departmentId);
      if (!dept || dept.schoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({ message: "Cannot delete program in another school" });
      }
    }

    await program.deleteOne();
    res.json({ message: "Program deleted" });
  } catch (err) {
    console.error("deleteProgram error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
