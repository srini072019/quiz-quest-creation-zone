
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_INSTRUCTORS: '/admin/instructors',
  ADMIN_CANDIDATES: '/admin/candidates',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_EXAMS: '/admin/exams',
  ADMIN_STATISTICS: '/admin/statistics',
  
  // Instructor routes
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_SUBJECTS: '/instructor/subjects',
  INSTRUCTOR_QUESTIONS: '/instructor/questions',
  INSTRUCTOR_EXAMS: '/instructor/exams',
  INSTRUCTOR_RESULTS: '/instructor/results',
  
  // Candidate routes
  CANDIDATE_DASHBOARD: '/candidate',
  CANDIDATE_COURSES: '/candidate/courses',
  CANDIDATE_EXAMS: '/candidate/exams',
  CANDIDATE_PROFILE: '/candidate/profile',
  CANDIDATE_TAKE_EXAM: '/candidate/exam/:id',
};
