// src/components/Navbar.js

import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import LogoDomly from "../assets/img/Domly_Logo.png";
import SignInModal from "./SignInModal";
import defaultAvatar from "../assets/img/defaultAvatar.png";
import AddFundsModal from "../components/AddFundsModal";

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <div className="container-fluid nav-bar bg-white fixed-top">
        <nav className="navbar navbar-expand-lg bg-white navbar-light py-0 px-4">
          <Link to="/" className="navbar-brand d-flex align-items-center text-center">
            <div className="p-2 me-2">
              <img
                className="img-fluid"
                src={LogoDomly}
                alt="Domly Logo"
                style={{ width: "60px", height: "60px" }}
              />
            </div>
            <h1 className="m-0 text-primary">Domly.kz</h1>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto align-items-center">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-item nav-link ${isActive ? "active" : ""}`}
              >
                Home
              </NavLink>

              <NavLink
                to="/subscribe"
                className={({ isActive }) => `nav-item nav-link ${isActive ? "active" : ""}`}
              >
                Premium
              </NavLink>

              <div className="nav-item dropdown">
                <Link
                  to="#"
                  className="nav-link dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Property
                </Link>
                <ul className="dropdown-menu rounded-0 m-0">
                  <li>
                    <NavLink to="/buy-property" className="dropdown-item">
                      Buy Property
                    </NavLink>
                  </li>

                  {/* SHOW 'Sell Property' ONLY if user IS LOGGED IN */}
                  {user && (
                    <li>
                      <NavLink to="/sell-property" className="dropdown-item">
                        Sell Property
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>

              {/* Если нет user, показываем кнопку Sign In */}
              {!user ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="nav-item nav-link btn"
                >
                  Sign In
                </button>
              ) : (
                <>
                  {/* Add Funds (видно только, когда user есть) */}
                  <button
                    onClick={() => setShowAddFunds(true)}
                    className="nav-item nav-link btn"
                  >
                    Add Funds
                  </button>

                  {/* Дропдаун с меню пользователя */}
                  <div className="nav-item dropdown d-flex align-items-center">
                    <button
                      className="nav-link dropdown-toggle d-flex align-items-center"
                      id="userMenu"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ border: "none", background: "none" }}
                    >
                      <img
                        src={user.avatar || defaultAvatar}
                        alt="Avatar"
                        className="rounded-circle me-2"
                        style={{ width: "32px", height: "32px" }}
                      />
                      <span>{user.name}</span>
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="userMenu"
                    >
                      <li>
                        <NavLink to="/my-ads" className="dropdown-item">
                          My Ads
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/messages" className="dropdown-item">
                          Messages
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/account-payments" className="dropdown-item">
                          Account & Payments
                        </NavLink>
                      </li>
                      <li>
                        <button onClick={logout} className="dropdown-item">
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      {showModal && <SignInModal onClose={() => setShowModal(false)} />}
      {showAddFunds && (
        <AddFundsModal
          onClose={() => setShowAddFunds(false)}
          onSuccess={(added) => {
            /* можно обновить баланс, если нужно */
          }}
        />
      )}
    </>
  );
};

export default Navbar;
