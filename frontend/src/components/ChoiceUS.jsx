import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { whyChooseFeatures } from "../data/whyChooseFeatures";

import "swiper/css";

// Update feature titles, descriptions, and icons here to change the "Why Choose Us" carousel.
const InsuranceSlider = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-20 overflow-hidden">
      {/* Change the carousel eyebrow and heading here. */}
      {/* Heading */}
      <div className="text-center mb-14 px-6">
        <p className="text-blue-600 uppercase tracking-[4px] text-sm font-semibold mb-4">
          Why Choose Us
        </p>
        <h2 className="text-black text-3xl md:text-3xl font-bold leading-tight">
          Trusted Digital Insurance Experience
        </h2>
      </div>

      {/* Slider */}
      <div className="w-full">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={"auto"}
          centeredSlides={true}
          loop={true} // Enables infinite loop
          spaceBetween={30}
          speed={1200} // Speed of the sliding transition (Premium feel)
          autoplay={{
            delay: 2500, // Time it stays on one slide before moving
            disableOnInteraction: false,
          }}
          className="!overflow-visible"
        >
          {/* Duplicate the array items to ensure the loop never "stacks" or gaps */}
          {[...whyChooseFeatures, ...whyChooseFeatures].map((item, index) => (
            <SwiperSlide
              key={index}
              className="!w-[82vw] sm:!w-[320px] md:!w-[380px]" // Adjusted width for better focus
            >
              {({ isActive }) => (
                <div
                  className={`
                    rounded-[32px]
                    border
                    p-6
                    md:p-10
                    min-h-[260px]
                    sm:min-h-[280px]
                    bg-white
                    flex
                    flex-col
                    justify-between
                    transition-all
                    duration-700
                    ease-in-out
                    ${
                      isActive
                        ? "border-blue-500 scale-100 shadow-2xl z-10" // Focused Card
                        : "border-slate-200 scale-[0.88] opacity-100 shadow-md" // Side Cards
                    }
                  `}
                >
                  {/* Top: Icon and Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      {item.icon}
                    </div>
                    {isActive && (
                      <span className="text-[10px] text-blue-600 border border-blue-200 px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-blue-50/50">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Middle: Content */}
                  <div>
                    <h3 className={`text-xl font-bold mb-3 transition-colors ${isActive ? 'text-black' : 'text-slate-400'}`}>
                      {item.title}
                    </h3>
                    <p className={`leading-relaxed text-sm transition-colors ${isActive ? 'text-slate-600' : 'text-slate-300'}`}>
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom: Link */}
                  <button
                    type="button"
                    onClick={() => navigate(`/why-choose/${item.slug}`)}
                    className={`inline-flex cursor-pointer items-center gap-2 text-sm font-bold transition-all hover:text-blue-700 ${isActive ? 'text-blue-600' : 'text-slate-300'}`}
                  >
                    Learn More {isActive ? '→' : ''}
                  </button>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default InsuranceSlider;
