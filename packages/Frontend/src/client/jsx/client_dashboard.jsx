import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { listMyBookings } from "../api/bookings";
import { getCurrentUser } from "../api/auth";
import {
  listAddresses,
  createAddress,
  deleteAddress,
  makeAddressDefault,
} from "../api/addresses";
import "../css/client_dashboard.css";


// NOTE: MOCK_ACTIVE_BOOKING and MOCK_RECENT_SERVICES used to be hardcoded
// here. Both sections below are now driven by GET /bookings (see
// client/api/bookings.js) via the `bookings` state loaded in
// ClientDashboard(). The greeting name and Saved Addresses are now real
// too (GET /me and GET/POST/DELETE /addresses). Left as mock, on
// purpose, per project decision: MOCK_PENDING_REVIEW, MOCK_MEMBERSHIP,
// MOCK_WARRANTIES — rating/review and loyalty-tier features that are a
// separate piece of work.

const MOCK_PENDING_REVIEW = {
  serviceName: "AC repair",
  technicianName: "Arif M.",
};

const MOCK_MEMBERSHIP = {
  completed: 8,
  target: 10,
  tiers: ["Bronze", "Silver", "Gold"],
  currentTier: "Silver",
};

// Empty array -> warranty section hidden entirely.
const MOCK_WARRANTIES = [
  {
    id: 1,
    name: "AC Repair",
    invoice: "#DFX1248",
    daysLeft: 23,
    status: "Active",
  },
  {
    id: 2,
    name: "Plumbing Fix",
    invoice: "#DFX1198",
    daysLeft: 15,
    status: "Active",
  },
  {
    id: 3,
    name: "Electrical Repair",
    invoice: "#DFX1130",
    daysLeft: 5,
    status: "Expiring Soon",
  },
];

const REFERRAL_CODE = "RAHIM100";

/* ---------------------------------------------------------------------- */

function ClientDashboard() {
  const [rating, setRating] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: "", detail: "" });
  const [addingAddress, setAddingAddress] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    listMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));

    getCurrentUser()
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));

    listAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => setAddresses([]));
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.label.trim() || !newAddress.detail.trim()) return;

    setAddingAddress(true);
    try {
      const { data } = await createAddress(newAddress);
      setAddresses((prev) => [data, ...prev]);
      setNewAddress({ label: "", detail: "" });
      setShowAddForm(false);
    } catch {
      /* keep the form open so the user can retry */
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAddress(id);
    } catch {
      // Re-sync on failure rather than leaving stale UI.
      listAddresses()
        .then(({ data }) => setAddresses(data))
        .catch(() => {});
    }
  };

  const handleMakeDefault = async (id) => {
    try {
      await makeAddressDefault(id);
      const { data } = await listAddresses();
      setAddresses(data);
    } catch {
      /* no-op — UI just won't reflect the change */
    }
  };

  // "Active" = the most recent booking that isn't finished yet — any
  // stage from "waiting for a technician" through "technician working
  // on it right now" counts. Bookings are returned newest-first by the
  // backend.
  const activeBooking = bookings.find(
    (b) => b.status !== "completed" && b.status !== "cancelled",
  );

  // Everything else (completed/cancelled) goes in "Recent Services".
  const recentServices = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );

  const hasActiveBooking = Boolean(activeBooking);
  const hasPendingReview = Boolean(MOCK_PENDING_REVIEW);
  const hasRecentServices = recentServices.length > 0;
  const hasWarranties = MOCK_WARRANTIES.length > 0;

  // Full 6-stage progress, matching TechnicianBookingController's stages
  // (pending -> accepted -> on_the_way -> arrived -> in_progress -> completed).
  const STAGE_ORDER = [
    "pending",
    "accepted",
    "on_the_way",
    "arrived",
    "in_progress",
    "completed",
  ];
  const activeStageIndex = activeBooking
    ? STAGE_ORDER.indexOf(activeBooking.status)
    : -1;

  const activeBookingSteps = activeBooking
    ? [
        { label: "Booked" },
        { label: "Assigned" },
        { label: "On The Way" },
        { label: "Arrived" },
        { label: "Working" },
        { label: "Completed" },
      ].map((step, idx) => ({
        ...step,
        status:
          idx < activeStageIndex
            ? "done"
            : idx === activeStageIndex
              ? "current"
              : "upcoming",
      }))
    : [];

  return (
    <div className="client-dashboard">
      <Header variant="app" />

      <div className="dashboard-container">
        {/* ---------------- Greeting ---------------- */}
        <section className="greeting">
          <h1>
            Hi {user?.name || "there"},<br />
            how can we help your home today?
          </h1>
          <span className="membership-badge">🏅 {MOCK_MEMBERSHIP.currentTier} Member</span>
        </section>

        {/* ---------------- Quick actions ---------------- */}
        <section className="quick-actions">
          <Link to="/services" className="action-card action-card--primary">
            <span className="action-card__icon">+</span>
            <div>
              <h3>Book a New Fix</h3>
              <p>Find experts and book instantly</p>
            </div>
          </Link>

          {hasActiveBooking ? (
            <Link
              to={`/booking-tracking?bookingId=${activeBooking.id}`}
              className="action-card"
            >
              <span className="action-card__icon action-card__icon--outline">
                📍
              </span>
              <div>
                <h3>Track Active Service</h3>
                <p>See technician location and live status</p>
              </div>
            </Link>
          ) : (
            <div className="action-card is-disabled" aria-disabled="true">
              <span className="action-card__icon action-card__icon--outline">
                📍
              </span>
              <div>
                <h3>Track Active Service</h3>
                <p>No active booking right now</p>
              </div>
            </div>
          )}

          <Link
            to={
              hasRecentServices
                ? `/checkout?rebook=${recentServices[0].id}`
                : "/services"
            }
            className="action-card"
          >
            <span className="action-card__icon action-card__icon--outline">
              🔄
            </span>
            <div>
              <h3>Rebook Last Service</h3>
              <p>Book the same service again in one tap</p>
            </div>
          </Link>
        </section>

        {/* ---------------- Active booking (conditional) ---------------- */}
        {hasActiveBooking && (
          <section className="card active-booking">
            <h2>Your Active Booking</h2>
            <div className="active-booking__row">
              <div className="active-booking__technician">
                <div className="avatar-placeholder" aria-hidden="true" />
                <div>
                  <p className="technician-name">
                    {activeBooking.technician?.name ||
                      "Finding a technician..."}
                  </p>
                  <p className="technician-role">
                    {activeBooking.service_name}
                  </p>
                  <p className="technician-eta">
                    {activeBooking.status === "pending" &&
                      "Waiting for a technician to accept"}
                    {activeBooking.status === "accepted" &&
                      "Technician assigned — getting ready"}
                    {activeBooking.status === "on_the_way" &&
                      "Technician is on the way"}
                    {activeBooking.status === "arrived" &&
                      "Technician has arrived"}
                    {activeBooking.status === "in_progress" &&
                      "Work in progress"}
                  </p>
                  <p className="technician-vehicle">
                    📍 {activeBooking.address}
                  </p>
                </div>
              </div>

              <div className="progress-steps">
                {activeBookingSteps.map((step, idx) => (
                  <div
                    key={step.label}
                    className={`progress-step progress-step--${step.status}`}
                  >
                    <div className="progress-step__dot" />
                    <p className="progress-step__label">{step.label}</p>
                    {step.time && (
                      <p className="progress-step__time">{step.time}</p>
                    )}
                    {idx < activeBookingSteps.length - 1 && (
                      <div className="progress-step__line" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- Rate last service + Membership ---------------- */}
        <section className="two-col">
          {hasPendingReview ? (
            <div className="card rate-service">
              <h2>Rate Your Last Service</h2>
              <div className="rate-service__row">
                <div
                  className="image-placeholder image-placeholder--sm"
                  aria-hidden="true"
                />
                <p>
                  How was your {MOCK_PENDING_REVIEW.serviceName} with{" "}
                  {MOCK_PENDING_REVIEW.technicianName}?
                </p>
              </div>
              <div className="rate-service__stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-btn ${n <= rating ? "is-filled" : ""}`}
                    onClick={() => setRating(n)}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
                <button type="button" className="btn btn--primary btn--sm">
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="card empty-card">
              <p>No pending reviews right now.</p>
            </div>
          )}

          <div className="card membership-progress">
            <div className="membership-progress__header">
              <h2>
                {MOCK_MEMBERSHIP.target - MOCK_MEMBERSHIP.completed > 0
                  ? `You're ${MOCK_MEMBERSHIP.target - MOCK_MEMBERSHIP.completed} services away from Gold Member`
                  : "You've reached Gold Member!"}
              </h2>
            </div>
            <div className="membership-progress__meta">
              <span>
                {MOCK_MEMBERSHIP.completed} of {MOCK_MEMBERSHIP.target} services
                completed
              </span>
              <span>
                {Math.round(
                  (MOCK_MEMBERSHIP.completed / MOCK_MEMBERSHIP.target) * 100,
                )}
                %
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar__fill"
                style={{
                  width: `${Math.round((MOCK_MEMBERSHIP.completed / MOCK_MEMBERSHIP.target) * 100)}%`,
                }}
              />
            </div>
            <div className="tier-row">
              {MOCK_MEMBERSHIP.tiers.map((tier) => (
                <div
                  key={tier}
                  className={`tier-badge ${tier === MOCK_MEMBERSHIP.currentTier ? "is-current" : ""}`}
                >
                  {tier}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Recent services ---------------- */}
        <section className="section-block">
          <div className="section-block__header">
            <h2>Recent Services</h2>
            {hasRecentServices && <Link to="/bookings">View All</Link>}
          </div>

          {loadingBookings ? (
            <p className="empty-text">Loading...</p>
          ) : hasRecentServices ? (
            <div className="recent-services-grid">
              {recentServices.map((service) => (
                <div key={service.id} className="card recent-service-card">
                  <div
                    className="image-placeholder image-placeholder--sm"
                    aria-hidden="true"
                  />
                  <p className="recent-service-card__name">
                    {service.service_name}
                  </p>
                  <p className="recent-service-card__meta">
                    {new Date(service.created_at).toLocaleDateString()}
                  </p>
                  <p className="recent-service-card__meta">
                    {service.technician?.name || "—"}
                  </p>
                  <span
                    className={`status-badge status-badge--${
                      service.status === "completed" ? "success" : "muted"
                    }`}
                  >
                    {service.status === "completed" ? "Completed" : "Cancelled"}
                  </span>
                  <Link to="/services" className="btn btn--outline-sm">
                    Book Again
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card empty-card empty-card--large">
              <div
                className="image-placeholder image-placeholder--sm"
                aria-hidden="true"
              />
              <p>
                No bookings yet. Book your first service and it&apos;ll show up
                here.
              </p>
              <Link to="/services" className="btn btn--primary btn--sm">
                Book Now
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- Warranty + Addresses ---------------- */}
        <section className="two-col">
          {hasWarranties && (
            <div className="card warranty-tracker">
              <h2>Warranty Tracker</h2>
              {MOCK_WARRANTIES.map((w) => (
                <div key={w.id} className="warranty-row">
                  <div
                    className="image-placeholder image-placeholder--xs"
                    aria-hidden="true"
                  />
                  <div className="warranty-row__info">
                    <p className="warranty-row__name">{w.name}</p>
                    <p className="warranty-row__meta">
                      {w.date} · Invoice {w.invoice}
                    </p>
                  </div>
                  <span className="warranty-row__days">
                    {w.daysLeft} days left
                  </span>
                  <span
                    className={`status-badge status-badge--${
                      w.status === "Active" ? "success" : "warning"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
              <Link to="/warranties" className="link-arrow">
                View All Warranties
              </Link>
            </div>
          )}

          <div className="card addresses">
            <h2>Saved Addresses</h2>
            {addresses.length === 0 && !showAddForm && (
              <p className="empty-text">No saved addresses yet.</p>
            )}
            {addresses.map((addr) => (
              <div key={addr.id} className="address-chip">
                <span className="address-chip__icon">
                  {addr.label === "Home" ? "🏠" : "🏢"}
                </span>
                <div>
                  <p className="address-chip__label">
                    {addr.label}
                    {addr.is_default && (
                      <span className="address-chip__default"> · Default</span>
                    )}
                  </p>
                  <p className="address-chip__detail">{addr.detail}</p>
                </div>
                {!addr.is_default && (
                  <button
                    type="button"
                    className="address-chip__more"
                    onClick={() => handleMakeDefault(addr.id)}
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  className="address-chip__more"
                  aria-label="Delete address"
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            {showAddForm ? (
              <form className="add-address-form" onSubmit={handleAddAddress}>
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office)"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Full address"
                  value={newAddress.detail}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, detail: e.target.value }))
                  }
                />
                <div className="add-address-form__actions">
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    disabled={addingAddress}
                  >
                    {addingAddress ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="add-address-btn"
                onClick={() => setShowAddForm(true)}
              >
                + Add New Address
              </button>
            )}
          </div>
        </section>

        {/* ---------------- Referral ---------------- */}
        <section className="card referral">
          <div
            className="image-placeholder image-placeholder--sm"
            aria-hidden="true"
          />
          <div className="referral__text">
            <h2>
              Invite a friend, both get{" "}
              <span className="text-accent">৳100 off</span>
            </h2>
            <p>Share your referral code and save on your next service.</p>
          </div>
          <div className="referral__code">
            <span>{REFERRAL_CODE}</span>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => navigator.clipboard?.writeText(REFERRAL_CODE)}
            >
              Copy
            </button>
          </div>
        </section>
      </div>

      {/* Floating support button */}
      <button type="button" className="support-fab">
        💬 Need Help?
      </button>

      {/* No footer on this page per project decision — logged-in app pages
          stay footer-free / minimal. */}
    </div>
  );
}

export default ClientDashboard;
