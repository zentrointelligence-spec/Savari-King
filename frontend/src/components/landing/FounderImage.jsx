const FounderImage = ({ className = "", overlay = true }) => (
  <div className={`relative w-full h-full flex items-center justify-center bg-[#f0ebe3] ${className}`}>
    <img
      src="/founder.png"
      alt="Mr. Sundar Mesiadhas - Founder of Ebenezer Tours & Travels"
      className="w-full h-full object-contain object-center"
      onError={(e) => {
        e.currentTarget.src =
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
      }}
    />
    {overlay && (
      <div className="absolute inset-0 bg-gradient-to-t from-forest/65 via-transparent to-transparent pointer-events-none" />
    )}
  </div>
);

export default FounderImage;
