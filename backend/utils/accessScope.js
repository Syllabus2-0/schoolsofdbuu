const idsEqual = (left, right) => {
  if (left == null || right == null) return false;
  return left.toString() === right.toString();
};

const isTopLevelAdmin = (user) =>
  user && (user.role === "SuperAdmin" || user.role === "Registrar");

const hasAssignedYear = (user, yearOrder) => {
  const assignedYears = Array.isArray(user?.assignedYears) ? user.assignedYears : [];
  if (assignedYears.length === 0) return true;
  return assignedYears.includes(Number(yearOrder));
};

const isUnassignedUser = (user) => user && (user.schoolId == null);

const canAccessSchool = (user, schoolId) => {
  if (!user) return false;
  if (isTopLevelAdmin(user)) return true;
  if (user.role === "Dean" || user.role === "HOD" || user.role === "Faculty") {
    return idsEqual(user.schoolId, schoolId);
  }
  return false;
};

const canAccessDepartment = (user, department) => {
  if (!user || !department) return false;
  if (isTopLevelAdmin(user)) return true;
  if (user.role === "Dean") return idsEqual(user.schoolId, department.schoolId);
  if (user.role === "HOD") return idsEqual(user.departmentId, department._id);
  if (user.role === "Faculty") {
    if (user.departmentId) return idsEqual(user.departmentId, department._id);
    return idsEqual(user.schoolId, department.schoolId);
  }
  return false;
};

const canAccessProgram = (user, program, department) => {
  if (!program || !department) return false;
  return canAccessDepartment(user, department);
};

const canAccessSubject = (user, subject, department) => {
  if (!subject || !department) return false;
  if (!canAccessDepartment(user, department)) return false;
  if (user.role === "HOD") return hasAssignedYear(user, subject.yearOrder);
  return true;
};

const canAccessUserRecord = (user, targetUser) => {
  if (!user || !targetUser) return false;
  if (isTopLevelAdmin(user)) return true;
  if (user.role === "Dean") {
    if (targetUser.role === "SuperAdmin" || targetUser.role === "Registrar") return false;
    return idsEqual(user.schoolId, targetUser.schoolId) || isUnassignedUser(targetUser);
  }
  if (user.role === "HOD") {
    if (targetUser.role === "SuperAdmin" || targetUser.role === "Registrar") return false;
    if (idsEqual(user.departmentId, targetUser.departmentId)) return true;
    return targetUser.role === "Faculty" && idsEqual(user.schoolId, targetUser.schoolId);
  }
  if (user.role === "Faculty") {
    return idsEqual(user._id, targetUser._id);
  }
  return false;
};

module.exports = {
  idsEqual,
  hasAssignedYear,
  canAccessSchool,
  canAccessDepartment,
  canAccessProgram,
  canAccessSubject,
  canAccessUserRecord,
  isTopLevelAdmin,
};
