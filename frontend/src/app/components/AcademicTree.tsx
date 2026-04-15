import { useAuth } from '../context/AuthContext';
import AdminAcademicTree from './AdminAcademicTree';
import FacultyAcademicTree from './FacultyAcademicTree';

/**
 * AcademicTree — Router component
 *
 * Renders the appropriate academic tree based on the current user's role:
 * - SuperAdmin / Dean / HOD → AdminAcademicTree (hierarchical, role-filtered)
 * - Faculty → FacultyAcademicTree (assignment-based, cross-school)
 */
export default function AcademicTree() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  if (currentUser.role === 'Faculty') {
    return <FacultyAcademicTree />;
  }

  return <AdminAcademicTree />;
}
