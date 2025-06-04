// src/components/Layout.js
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
