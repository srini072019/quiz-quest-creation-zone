import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Clock,
  UserCheck
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface EnrolledCourseProps {
  title: string;
  instructor: string;
  progress: number;
  nextExam?: {
    title: string;
    date: string;
  };
}

const EnrolledCourse = ({ title, instructor, progress, nextExam }: EnrolledCourseProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Instructor: {instructor}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="#">View Course</Link>
        </Button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-700 dark:text-gray-300">Progress</span>
          <span className="font-medium text-assessify-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {nextExam && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
            <CalendarCheck size={16} className="mr-2 text-assessify-primary" />
            Next Exam: {nextExam.title}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 pl-6">
            {nextExam.date}
          </div>
        </div>
      )}
    </Card>
  );
};

interface UpcomingExamProps {
  title: string;
  course: string;
  date: string;
  duration: string;
  status: 'scheduled' | 'available' | 'completed';
}

const UpcomingExam = ({ title, course, date, duration, status }: UpcomingExamProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Available</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Scheduled</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{course}</p>
        </div>
        {getStatusBadge()}
      </div>
      <div className="mt-4 flex items-center text-sm">
        <div className="flex items-center text-gray-500 dark:text-gray-400 mr-4">
          <CalendarCheck size={14} className="mr-1" />
          {date}
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Clock size={14} className="mr-1" />
          {duration}
        </div>
      </div>
      <div className="mt-4">
        {status === 'available' ? (
          <Button className="w-full bg-assessify-primary hover:bg-assessify-primary/90">
            Take Exam
          </Button>
        ) : status === 'scheduled' ? (
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            View Results
          </Button>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { authState } = useAuth();
  const userDisplayName = authState.user?.displayName || 'Student';

  const [enrolledCourses] = useState<EnrolledCourseProps[]>([
    {
      title: "Introduction to Computer Science",
      instructor: "Dr. Jane Smith",
      progress: 65,
      nextExam: {
        title: "Data Structures Quiz",
        date: "Apr 12, 2025 • 10:00 AM"
      }
    },
    {
      title: "Advanced Mathematics",
      instructor: "Prof. Robert Johnson",
      progress: 42,
      nextExam: {
        title: "Calculus Mid-term",
        date: "Apr 18, 2025 • 2:00 PM"
      }
    },
    {
      title: "English Literature",
      instructor: "Dr. Emily Williams",
      progress: 88,
    },
  ]);

  const [upcomingExams] = useState<UpcomingExamProps[]>([
    {
      title: "Data Structures Quiz",
      course: "Introduction to Computer Science",
      date: "Apr 12, 2025",
      duration: "45 minutes",
      status: 'scheduled'
    },
    {
      title: "Calculus Mid-term",
      course: "Advanced Mathematics",
      date: "Apr 18, 2025",
      duration: "120 minutes",
      status: 'scheduled'
    },
    {
      title: "Programming Fundamentals",
      course: "Introduction to Computer Science",
      date: "Apr 8, 2025",
      duration: "60 minutes",
      status: 'available'
    },
    {
      title: "Literary Analysis",
      course: "English Literature",
      date: "Apr 5, 2025",
      duration: "90 minutes",
      status: 'completed'
    },
  ]);

  return (
    <CandidateLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
          <div className="flex items-center mt-2">
            <UserCheck className="h-5 w-5 text-assessify-primary mr-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-semibold">{userDisplayName}</span> - <span className="bg-assessify-accent text-assessify-primary px-2 py-0.5 rounded-full text-sm font-medium">Candidate</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-assessify-accent rounded-full">
                <BookOpen className="h-6 w-6 text-assessify-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-assessify-accent rounded-full">
                <CalendarCheck className="h-6 w-6 text-assessify-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-assessify-accent rounded-full">
                <CheckCircle className="h-6 w-6 text-assessify-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Courses</h2>
            <Button variant="outline" asChild>
              <Link to="#">Browse All Courses</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <EnrolledCourse
                key={index}
                title={course.title}
                instructor={course.instructor}
                progress={course.progress}
                nextExam={course.nextExam}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exams</h2>
            <Button variant="outline" asChild>
              <Link to="#">View All Exams</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((exam, index) => (
              <UpcomingExam
                key={index}
                title={exam.title}
                course={exam.course}
                date={exam.date}
                duration={exam.duration}
                status={exam.status}
              />
            ))}
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default Dashboard;
