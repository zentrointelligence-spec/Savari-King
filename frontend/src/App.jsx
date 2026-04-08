import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importation de Font Awesome

import "leaflet/dist/leaflet.css";
import "./utils/leafletConfig";

// Context Providers
import { HomepageProvider } from "./contexts/HomepageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

// Common components import
import Layout from "./components/common/Layout";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";
import AdminRoute from "./components/admin/AdminRoute";
import PrivateRoute from "./components/common/PrivateRoute";

// Pages import
import PageWithTitle from "./components/common/PageWithTitle"; // Assurez-vous que le chemin est correct
import HomePage from "./pages/HomePage";
import TourDetailPage from "./pages/TourDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import BookingReviewPage from "./pages/BookingReviewPage";
import ToursPage from "./pages/ToursPage";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminToursPage from "./pages/admin/AdminToursPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminTourCategoriesPage from "./pages/admin/AdminTourCategoriesPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminRecommendationStatsPage from "./pages/admin/AdminRecommendationStatsPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminQuoteReviewPage from "./pages/admin/AdminQuoteReviewPage";
import AdminRevisionHistoryPage from "./pages/admin/AdminRevisionHistoryPage";
import AdminEmailLogsPage from "./pages/admin/AdminEmailLogsPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import AdminBlogFormPage from "./pages/admin/AdminBlogFormPage";
import AdminBlogCommentsPage from "./pages/admin/AdminBlogCommentsPage";
import MyAccountPage from "./pages/MyAccountPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogListPage from "./pages/BlogListPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import PaymentPage from "./pages/PaymentPage";
import DetailedQuotePage from "./pages/DetailedQuotePage";
import GeneralQuotePage from "./pages/GeneralQuotePage";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import GalleryPage from "./pages/GalleryPage";
// import AdminTourDetailPage from "./pages/admin/AdminTourDetailPage";

// Dans src/index.js ou App.js
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

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
            {/* ... (autres routes admin à venir) */}
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
      </Layout>
      {/* <FloatingWhatsApp /> */}
      </CurrencyProvider>
    </>
  );
}

export default App;
