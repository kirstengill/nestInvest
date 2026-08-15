const GreetingSection = ({ name }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="greeting-section">
      <h1 className="greeting-section__title">
        {getGreeting()}, <span>{name}</span>
      </h1>
      <p className="greeting-section__subtitle">Track your wealth, grow your future.</p>
    </section>
  );
};

export default GreetingSection;
