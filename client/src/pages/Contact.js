import React from "react";
import Layout from "./../components/Layout";
import { BiMailSend, BiPhoneCall, BiSupport } from "react-icons/bi";
const Contact = () => {
  // FIXED BUG: missing react-icons package
  return (
    <Layout title="Contact Us - Ecommerce App">
      <div className="row contactus">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <h1 className="bg-dark p-2 text-white text-center">CONTACT US</h1>
          <p className="text-justify mt-2">
            For any queries about our product, feel free to call anytime. We are
            available 24/7.  
          </p>
          <p className="mt-3">
            <BiMailSend data-testid="email-icon" /> : www.help@ecommerceapp.com
          </p>
          <p className="mt-3">
            <BiPhoneCall data-testid="phone-icon" /> : 012-3456789
          </p>
          <p className="mt-3">
            <BiSupport data-testid="support-icon" /> : 1800-0000-0000 (toll free)
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;