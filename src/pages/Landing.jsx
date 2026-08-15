import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const opportunities = [
  {
    title: "Real Estate",
    text: "Property-focused opportunities designed for long-term growth and stable returns.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Technology",
    text: "Innovation-driven opportunities in technology and emerging industries.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Agriculture",
    text: "Food and agriculture investments supporting global demand and sustainability.",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Renewable Energy",
    text: "Clean energy and sustainability opportunities for a greener future.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Global Markets",
    text: "Diversified market exposure across economies and sectors worldwide.",
    image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=800&q=80",
  },
];

const features = [
  {
    title: "Simple investing",
    text: "Make investing easier to understand with clear, straightforward opportunities.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Diversified opportunities",
    text: "Explore different investment categories to build a balanced portfolio.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: "Transparent",
    text: "Clearly present important investment information so you can invest with confidence.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Secure",
    text: "Use our secure authentication and account infrastructure to protect your investments.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "$2.1B+", label: "Assets managed" },
  { value: "75K+", label: "Investors" },
  { value: "10.2%", label: "Illustrative annualized return*" },
  { value: "15+", label: "Years of experience" },
];

const holdings = [
  { name: "Global Growth Fund", percent: "35%", color: "#10b981" },
  { name: "Green Energy Fund", percent: "25%", color: "#34d399" },
  { name: "Real Estate Fund", percent: "20%", color: "#6ee7b7" },
  { name: "Technology Fund", percent: "20%", color: "#a7f3d0" },
];

const chartPoints = "0,80 30,70 60,75 90,55 120,60 150,40 180,45 210,20 240,25 270,10";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__inner">
          <Link to="/" className="landing-logo">
            <span className="landing-logo__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </span>
            <span className="landing-logo__text">nestInvest</span>
          </Link>

          <div className="landing-nav__links">
            <Link to="#opportunities" className="landing-nav__link">Invest</Link>
            <Link to="#features" className="landing-nav__link">Why nestInvest</Link>
            <Link to="#about" className="landing-nav__link">About</Link>
          </div>

          <div className={`landing-nav__mobile ${mobileMenuOpen ? "landing-nav__mobile--open" : ""}`}>
            <div className="landing-nav__mobile-links">
              <Link to="#opportunities" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Invest</Link>
              <Link to="#features" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Why nestInvest</Link>
              <Link to="#about" className="landing-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </div>
            <div className="landing-nav__mobile-actions">
              <Link to="/signin" className="landing-nav__login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="landing-nav__cta" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
            </div>
          </div>

          <button
            className={`landing-nav__toggle ${mobileMenuOpen ? "landing-nav__toggle--open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2070&q=80"
            alt="Mountain landscape representing growth and long-term success"
            className="hero__img"
          />
          <div className="hero__overlay"></div>
        </div>

        <div className="hero__content">
          <div className="hero__text">
            <div className="hero__brand">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              nestInvest
            </div>
            <h1 className="hero__title">
              Invest today.<br />
              <span className="text-green-400">Grow tomorrow.</span>
            </h1>
            <p className="hero__subtitle">
              Build your future with simple, transparent investment opportunities designed for everyday investors.
            </p>
            <div className="hero__actions">
              <Link to="/signup" className="btn btn--primary">Start investing</Link>
              <Link to="#opportunities" className="btn btn--secondary">Explore investments</Link>
            </div>
          </div>

          <div className="hero__card">
            <div className="glass-card">
              <div className="glass-card__header">
                <span className="glass-card__label">Portfolio</span>
                <span className="glass-card__live">
                  <span className="glass-card__dot"></span>
                  Live
                </span>
              </div>

              <div className="glass-card__balance">
                <span className="glass-card__amount">$41,250.30</span>
                <span className="glass-card__change">+8.62%</span>
              </div>

              <div className="glass-card__chart">
                <svg viewBox="0 0 270 80" className="glass-card__chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M0,80 L0,80 L${chartPoints} L270,80 Z`}
                    fill="url(#chartGradient)"
                  />
                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="chart-line"
                  />
                </svg>
              </div>

              <div className="glass-card__holdings">
                {holdings.map((holding) => (
                  <div key={holding.name} className="holding">
                    <div className="holding__left">
                      <span className="holding__dot" style={{ backgroundColor: holding.color }}></span>
                      <span className="holding__name">{holding.name}</span>
                    </div>
                    <span className="holding__percent">{holding.percent}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats__inner">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="section__inner">
          <h2 className="section__title">Invest with purpose.<br />Grow with confidence.</h2>
          <div className="features__grid">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="opportunities" className="opportunities">
        <div className="section__inner">
          <h2 className="section__title">Investment Opportunities</h2>
          <p className="section__subtitle">
            Explore diverse categories designed to help you build long-term wealth.
          </p>
          <div className="opportunities__grid">
            {opportunities.map((opp, index) => (
              <div
                key={opp.title}
                className="opp-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="opp-card__img">
                  <img src={opp.image} alt={opp.title} loading="lazy" />
                </div>
                <div className="opp-card__body">
                  <h3 className="opp-card__title">{opp.title}</h3>
                  <p className="opp-card__text">{opp.text}</p>
                  <Link to="#opportunities" className="opp-card__link">
                    Learn more
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>nestInvest</span>
          </div>
          <p className="landing-footer__text">
            Illustrative statistics and portfolio data shown on this page are for demonstration purposes only and do not represent actual investment performance. Investing involves risk, including potential loss of principal.
          </p>
          <div className="landing-footer__links">
            <Link to="/signin" className="landing-footer__link">Log in</Link>
            <Link to="/signup" className="landing-footer__link">Get started</Link>
          </div>
          <p className="landing-footer__copy">nestInvest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
