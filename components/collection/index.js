import { useState, useEffect, useRef } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import SliderHandle from "../slider-handle";
import BlurredSliderImage from "../blurred-slider-image";
import BlurredImage from "../blurred-image";

export default function Collection({ title, titleCard, assets }) {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { threshold: 0.2 },

      {
        root: null, // Observes relative to the viewport
        rootMargin: "200px", // Extends detection area by 200px
        threshold: 0.1, // Trigger when at least 10% of the element is visible
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="container mx-auto my-4 flex w-full max-w-3xl flex-col items-center justify-center rounded-[2.25rem] border-2 border-accent bg-darkCard p-3 text-white shadow-cool-shadow sm:rounded-5xl sm:p-4"
    >
      {titleCard ? (
        <BlurredImage
          src={titleCard}
          width={500}
          height={700}
          parentWidth="auto"
          startingColor="#262626"
          alt={`A stylized title image for this set of ${title} themed images`}
        />
      ) : (
        <div className="absinthefull menu-btn-lg menu-text text-3xl">
          <h2 className="book-title">{title}</h2>
        </div>
      )}
      <div className="container mx-auto p-4 flex flex-col justify-center items-center">
        {assets.map((img) => (
          <div
            key={img.title}
            className="w-[90%] max-w-3xl flex flex-col flex-grow items-center"
          >
            <div className="max-w-3xl min-h-[450px] flex flex-col justify-center items-center self-center mt-6 mb-6">
              <h3 className="french-news mt-3 mb-3 self-start text-2xl">
                {img.title}
              </h3>
              <div>
                {isVisible ? (
                  <div className="image-container w-full min-h-[400px] flex justify-center items-center">
                    <ReactCompareSlider
                      position={83}
                      handle={<SliderHandle />}
                      onlyHandleDraggable
                      className="w-full min-h-[400px] image-container" // ✅ Force a minimum height
                      itemOne={
                        <div className="w-full aspect-[3/2] flex items-center justify-center">
                          <BlurredSliderImage
                            src={img.before.imageUrl}
                            alt={img.alt}
                          />
                        </div>
                      }
                      itemTwo={
                        <div className="w-full aspect-[3/2] flex items-center justify-center">
                          <BlurredSliderImage
                            src={img.after.imageUrl}
                            alt={img.alt}
                          />
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="max-w-3xl min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col justify-center items-center self-center mt-6 mb-6">
                    <div className="w-full aspect-[3/2]] bg-gray-200 animate-pulse flex items-center justify-center">
                      <p className="text-gray-600">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="french-news self-start mt-3 whitespace-pre-line">
                {img.quote}
              </h3>
              <h3 className="french-news self-start"> - {img.quotefrom}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
