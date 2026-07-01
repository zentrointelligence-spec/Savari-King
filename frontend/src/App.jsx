import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importation de Font Awesome

import "leaflet/dist/leaflet.css";
import "./utils/leafletConfig";

// Context Providers
import { HomepageProvider } from "./contexts/HomepageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

// Common components import (kept eager: used by every route / shell)
import Layout from "./components/common/Layout";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";
import AdminRoute from "./components/admin/AdminRoute";
import PrivateRoute from "./components/common/PrivateRoute";
import PageWithTitle from "./components/common/PageWithTitle";

// Pages — lazy-loaded for route-level code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const TourDetailPage = lazy(() => import("./pages/TourDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));
const MyReviewsPage = lazy(() => import("./pages/MyReviewsPage"));
const BookingReviewPage = lazy(() => import("./pages/BookingReviewPage"));
const ToursPage = lazy(() => import("./pages/ToursPage"));

// Admin Pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminToursPage = lazy(() => import("./pages/admin/AdminToursPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminCatalogPage = lazy(() => import("./pages/admin/AdminCatalogPage"));
const AdminTourCategoriesPage = lazy(() => import("./pages/admin/AdminTourCategoriesPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminRecommendationStatsPage = lazy(() => import("./pages/admin/AdminRecommendationStatsPage"));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurityPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminQuoteReviewPage = lazy(() => import("./pages/admin/AdminQuoteReviewPage"));
const AdminRevisionHistoryPage = lazy(() => import("./pages/admin/AdminRevisionHistoryPage"));
const AdminEmailLogsPage = lazy(() => import("./pages/admin/AdminEmailLogsPage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminBlogFormPage = lazy(() => import("./pages/admin/AdminBlogFormPage"));
const AdminBlogCommentsPage = lazy(() => import("./pages/admin/AdminBlogCommentsPage"));
const AdminLeadsPage = lazy(() => import("./pages/admin/AdminLeadsPage"));
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingDetailsPage = lazy(() => import("./pages/BookingDetailsPage"));
const BookingConfirmationPage = lazy(() => import("./pages/BookingConfirmationPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const DetailedQuotePage = lazy(() => import("./pages/DetailedQuotePage"));
const GeneralQuotePage = lazy(() => import("./pages/GeneralQuotePage"));
const DestinationsPage = lazy(() => import("./pages/DestinationsPage"));
const DestinationDetailPage = lazy(() => import("./pages/DestinationDetailPage"));
const DynamicSeoLandingPage = lazy(() => import("./pages/DynamicSeoLandingPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
// import AdminTourDetailPage from "./pages/admin/AdminTourDetailPage";

// Dan src/index.js ou App.js
import AOS from "aos";
import "aos/dist/aos.css";

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-pulse text-gray-500">Loading…</div>
  </div>
);

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />
      <CurrencyProvider>
        <Layout>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Routes Publiques */}
          <Route
            path="/"
            element={
              <PageWithTitle title="Home - Ebenezer Tours">
                <HomePage />
              </PageWithTitle>
            }
          />
          <Route
            path="/tours"
            element={
              <PageWithTitle title="Our Tour Packages">
                <ToursPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/gallery"
            element={
              <PageWithTitle title="Gallery">
                <GalleryPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/tours/:tourId"
            element={
              <PageWithTitle title="Tour Details">
                <TourDetailPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/book/:tourId"
            element={
              <PageWithTitle title="Book Your Tour">
                <BookingPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/booking-confirmation/:bookingId"
            element={
              <PageWithTitle title="Booking Confirmed">
                <BookingConfirmationPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/about-us"
            element={
              <PageWithTitle title="About Us">
                <AboutUsPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/contact"
            element={
              <PageWithTitle title="Contact Us">
                <ContactPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/terms"
            element={
              <PageWithTitle title="Terms & Conditions">
                <TermsPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/blog"
            element={
              <PageWithTitle title="Travel Blog">
                <BlogPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <PageWithTitle title="Blog Post">
                <BlogPostPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/bookings"
            element={
              <PageWithTitle title="Book Your Trip">
                <BookingsPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/destinations"
            element={
              <PageWithTitle title="Destinations">
                <DestinationsPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/destinations/:slug"
            element={
              <PageWithTitle title="Destination Details">
                <DestinationDetailPage />
              </PageWithTitle>
            }
          />

          {/* Routes d'Authentification */}
          <Route
            path="/login"
            element={
              <PageWithTitle title="Login">
                <LoginPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/register"
            element={
              <PageWithTitle title="Register">
                <RegisterPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PageWithTitle title="Verify Your Email">
                <VerifyEmailPage />
              </PageWithTitle>
            }
          />
          {/* <Route
            path="/forgot-password"
            element={
              <PageWithTitle title="Forgot Password">
                <ForgotPasswordPage />
              </PageWithTitle>
            }
          /> */}
          {/* <Route
            path="/reset-password"
            element={
              <PageWithTitle title="Reset Password">
                <ResetPasswordPage />
              </PageWithTitle>
            }
          /> */}

          {/* Routes Protégées pour les Clients */}
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <PageWithTitle title="My Bookings">
                  <MyBookingsPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <PrivateRoute>
                <PageWithTitle title="Booking Details">
                  <BookingDetailsPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings/:bookingId/payment"
            element={
              <PrivateRoute>
                <PageWithTitle title="Payment">
                  <PaymentPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings/:bookingId/quote/detailed"
            element={
              <PrivateRoute>
                <PageWithTitle title="Detailed Quote">
                  <DetailedQuotePage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings/:bookingId/quote/general"
            element={
              <PrivateRoute>
                <PageWithTitle title="General Quote">
                  <GeneralQuotePage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <PrivateRoute>
                <PageWithTitle title="My Reviews">
                  <MyReviewsPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/review/:bookingId"
            element={
              <PrivateRoute>
                <PageWithTitle title="Leave a Review">
                  <BookingReviewPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <PrivateRoute>
                <PageWithTitle title="My Account">
                  <MyAccountPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />
          <Route
            path="/routes/:slug"
            element={
              <DynamicSeoLandingPage />
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <PageWithTitle title="Notifications">
                  <NotificationsPage />
                </PageWithTitle>
              </PrivateRoute>
            }
          />

          {/* Blog Routes */}
          <Route
            path="/blog"
            element={
              <PageWithTitle title="Travel Blog">
                <BlogListPage />
              </PageWithTitle>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <PageWithTitle title="Blog Article">
                <BlogDetailPage />
              </PageWithTitle>
            }
          />

          {/* Routes Protégées pour l'Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
                <PageWithTitle title="Admin Settings"></PageWithTitle>
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="tours" element={<AdminToursPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="bookings/:bookingId/review" element={<AdminQuoteReviewPage />} />
            <Route path="bookings/:bookingId/revisions" element={<AdminRevisionHistoryPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="catalog" element={<AdminCatalogPage />} />
            <Route
              path="tour-categories"
              element={<AdminTourCategoriesPage />}
            />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="recommendation-stats" element={<AdminRecommendationStatsPage />} />
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="email-logs" element={<AdminEmailLogsPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="blog/new" element={<AdminBlogFormPage />} />
            <Route path="blog/edit/:id" element={<AdminBlogFormPage />} />
            <Route path="blog/comments" element={<AdminBlogCommentsPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
          </Route>

          <Route
            path="*"
            element={
              <PageWithTitle title="Page Not Found">
                <NotFoundPage />
              </PageWithTitle>
            }
          />
        </Routes>
        </Suspense>
      </Layout>
      {/* <FloatingWhatsApp /> */}
      </CurrencyProvider>
    </>
  );
}

export default App;
