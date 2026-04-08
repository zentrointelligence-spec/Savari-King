import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-6 border-b pb-4">
    {children}
  </h2>
);

const TermsPage = () => {
  return (
    <div className="bg-white">
      {/* Section Héro */}
      <div className="py-24 bg-gray-100 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold text-secondary">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Please read our terms carefully before booking a trip with us.
          </p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto prose lg:prose-xl text-gray-700">
          <p className="text-sm text-gray-500">Last updated: July 29, 2025</p>

          <SectionTitle>1. Booking Policy</SectionTitle>
          <p>
            <strong>1.1. Booking Window:</strong> To ensure high-quality
            organization, all booking inquiries must be made a minimum of{" "}
            <strong>five (5) calendar days</strong> before the desired start
            date of the trip. The system will not allow the selection of dates
            within this period.
          </p>
          <p>
            <strong>1.2. Inquiry Process:</strong> Submitting a booking form on
            our website constitutes a <strong>request for a quote</strong> and
            in no way guarantees the final booking of the trip.
          </p>
          <p>
            <strong>1.3. Booking Confirmation:</strong> A booking is considered{" "}
            <strong>confirmed</strong> only after the following steps are
            completed:
            <ul>
              <li>The sending of a finalized quote by our team.</li>
              <li>
                The receipt of the full payment of the quote amount via our
                secure payment gateway.
              </li>
            </ul>
          </p>
          <p>
            <strong>1.4. User Account:</strong> Creating a user account and
            verifying the associated email address are mandatory prerequisites
            for submitting a booking inquiry.
          </p>

          <SectionTitle>2. Quote Policy</SectionTitle>
          <p>
            <strong>2.1. Response Time:</strong> Our team is committed to
            reviewing each booking inquiry and responding within an indicative
            timeframe of <strong>30 minutes</strong> during our business hours.
          </p>
          <p>
            <strong>2.2. Quote Delivery:</strong> We are committed to sending a
            finalized and personalized quote within a maximum of{" "}
            <strong>2 hours</strong> after your inquiry submission.
          </p>
          <p>
            <strong>2.3. Quote Validity:</strong> All quotes sent are strictly
            valid for <strong>48 hours</strong> from the time they are sent.
            After this period, prices and the availability of services are no
            longer guaranteed.
          </p>

          <SectionTitle>3. Cancellation and Refund Policy</SectionTitle>
          <p>
            <strong>3.1. Cancellation Before Payment:</strong> You may cancel
            your booking inquiry at no charge at any time before payment has
            been made.
          </p>
          <p>
            <strong>3.2. Cancellation After Payment:</strong> A cancellation
            with a <strong>full refund</strong> is possible if and only if it is
            made within <strong>exactly 24 hours</strong> following the
            confirmation time of your payment. After this 24-hour period, the
            booking becomes strictly non-refundable.
          </p>

          <SectionTitle>4. Payment Policy</SectionTitle>
          <p>
            <strong>4.1. Currencies:</strong> Prices may be displayed in several
            currencies (INR, USD, EUR) for indicative purposes. The final
            payment will be processed in the currency specified on the quote.
          </p>
          <p>
            <strong>4.2. Security:</strong> All payments are processed through a
            secure third-party payment gateway. We do not store any credit card
            information on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
